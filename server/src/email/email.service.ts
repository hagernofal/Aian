import { Injectable, BadRequestException } from '@nestjs/common';
import { EmailProvider } from './providers/email.provider';
import { buildBaseEmailTemplate } from './templates/email-template.builder';

/**
 * 🚀 EmailService (Global Email Sender)
 *
 * HOW TO USE THIS SERVICE:
 * ---------------------------------------------------------
 * 1. Import `EmailModule` into your feature module.
 * 2. Inject `EmailService` into your controller/service.
 * 3. Call `await this.emailService.sendBrandedEmail(...)`
 *
 * Example:
 * ```ts
 * await this.emailService.sendBrandedEmail(
 *   'user@example.com',
 *   'Welcome to Elevate!',
 *   '<p>Hello Amir!</p><p>We are glad to have you.</p>'
 * );
 * ```
 */
@Injectable()
export class EmailService {
  constructor(private readonly emailProvider: EmailProvider) {}

  /**
   * Wraps the provided HTML content in the standard company branding
   * (header, footer, styles) and sends the email.
   *
   * @param to The recipient's email address
   * @param subject The subject line of the email
   * @param contentHtml The specific HTML content to insert into the branded wrapper
   */
  async sendBrandedEmail(
    to: string,
    subject: string,
    contentHtml: string,
  ): Promise<void> {
    if (!to || !subject || !contentHtml) {
      throw new BadRequestException(
        'Recipient, subject, and content are required to send an email.',
      );
    }

    // 1. Wrap the specific content in the standard company template
    const fullHtml = buildBaseEmailTemplate(contentHtml);

    // 2. Delegate the actual sending to the underlying provider (e.g., Nodemailer)
    // Note: This is an async operation. If you don't want to block the HTTP request,
    // you can remove the `await` keyword in the caller, and it will execute in the background.
    await this.emailProvider.sendMail(to, subject, fullHtml);
  }

  /**
   * Sends a completely raw HTML email without the standard company branding wrapper.
   * Useful for sending exact 1-to-1 designs or system alerts.
   */
  async sendRawEmail(
    to: string,
    subject: string,
    rawHtml: string,
  ): Promise<void> {
    if (!to || !subject || !rawHtml) {
      throw new BadRequestException(
        'Recipient, subject, and content are required.',
      );
    }
    await this.emailProvider.sendMail(to, subject, rawHtml);
  }
}
