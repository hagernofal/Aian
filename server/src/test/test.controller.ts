import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { TestEmailDto, TestUploadDto } from './dto/test.dto';

@Controller('test')
export class TestController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // Automatically extracts multipart/form-data field named 'file'
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: TestUploadDto,
  ) {
    if (!file) {
      throw new BadRequestException(
        'A file is required. Please upload using the "file" form-data field.',
      );
    }

    const uploadCategory = dto.category || 'misc';
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

  @Post('email')
  async testEmail(@Body() dto: TestEmailDto) {
    // DTO automatically ensures to, subject, and body are present and valid
    await this.emailService.sendBrandedEmail(dto.to, dto.subject, dto.body);

    return {
      success: true,
      message: `Test email sent successfully to ${dto.to}`,
    };
  }
}
