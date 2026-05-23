import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  private appUrl = process.env.APP_URL || 'http://localhost:3000';
  private from = process.env.MAIL_FROM || 'noreply@indigo.dev';

  async send(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
      this.logger.warn(`[mail dry-run] to=${to} subject="${subject}"`);
      return;
    }
    await this.transporter.sendMail({ from: this.from, to, subject, html });
  }

  sendVerification(email: string, token: string) {
    const url = `${this.appUrl}/verify-email?token=${token}`;
    return this.send(email, 'Verify your INDIGO account',
      `<h2>Welcome to INDIGO</h2><p>Confirm your email: <a href="${url}">${url}</a></p>`);
  }

  sendPasswordReset(email: string, token: string) {
    const url = `${this.appUrl}/reset-password?token=${token}`;
    return this.send(email, 'Reset your INDIGO password',
      `<p>Reset your password: <a href="${url}">${url}</a> (expires in 30 min)</p>`);
  }
}
