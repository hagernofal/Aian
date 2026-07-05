import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [UploadModule, EmailModule],
  controllers: [TestController],
})
export class TestModule {}
