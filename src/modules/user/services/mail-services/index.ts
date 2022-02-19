import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { API_URL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from 'core/constants';

dotenv.config();

/**
 * Transporter for mail services.
 */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

/**
 * Service for sending activation mail.
 */
export const mailActivationService = async (email: string, link: string) => {
  await transporter.sendMail({
    from: SMTP_USER,
    to: email,
    subject: `Активация аккаунта на ${API_URL}`,
    text: '',
    html: `
        <div>
          <h1>Для активации перейдите по ссылке:</h1>
          <a href="${link}">${link}</a>
        </div>
      `,
  });
};
