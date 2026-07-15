import { Module } from '@nestjs/common';
import { ZoomAuthController } from './zoom-auth.controller';

@Module({
    imports: [],
    controllers: [ZoomAuthController],
    providers: [],
})
export class ZoomModule {}
