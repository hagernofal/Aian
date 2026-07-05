import { Injectable, BadRequestException } from '@nestjs/common';
import { StorageProvider } from './providers/storage.provider';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export type UploadCategory = 'images' | 'documents' | 'misc';

/**
 * 🚀 UploadService (Global File Uploader)
 *
 * HOW TO USE THIS SERVICE:
 * ---------------------------------------------------------
 * 1. Import `UploadModule` into your feature module.
 * 2. Inject `UploadService` into your controller/service.
 * 3. Call `await this.uploadService.uploadFile(file, category)`
 *
 * Example:
 * ```ts
 * @Post('avatar')
 * @UseInterceptors(FileInterceptor('file'))
 * async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
 *   const url = await this.uploadService.uploadFile(file, 'images');
 *   return { avatarUrl: url };
 * }
 * ```
 */
@Injectable()
export class UploadService {
  // Enforced file extension rules by category
  private readonly allowedExtensions: Record<UploadCategory, string[]> = {
    images: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
    documents: ['.pdf', '.txt', '.md', '.docx', '.csv'],
    misc: [], // Empty array means no restriction
  };

  constructor(private readonly storageProvider: StorageProvider) {}

  /**
   * Validates and saves a file securely.
   *
   * @param file The Multer file object
   * @param category Determines where it is saved and which extensions are allowed
   * @returns The public URL of the uploaded file
   */
  async uploadFile(
    file: Express.Multer.File,
    category: UploadCategory = 'misc',
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided for upload.');
    }

    const originalName = file.originalname || 'unknown';
    const ext = path.extname(originalName).toLowerCase();

    // Security: Validate file extension
    const allowed = this.allowedExtensions[category];
    if (allowed && allowed.length > 0) {
      if (!allowed.includes(ext)) {
        throw new BadRequestException(
          `Invalid file type for category '${category}'. Allowed extensions: ${allowed.join(', ')}`,
        );
      }
    }

    // Generate unique name to prevent overwriting
    // e.g., '550e8400-e29b-41d4-a716-446655440000.png'
    const uniqueFilename = `${uuidv4()}${ext}`;

    // Delegate actual saving to the injected StorageProvider (Local or S3)
    return this.storageProvider.save(file, uniqueFilename, category);
  }
}
