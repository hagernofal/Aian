export abstract class EmailProvider {
  /**
   * Sends an email using the underlying infrastructure (e.g., Nodemailer, SendGrid).
   *
   * @param to The recipient's email address
   * @param subject The email subject
   * @param html The fully compiled HTML body of the email
   */
  abstract sendMail(to: string, subject: string, html: string): Promise<void>;
}
