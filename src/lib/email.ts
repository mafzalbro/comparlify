
'use server';

import nodemailer from 'nodemailer';
import { getContent } from './content';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const getEmailSettings = async () => {
    const content = await getContent();
    const siteName = content['global.siteName'] || 'Comparlify';
    const fromName = content['settings.email.fromName'] || siteName;
    const fromEmail = content['settings.email.fromEmail'] || `noreply@${siteName.toLowerCase().replace(/\s/g, '')}.com`;

    return {
        from: `"${fromName}" <${fromEmail}>`,
    };
};

export async function sendEmail({ to, subject, html }: MailOptions) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP environment variables are not set. Cannot send email.');
    // In a real app, you might want to throw an error or handle this more gracefully.
    // For this prototype, we'll log the email to the console.
    console.log('--- EMAIL SEND (SIMULATED) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('---');
    return { success: true, messageId: `simulated_${Date.now()}` };
  }

  const { from } = await getEmailSettings();

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: (process.env.SMTP_PORT || '587') === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
