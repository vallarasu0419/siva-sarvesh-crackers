import { emailLayout, heading, paragraph, socialLinksText, COLORS } from './layout.js';

export function otpEmail({ otp, expiryMinutes }) {
  const bodyHtml = `${heading('Verify your email to place the order')}
${paragraph('Use this one-time password (OTP) on the Siva Sarvesh Crackers order page:')}
<div style="margin:18px 0;padding:16px;text-align:center;background:${COLORS.bg};border:2px dashed ${COLORS.gold};border-radius:10px;font-size:32px;font-weight:bold;letter-spacing:10px;color:${COLORS.night};">${otp}</div>
${paragraph(`This OTP expires in ${expiryMinutes} minutes and can be used only once.`)}
${paragraph('If you did not request this, you can ignore this email. Never share this OTP with anyone.')}`;

  return {
    subject: `${otp} is your Siva Sarvesh Crackers verification code`,
    html: emailLayout({ title: 'Your OTP', preheader: `Your OTP expires in ${expiryMinutes} minutes.`, bodyHtml }),
    text: `Your Siva Sarvesh Crackers OTP is ${otp}. It expires in ${expiryMinutes} minutes. Never share this OTP.\n\n${socialLinksText()}`,
  };
}
