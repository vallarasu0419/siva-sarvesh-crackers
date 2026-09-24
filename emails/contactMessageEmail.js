import { emailLayout, heading, keyValueTable, socialLinksText } from './layout.js';

export function contactMessageEmail({ name, email, mobile, message }) {
  const bodyHtml = `${heading('New message from the website')}
${keyValueTable([
  ['Name', name],
  ['Email', email],
  ['Mobile', mobile],
  ['Message', message],
])}`;
  return {
    subject: `Website enquiry from ${name}`,
    html: emailLayout({ title: 'Website enquiry', preheader: message.slice(0, 80), bodyHtml }),
    text: `Name: ${name}\nEmail: ${email}\nMobile: ${mobile}\n\n${message}\n\n${socialLinksText()}`,
    replyTo: email,
  };
}
