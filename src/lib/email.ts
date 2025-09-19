
'use server';

import nodemailer from 'nodemailer';
import prisma from './prisma';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const getEmailSettings = async () => {
    const fromName = await prisma.siteContent.findUnique({ where: { key: 'settings.email.fromName' } });
    const fromEmail = await prisma.siteContent.findUnique({ where: { key: 'settings.email.fromEmail' } });

    return {
        from: `"${fromName?.value || process.env.SMTP_FROM_NAME || 'Comparlify'}" <${fromEmail?.value || process.env.SMTP_FROM_EMAIL}>`,
    };
};

export async function sendEmail({ to, subject, html }: MailOptions) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP environment variables are not set. Cannot send email.');
    throw new Error('Email service is not configured.');
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
