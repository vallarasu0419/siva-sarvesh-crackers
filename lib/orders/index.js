import { query, withTransaction, getPool } from '../db/index.js';
import { calculateOrderTotals, calculateLineAmount, meetsMinimumOrder } from '../calculations/index.js';
import { validateCustomer, validateOrderItems } from '../validation/index.js';
import { getActiveProductsByIds } from '../products/index.js';
import { checkPromotionEligibility, findPromotionForUpdate, findPromotionByCode, toCalculationPromotion } from '../promotions/index.js';
import { consumeVerificationToken } from '../otp/index.js';
import { AppError } from '../api/errors.js';
import { INITIAL_ORDER_STATUS, isValidStatus, ORDER_STATUSES } from './status.js';
import { MIN_ORDER_AMOUNT, PACKING_CHARGE_PERCENTAGE, ORDER_NUMBER_PREFIX, ADMIN_PAGE_SIZE } from '../../constants/config.js';
import { sendMailSafely, getAdminEmail } from '../email/index.js';
import { orderPlacedEmail } from '../../emails/orderPlacedEmail.js';
import { adminNewOrderEmail } from '../../emails/adminNewOrderEmail.js';
import { orderStatusUpdatedEmail } from '../../emails/orderStatusUpdatedEmail.js';

/**
 * Prices validated items using CURRENT database prices.
 * Throws if any product is missing or inactive. Never trusts client prices.
 */
export async function priceItems(connection, items) {
  const products = await getActiveProductsByIds(connection, items.map((item) => item.productId));
  const byId = new Map(products.map((product) => [product.id, product]));

  return items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) {
      throw new AppError(400, 'Some selected products are no longer available. Please review your order.');
    }
    return {
      productId: product.id,
      productCode: product.product_code,
      productName: product.product_name,
      tamilName: product.tamil_name,
      unit: product.unit,
      originalPrice: Number(product.original_price),
      sellingPrice: Number(product.selling_price),
      quantity: item.quantity,
      amount: calculateLineAmount(Number(product.selling_price), item.quantity),
    };
  });
}

/**
 * Server-side quote (used by the promotion code "Apply" button).
 * Returns the authoritative totals and the promotion result.
 */
export async function quoteOrder({ items: rawItems, promotionCode }) {
  const itemCheck = validateOrderItems(rawItems);
  if (!itemCheck.valid) throw new AppError(400, itemCheck.error);

  const connection = await getPool().getConnection();
  try {
    const pricedItems = await priceItems(connection, itemCheck.items);
    const baseTotals = calculateOrderTotals({ items: pricedItems, packingChargePercentage: PACKING_CHARGE_PERCENTAGE });

    let promotion = null;
    let promotionMessage = null;
    if (promotionCode) {
      const found = await findPromotionByCode(promotionCode);
      const eligibility = checkPromotionEligibility(found, baseTotals.subtotal);
      if (!eligibility.ok) throw new AppError(400, eligibility.message);
      promotion = found;
      promotionMessage = `Promotion code ${found.code} applied.`;
    }

    const totals = calculateOrderTotals({
      items: pricedItems,
      promotion: promotion ? toCalculationPromotion(promotion) : null,
      packingChargePercentage: PACKING_CHARGE_PERCENTAGE,
    });
    return { totals, promotionCode: promotion?.code || null, message: promotionMessage };
  } finally {
    connection.release();
  }
}

/** Atomically generates SSC-YYYYMMDD-0001 style numbers (IST date). */
async function generateOrderNumber(connection) {
  const istDate = new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await connection.execute(
    `INSERT INTO order_sequences (seq_date, \`last_value\`) VALUES (?, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE \`last_value\` = LAST_INSERT_ID(\`last_value\` + 1)`,
    [istDate]
  );
  const [[{ value }]] = await connection.query('SELECT LAST_INSERT_ID() AS value');
  return `${ORDER_NUMBER_PREFIX}-${istDate.replace(/-/g, '')}-${String(value).padStart(4, '0')}`;
}

/**
 * Creates an order in a single transaction:
 * verify email token -> price items -> promotion -> totals -> minimum check
 * -> orders -> order_items -> order_status_history. Rolls back on any failure.
 * Emails are sent after commit and never undo the order.
 */
export async function createOrder({ customer: rawCustomer, items: rawItems, promotionCode, verificationToken }) {
  const customerCheck = validateCustomer(rawCustomer);
  if (!customerCheck.valid) throw new AppError(400, 'Please correct the highlighted fields.', { fields: customerCheck.errors });
  const itemCheck = validateOrderItems(rawItems);
  if (!itemCheck.valid) throw new AppError(400, itemCheck.error);

  const customer = customerCheck.value;

  const { orderId } = await withTransaction(async (connection) => {
    const tokenOk = await consumeVerificationToken(connection, customer.email, verificationToken);
    if (!tokenOk) {
      throw new AppError(400, 'Email verification has expired. Please verify your email with a new OTP.', { reason: 'VERIFICATION_REQUIRED' });
    }

    const pricedItems = await priceItems(connection, itemCheck.items);
    const baseTotals = calculateOrderTotals({ items: pricedItems, packingChargePercentage: PACKING_CHARGE_PERCENTAGE });

    let promotion = null;
    if (promotionCode) {
      promotion = await findPromotionForUpdate(connection, promotionCode);
      const eligibility = checkPromotionEligibility(promotion, baseTotals.subtotal);
      if (!eligibility.ok) throw new AppError(400, eligibility.message);
    }

    const totals = calculateOrderTotals({
      items: pricedItems,
      promotion: promotion ? toCalculationPromotion(promotion) : null,
      packingChargePercentage: PACKING_CHARGE_PERCENTAGE,
    });

    if (!meetsMinimumOrder(totals.totalAmount, MIN_ORDER_AMOUNT)) {
      throw new AppError(400, `Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add more products to continue.`);
    }

    const orderNumber = await generateOrderNumber(connection);
    const [orderResult] = await connection.execute(
      `INSERT INTO orders (order_number, customer_name, customer_mobile, customer_email, state, city, address,
         subtotal, promotion_code_id, promotion_code, promotion_discount, packing_charge_percentage, packing_charge,
         round_off, total_amount, status, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        orderNumber, customer.name, customer.mobile, customer.email, customer.state, customer.city, customer.address,
        totals.subtotal, promotion?.id || null, promotion?.code || null, totals.promotionDiscount,
        totals.packingChargePercentage, totals.packingCharge, totals.roundOff, totals.totalAmount, INITIAL_ORDER_STATUS,
      ]
    );
    const newOrderId = orderResult.insertId;

    const itemPlaceholders = pricedItems.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const itemParams = pricedItems.flatMap((item) => [
      newOrderId, item.productId, item.productCode, item.productName, item.tamilName, item.unit,
      item.originalPrice, item.sellingPrice, item.quantity, item.amount,
    ]);
    await connection.execute(
      `INSERT INTO order_items (order_id, product_id, product_code, product_name, tamil_name, unit,
         original_price, unit_price, quantity, amount) VALUES ${itemPlaceholders}`,
      itemParams
    );

    await connection.execute(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_by_label, remarks)
       VALUES (?, NULL, ?, NULL, 'CUSTOMER', 'Order placed on website after email OTP verification')`,
      [newOrderId, INITIAL_ORDER_STATUS]
    );

    if (promotion) {
      await connection.execute('UPDATE promotion_codes SET used_count = used_count + 1 WHERE id = ?', [promotion.id]);
    }
    return { orderId: newOrderId };
  });

  const { order, items } = await getOrderWithItems(orderId);
  await Promise.all([
    sendMailSafely({ to: order.customer_email, ...orderPlacedEmail(order, items) }, `order confirmation ${order.order_number}`),
    sendMailSafely({ to: getAdminEmail(), ...adminNewOrderEmail(order, items) }, `admin notification ${order.order_number}`),
  ]);

  return { order, items };
}

export async function getOrderWithItems(orderId) {
  const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (!order) return { order: null, items: [] };
  const items = await query(
    `SELECT id, product_id, product_code, product_name, tamil_name, unit, original_price, unit_price, quantity, amount
       FROM order_items WHERE order_id = ? ORDER BY id`,
    [orderId]
  );
  return { order, items };
}

export async function getOrderDetails(orderId) {
  const { order, items } = await getOrderWithItems(orderId);
  if (!order) return null;
  const history = await query(
    `SELECT h.id, h.old_status, h.new_status, h.remarks, h.created_at,
            COALESCE(a.name, h.changed_by_label) AS changed_by_name
       FROM order_status_history h LEFT JOIN admins a ON a.id = h.changed_by
      WHERE h.order_id = ? ORDER BY h.created_at, h.id`,
    [orderId]
  );
  return { order, items, history };
}

const ORDER_SORTS = {
  newest: 'o.created_at DESC, o.id DESC',
  oldest: 'o.created_at ASC, o.id ASC',
  amount_desc: 'o.total_amount DESC, o.id DESC',
  amount_asc: 'o.total_amount ASC, o.id ASC',
};

/** Paginated, filtered admin order list. */
export async function listOrders(filters = {}) {
  const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(5, Number.parseInt(filters.pageSize, 10) || ADMIN_PAGE_SIZE));
  const where = [];
  const params = [];
  const like = (value) => `%${String(value).trim().slice(0, 100)}%`;

  if (filters.orderNumber) { where.push('o.order_number LIKE ?'); params.push(like(filters.orderNumber)); }
  if (filters.name) { where.push('o.customer_name LIKE ?'); params.push(like(filters.name)); }
  if (filters.mobile) { where.push('o.customer_mobile LIKE ?'); params.push(like(filters.mobile)); }
  if (filters.email) { where.push('o.customer_email LIKE ?'); params.push(like(filters.email)); }
  if (filters.city) { where.push('o.city = ?'); params.push(String(filters.city).slice(0, 80)); }
  if (filters.status && isValidStatus(filters.status)) { where.push('o.status = ?'); params.push(filters.status); }
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) { where.push('o.created_at >= ?'); params.push(`${filters.from} 00:00:00`); }
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to)) { where.push('o.created_at <= ?'); params.push(`${filters.to} 23:59:59`); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = ORDER_SORTS[filters.sort] || ORDER_SORTS.newest;
  const offset = (page - 1) * pageSize;

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM orders o ${whereSql}`, params);
  // LIMIT/OFFSET are validated integers, inlined because some MariaDB versions reject them as prepared params.
  const orders = await query(
    `SELECT o.id, o.order_number, o.customer_name, o.customer_mobile, o.customer_email, o.city,
            o.total_amount, o.status, o.created_at
       FROM orders o ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ${pageSize} OFFSET ${offset}`,
    params
  );
  return { orders, page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getDashboardStats() {
  const rows = await query('SELECT status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS amount FROM orders GROUP BY status');
  const stats = { total: 0, totalAmount: 0 };
  ORDER_STATUSES.forEach((status) => { stats[status] = 0; });
  rows.forEach((row) => {
    stats[row.status] = Number(row.count);
    stats.total += Number(row.count);
    if (row.status !== 'REJECTED') stats.totalAmount += Number(row.amount);
  });
  const recent = await query(
    `SELECT id, order_number, customer_name, city, total_amount, status, created_at
       FROM orders ORDER BY created_at DESC, id DESC LIMIT 5`
  );
  return { stats, recent };
}

/**
 * Changes status + writes history in one transaction, then emails the customer.
 */
export async function updateOrderStatus({ orderId, newStatus, admin, remarks }) {
  if (!isValidStatus(newStatus)) throw new AppError(400, 'Choose a valid order status.');
  const cleanRemarks = remarks ? String(remarks).trim().slice(0, 500) : null;

  const previousStatus = await withTransaction(async (connection) => {
    const [rows] = await connection.execute('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    const current = rows[0];
    if (!current) throw new AppError(404, 'Order not found.');
    if (current.status === newStatus) throw new AppError(400, `This order is already ${newStatus.replace('_', ' ').toLowerCase()}.`);

    await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [newStatus, orderId]);
    await connection.execute(
      `INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, changed_by_label, remarks)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, current.status, newStatus, admin.id, admin.name || admin.email, cleanRemarks]
    );
    return current.status;
  });

  const details = await getOrderDetails(orderId);
  const emailSent = await sendMailSafely(
    { to: details.order.customer_email, ...orderStatusUpdatedEmail(details.order, previousStatus, cleanRemarks) },
    `status update ${details.order.order_number}`
  );
  return { ...details, previousStatus, emailSent };
}
