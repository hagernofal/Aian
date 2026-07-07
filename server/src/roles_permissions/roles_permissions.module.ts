import { Module } from '@nestjs/common';
import { RolesPermissionsService } from './roles_permissions.service';
import { RolesPermissionsController } from './roles_permissions.controller';

@Module({
  controllers: [RolesPermissionsController],
  providers: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
