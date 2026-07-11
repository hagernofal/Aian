/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Put,
  Body,
  UseGuards,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthGaurd } from '../auth/auth.gaurd';
import { RolesGuards } from '../roles_permissions/roles.guard';
import { RequiredPermissions } from '../decorators/required-permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('onboarding')
@UseGuards(AuthGaurd)
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly prisma: PrismaService, 
  ) {}

  private async getOrgId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });
    if (!user?.organizationId) 
    {
      throw new NotFoundException('User is not associated with any organization.');
    }
    return user.organizationId;
  }

  @Post('organization')
  async createOrganization(@CurrentUser() user: any, @Body() dto: CreateOrganizationDto) {
    return await this.onboardingService.createOrganization(user.id, dto);
  }

  @UseGuards(RolesGuards)
  @RequiredPermissions('organization.update')
  @Put('providers')
  async updateProviders(@CurrentUser() user: any, @Body() body: { providers: { eyeType: string; providerKey: string }[] },
) {
    const orgId = await this.getOrgId(user.id); 
    const updatedEyes = await this.onboardingService.updateProviders(orgId, body.providers);
    return { success: true, message: 'Providers updated successfully.', data: { updatedEyes } };
  }

  @UseGuards(RolesGuards)
  @RequiredPermissions('organization.read')
  @Get('progress')
  async getProgress(@CurrentUser() user: any) {
    const orgId = await this.getOrgId(user.id); 
    return await this.onboardingService.getProgress(orgId);
  }

  @UseGuards(RolesGuards)
  @RequiredPermissions('organization.update')
  @Post('complete')
  async completeOnboarding(@CurrentUser() user: any) {
    const orgId = await this.getOrgId(user.id);
    return await this.onboardingService.completeOnboarding(orgId);
  }
}