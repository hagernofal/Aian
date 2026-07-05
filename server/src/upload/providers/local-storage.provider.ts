import { Injectable, Logger } from '@nestjs/common';
import { StorageProvider } from './storage.provider';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly baseUploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure the base uploads directory exists when the provider is instantiated
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
      this.logger.log(`Created base upload directory at ${this.baseUploadDir}`);
    }
  }

  async save(
    file: Express.Multer.File,
    filename: string,
    category: string,
  ): Promise<string> {
    const categoryDir = path.join(this.baseUploadDir, category);

    // Ensure the category sub-directory exists
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    this.logger.log(`File saved locally: ${filePath}`);

    // Return the relative URL path.
    // The ServeStaticModule will handle requests to /uploads/*
    return `/uploads/${category}/${filename}`;
  }
}
