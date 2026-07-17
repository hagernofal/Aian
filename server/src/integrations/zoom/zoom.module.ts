import { Module } from '@nestjs/common';
import { ZoomAuthController } from './zoom-auth.controller';
import { ZoomClientService } from './zoom-client.service';
import { ZoomAdapterService } from './zoom-adapter.service';

@Module({
    imports: [],
    controllers: [ZoomAuthController],
    providers: [ZoomClientService,ZoomAdapterService],
})
export class ZoomModule {}
