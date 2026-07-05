import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { UploadCategory } from '../../upload/upload.service';

export class TestEmailDto {
  @IsEmail({}, { message: 'A valid "to" email address is required.' })
  to: string;

  @IsString()
  @MinLength(3, { message: 'Subject must be at least 3 characters long.' })
  subject: string;

  @IsString()
  @MinLength(1, { message: 'Email body cannot be empty.' })
  body: string;
}

export class TestUploadDto {
  @IsOptional()
  @IsString()
  @IsIn(['images', 'documents', 'videos', 'audio', 'misc'], {
    message: 'Category must be one of: images, documents, videos, audio, misc',
  })
  category?: UploadCategory;
}
