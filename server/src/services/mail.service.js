const nodemailer = require('nodemailer');
const config = require('../config');

// One transporter for the whole app — only created when SMTP is configured.
const transporter = config.smtp.host
  ? nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  })
  : null;

const mailEnabled = () => !!transporter;

/**
 * Sends an email. Without SMTP (local/demo) nothing is sent: the message is logged instead and
 * `preview` is returned, so the API can show it on screen when MAIL_PREVIEW is on.
 * Returns { sent: boolean, preview?: string }.
 */
async function sendMail({ to, subject, text, preview }) {
  if (transporter) {
    await transporter.sendMail({ from: config.smtp.from, to, subject, text });
    return { sent: true };
  }
  console.log(`✉️  [mail not configured] To: ${to} | ${subject}\n${text}\n`);
  return { sent: false, preview: config.mailPreview ? preview : undefined };
}

module.exports = { sendMail, mailEnabled };
