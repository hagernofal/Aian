import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService, UploadCategory } from './upload.service';

@Controller('upload-test')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file')) // Automatically extracts multipart/form-data field named 'file'
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'A file is required. Please upload using the "file" form-data field.',
      );
    }

    const uploadCategory = (category as UploadCategory) || 'misc';
    const publicUrl = await this.uploadService.uploadFile(file, uploadCategory);

    return {
      success: true,
      message: 'File successfully uploaded via test endpoint',
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        category: uploadCategory,
        url: publicUrl,
      },
    };
  }
}
