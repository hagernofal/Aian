# Aian Backend Server

This is the central backend API for the Aian platform, built with [NestJS](https://nestjs.com/) and [Prisma ORM](https://www.prisma.io/).

## 🚀 Getting Started (For New Developers)

When you first clone this repository, you are starting with a completely empty database. You must follow these exact steps to set up the project locally:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Database Container**
   Ensure Docker is running on your machine, then spin up the PostgreSQL database:
   ```bash
   docker-compose up -d
   ```

3. **Set up Environment Variables**
   Duplicate the example environment file and configure any missing credentials:
   ```bash
   cp .env.example .env
   ```

4. **Run Database Migrations (CRITICAL)**
   This pushes the SQL table definitions from `schema.prisma` into your empty PostgreSQL database:
   ```bash
   npm run db:migrate
   ```

5. **Seed the Database**
   Populate the database with initial required data (e.g., initial organizations, eye types):
   ```bash
   npm run db:seed
   ```

6. **Start the Development Server**
   ```bash
   npm run start:dev
   ```

---

## 🛠️ Prisma Database Commands

We have added convenient shortcuts in `package.json` to manage the database easily:

- **`npm run db:migrate`**: Applies pending migrations to the database and regenerates the Prisma Client. Run this after pulling new changes that modify the schema.
- **`npm run db:generate`**: Only generates the Prisma Client (TypeScript types). Useful if the client goes out of sync.
- **`npm run db:seed`**: Runs `prisma/seed.ts` to populate the DB with initial data.
- **`npm run db:studio`**: Opens a visual database editor in your browser at `localhost:5555`.
- **`npm run db:reset`**: **WARNING**: Drops all tables, reapplies all migrations, and runs the seed script again. Great for cleaning your local environment.

---

## 🌍 Global Services Documentation

This server includes highly modular global services that can be used across any feature module.

### 1. File Upload Service (`UploadService`)

A robust, SOLID-compliant service for handling file uploads (currently saving locally to `/uploads`).

**How to use:**
1. Import `UploadModule` into your feature module.
2. Inject `UploadService` into your controller/service.
3. Call `await this.uploadService.uploadFile(...)`.

**Example:**
```typescript
import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadCategory } from '../upload/upload.service';

@Controller('users')
export class UsersController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file')) // Expects 'file' in multipart/form-data
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
  ) {
    // uploadFile(file, category)
    // Accepted categories: 'images' | 'documents' | 'videos' | 'audio' | 'misc'
    const publicUrl = await this.uploadService.uploadFile(file, 'images');
    
    // Save publicUrl to the database...
    return { url: publicUrl };
  }
}
```
**Details:**
- Files are automatically validated against their MIME types (e.g., `images` only accepts `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`).
- Files are renamed using a secure UUID to prevent overwriting.
- They are accessible publicly via `http://localhost:1234/uploads/<category>/<filename>`.

### 2. Email Service (`EmailService`)

A centralized service for sending branded emails. All emails sent through this service are automatically wrapped in the standard Aian Gold and Black HTML template (with header, footer, and support links).

**How to use:**
1. Import `EmailModule` into your feature module.
2. Inject `EmailService` into your controller/service.
3. Call `await this.emailService.sendBrandedEmail(...)`.

**Example:**
```typescript
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    // 1. Create your raw custom content
    const customMessage = `
      <h2>Welcome to Aian, ${userName}!</h2>
      <p>We are thrilled to have you onboard.</p>
      <a href="http://localhost:3000/login" class="btn">Login Now</a>
    `;

    // 2. Pass it to the service
    // The service will wrap your HTML in the Aian Base Layout.
    // NOTE: You can remove 'await' if you want it to send asynchronously in the background.
    await this.emailService.sendBrandedEmail(
      userEmail,             // Recipient (to)
      'Welcome to Aian!',    // Subject
      customMessage          // Body (HTML)
    );
  }
}
```
**Details:**
- **`sendBrandedEmail(to, subject, html)`**: Wraps the provided HTML in the Aian company template.
- **`sendRawEmail(to, subject, html)`**: Bypasses the wrapper for completely custom emails.
- Depends on the `SMTP_*` variables in your `.env` file.
