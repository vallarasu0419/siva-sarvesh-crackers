import { emailLayout, heading, paragraph, keyValueTable, socialLinksText } from './layout.js';
import { STATUS_LABELS } from '../lib/orders/status.js';
import { formatRupees } from '../lib/format/index.js';

const STATUS_MESSAGES = {
  PENDING: 'Your order is pending confirmation. Our team will contact you shortly.',
  PICKED_UP: 'Your order has been packed and picked up for delivery.',
  DELIVERED: 'Your order has been delivered. Have a safe and happy Diwali!',
  REJECTED: 'We are unable to process this order. Our team will contact you with details.',
};

export function orderStatusUpdatedEmail(order, previousStatus, remarks) {
  const rows = [
    ['Order Number', order.order_number],
    ['Previous Status', STATUS_LABELS[previousStatus] || previousStatus],
    ['Current Status', STATUS_LABELS[order.status] || order.status],
    ['Order Amount', formatRupees(order.total_amount)],
  ];
  if (remarks) rows.push(['Note from us', remarks]);

  const bodyHtml = `${heading('Your order status has been updated')}
${paragraph(`Dear ${order.customer_name},`)}
${paragraph(STATUS_MESSAGES[order.status] || '')}
${keyValueTable(rows)}
${paragraph('Thank you for ordering from Siva Sarvesh Crackers.')}`;

  return {
    subject: `Order ${order.order_number}: ${STATUS_LABELS[order.status]}`,
    html: emailLayout({ title: 'Order status updated', preheader: `Your order is now ${STATUS_LABELS[order.status]}`, bodyHtml }),
    text: `Your order status has been updated.\n\n${rows.map(([l, v]) => `${l}: ${v}`).join('\n')}\n\nThank you for ordering from Siva Sarvesh Crackers.\n\n${socialLinksText()}`,
  };
}
