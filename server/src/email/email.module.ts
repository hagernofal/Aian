import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProvider } from './providers/email.provider';
import { NodemailerProvider } from './providers/nodemailer.provider';

@Module({
  providers: [
    EmailService,
    // Dependency Inversion: Bind the abstract EmailProvider to the concrete NodemailerProvider.
    // If you switch to SendGrid in the future, just change `useClass: SendGridProvider`.
    {
      provide: EmailProvider,
      useClass: NodemailerProvider,
    },
  ],
  exports: [EmailService], // Export so other modules can inject EmailService
})
export class EmailModule {}
