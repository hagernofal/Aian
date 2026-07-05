import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { StorageProvider } from './providers/storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    // Dependency Inversion: We bind the abstract StorageProvider
    // to the concrete LocalStorageProvider here.
    // To switch to S3 later, simply change `useClass: S3StorageProvider`
    {
      provide: StorageProvider,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [UploadService], // Export so other modules can inject UploadService
})
export class UploadModule {}
