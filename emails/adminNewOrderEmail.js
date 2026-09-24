import { emailLayout, heading, keyValueTable, itemsTable, totalsTable, itemsText, totalsText, socialLinksText } from './layout.js';
import { formatDateTime } from '../lib/format/index.js';
import { SITE_URL } from '../constants/config.js';

export function adminNewOrderEmail(order, items) {
  const adminLink = `${SITE_URL}/admin/orders/${order.id}`;
  const bodyHtml = `${heading(`New order received - ${order.order_number}`)}
${keyValueTable([
  ['Order Number', order.order_number],
  ['Order Date', formatDateTime(order.created_at)],
  ['Customer Name', order.customer_name],
  ['Mobile', order.customer_mobile],
  ['Email', order.customer_email],
  ['State', order.state],
  ['City', order.city],
  ['Address', order.address],
])}
${itemsTable(items)}
${totalsTable(order)}
<p style="margin:18px 0 0;"><a href="${adminLink}" style="display:inline-block;padding:10px 18px;background:#1B1446;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:bold;">Open order in admin</a></p>`;

  return {
    subject: `New order ${order.order_number} - ${order.customer_name} - ${order.city}`,
    html: emailLayout({ title: 'New order', preheader: `New order from ${order.customer_name}`, bodyHtml }),
    text: `New Order Received\n\nOrder Number: ${order.order_number}\nCustomer: ${order.customer_name}\nMobile: ${order.customer_mobile}\nEmail: ${order.customer_email}\nState: ${order.state}\nCity: ${order.city}\nAddress: ${order.address}\n\n${itemsText(items)}\n\n${totalsText(order)}\n\n${adminLink}\n\n${socialLinksText()}`,
  };
}
