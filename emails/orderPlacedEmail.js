import { emailLayout, heading, paragraph, keyValueTable, itemsTable, totalsTable, itemsText, totalsText, socialLinksText } from './layout.js';
import { formatDateTime } from '../lib/format/index.js';
import { BUSINESS } from '../constants/config.js';

export function orderPlacedEmail(order, items) {
  const contact = BUSINESS.phones.map((p) => p.number).join(', ');
  const bodyHtml = `${heading('Order placed successfully')}
${paragraph(`Dear ${order.customer_name}, thank you for your order. Our team will call or WhatsApp you within 24 hours to confirm availability, payment and delivery.`)}
${keyValueTable([
  ['Order Number', order.order_number],
  ['Order Date', formatDateTime(order.created_at)],
  ['Mobile', order.customer_mobile],
  ['Delivery Address', `${order.address}, ${order.city}, ${order.state}`],
])}
${itemsTable(items)}
${totalsTable(order)}
${paragraph(`Questions about your order? Call us on ${contact}.`)}`;

  return {
    subject: `Order placed successfully - ${order.order_number}`,
    html: emailLayout({ title: 'Order placed', preheader: `Your order ${order.order_number} has been received.`, bodyHtml }),
    text: `Order placed successfully\n\nOrder Number: ${order.order_number}\nOrder Date: ${formatDateTime(order.created_at)}\nAddress: ${order.address}, ${order.city}, ${order.state}\n\n${itemsText(items)}\n\n${totalsText(order)}\n\nContact: ${contact}\n\n${socialLinksText()}`,
  };
}
