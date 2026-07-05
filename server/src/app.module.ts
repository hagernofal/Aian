import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // Serve files stored in the /uploads directory at the /uploads HTTP route
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    HealthModule,
    UploadModule,
  ],
})
export class AppModule {}
