/**
 * Wraps the specific email content inside a standard branded layout.
 * This ensures all emails have the same header, footer, and styling.
 *
 * @param contentHtml The specific HTML body for this email (e.g., a welcome message)
 * @returns The fully constructed HTML string ready to be sent
 */
export function buildBaseEmailTemplate(contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aian Notification</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background-color: #121212;
          margin: 0;
          padding: 0;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #1e1e1e;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
          border: 1px solid #333333;
        }
        .header {
          background-color: #D4AF37; /* Aian Gold */
          color: #000000;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .content {
          padding: 30px;
          line-height: 1.6;
          font-size: 16px;
          color: #e0e0e0;
        }
        .footer {
          background-color: #121212;
          text-align: center;
          padding: 20px;
          font-size: 13px;
          color: #888888;
          border-top: 1px solid #333333;
        }
        .footer a {
          color: #D4AF37;
          text-decoration: none;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background-color: #D4AF37;
          color: #000000 !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- BRANDING HEADER -->
        <div class="header">
          <h1>AIAN</h1>
        </div>

        <!-- DYNAMIC CONTENT INJECTED HERE -->
        <div class="content">
          ${contentHtml}
        </div>

        <!-- STANDARD FOOTER -->
        <div class="footer">
          <p>&copy; ${currentYear} Aian Inc. All rights reserved.</p>
          <p>
            If you have any questions, contact our support team at 
            <a href="mailto:support@aian.com">support@aian.com</a>
          </p>
          <p><a href="${frontendUrl}">Visit Dashboard</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
