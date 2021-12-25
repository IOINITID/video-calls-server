import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { API_URL, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USER } from '../../constants';

dotenv.config();

class MailService {
  transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }

  public sendActivationMail = async (email: string, link: string) => {
    await this.transporter.sendMail({
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
}

export const mailService = new MailService();
