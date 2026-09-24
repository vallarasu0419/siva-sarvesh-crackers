import { BUSINESS, SITE_NAME, SITE_URL } from '../constants/config.js';
import { socialNetworks } from '../constants/socialLinks.js';
import { escapeHtml } from '../lib/security/escape.js';
import { formatRupees } from '../lib/format/index.js';

/**
 * Shared, email-safe HTML frame (tables + inline styles).
 * Icon fonts do not load in most email clients, so social links are
 * rendered as coloured, labelled buttons using the central socialLinks config.
 */
const COLORS = { night: '#1B1446', gold: '#F5A300', red: '#C8102E', text: '#241F3D', muted: '#6B6485', line: '#E7E2F3', bg: '#F6F3FB' };

export function socialButtonsHtml() {
  return socialNetworks
    .map(
      (network) =>
        `<a href="${network.url}" style="display:inline-block;margin:0 4px 8px;padding:8px 14px;border-radius:20px;background:${network.color};color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;font-family:Arial,sans-serif;">${network.label}</a>`
    )
    .join('');
}

export function socialLinksText() {
  return socialNetworks.map((n) => `${n.label}: ${n.url}`).join('\n');
}

export function emailLayout({ title, preheader = '', bodyHtml }) {
  const phones = BUSINESS.phones.map((p) => escapeHtml(p.number)).join(' &nbsp;|&nbsp; ');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${COLORS.bg};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.bg};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:${COLORS.text};">
  <tr><td style="background:${COLORS.night};padding:22px 28px;border-bottom:4px solid ${COLORS.gold};">
    <div style="font-size:22px;font-weight:bold;color:#ffffff;">${SITE_NAME}</div>
    <div style="font-size:13px;color:${COLORS.gold};margin-top:4px;">${escapeHtml(BUSINESS.tamilName)} &middot; Sivakasi</div>
  </td></tr>
  <tr><td style="padding:28px;font-size:15px;line-height:1.6;">
    ${bodyHtml}
  </td></tr>
  <tr><td style="padding:20px 28px;background:#FBFAFE;border-top:1px solid ${COLORS.line};text-align:center;font-size:13px;color:${COLORS.muted};line-height:1.6;">
    <div style="margin-bottom:10px;">${socialButtonsHtml()}</div>
    <div>${BUSINESS.addressLines.map(escapeHtml).join(' ')}</div>
    <div>${phones}</div>
    <div><a href="${SITE_URL}" style="color:${COLORS.red};">${SITE_URL.replace(/^https?:\/\//, '')}</a></div>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function heading(text) {
  return `<h1 style="margin:0 0 12px;font-size:20px;color:${COLORS.night};">${escapeHtml(text)}</h1>`;
}

export function keyValueTable(rows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 18px;font-size:14px;">
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:6px 0;color:${COLORS.muted};width:40%;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:bold;vertical-align:top;">${escapeHtml(value)}</td></tr>`
  )
  .join('\n')}
</table>`;
}

export function itemsTable(items) {
  const rows = items
    .map(
      (item) => `<tr>
  <td style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};">${escapeHtml(item.product_name)}<div style="font-size:12px;color:${COLORS.muted};">${escapeHtml(item.tamil_name || '')}</div></td>
  <td style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:center;">${item.quantity}</td>
  <td style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;white-space:nowrap;">${formatRupees(item.unit_price)}</td>
  <td style="padding:8px 6px;border-bottom:1px solid ${COLORS.line};text-align:right;white-space:nowrap;">${formatRupees(item.amount)}</td>
</tr>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;margin:8px 0 16px;">
<tr style="background:${COLORS.bg};">
  <th align="left" style="padding:8px 6px;">Product</th><th style="padding:8px 6px;">Qty</th>
  <th align="right" style="padding:8px 6px;">Price</th><th align="right" style="padding:8px 6px;">Amount</th>
</tr>${rows}</table>`;
}

export function totalsTable(order) {
  const rows = [
    ['Sub Total', formatRupees(order.subtotal)],
    [`Promotion Discount${order.promotion_code ? ` (${order.promotion_code})` : ''}`, `- ${formatRupees(order.promotion_discount)}`],
    [`Packing Charges (${Number(order.packing_charge_percentage || 0)}%)`, formatRupees(order.packing_charge)],
    ['Round Off', formatRupees(order.round_off)],
  ];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
${rows.map(([l, v]) => `<tr><td style="padding:4px 0;color:${COLORS.muted};">${escapeHtml(l)}</td><td align="right" style="padding:4px 0;">${escapeHtml(v)}</td></tr>`).join('')}
<tr><td style="padding:10px 0;font-weight:bold;font-size:16px;border-top:2px solid ${COLORS.night};">Overall Amount</td>
<td align="right" style="padding:10px 0;font-weight:bold;font-size:16px;color:${COLORS.red};border-top:2px solid ${COLORS.night};">${formatRupees(order.total_amount)}</td></tr>
</table>`;
}

export function paragraph(text) {
  return `<p style="margin:0 0 14px;">${escapeHtml(text)}</p>`;
}

export function itemsText(items) {
  return items.map((i) => `- ${i.product_name} x ${i.quantity} @ ${formatRupees(i.unit_price)} = ${formatRupees(i.amount)}`).join('\n');
}

export function totalsText(order) {
  return [
    `Sub Total: ${formatRupees(order.subtotal)}`,
    `Promotion Discount: -${formatRupees(order.promotion_discount)}`,
    `Packing Charges: ${formatRupees(order.packing_charge)}`,
    `Round Off: ${formatRupees(order.round_off)}`,
    `Overall Amount: ${formatRupees(order.total_amount)}`,
  ].join('\n');
}

export { COLORS };
