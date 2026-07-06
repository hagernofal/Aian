import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardOwnerData } from './dashboard.types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOwnerDashboard(userId: string): Promise<DashboardOwnerData> {
    // V1: one organization per user
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId,
        memberStatus: 'active',
      },
      include: {
        organization: true,
      },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found.');
    }

    const organizationId = membership.organizationId;

    const [
      subscription,
      onboardingProgress,
      organizationEyes,
      eyeTypes,
      providers,
      memberCount,
      roleCount,
    ] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: {
          organizationId,
        },
      }),

      this.prisma.onboardingProgress.findUnique({
        where: {
          organizationId,
        },
      }),

      this.prisma.organizationEye.findMany({
        where: {
          organizationId,
        },
      }),

      this.prisma.eyeType.findMany(),

      this.prisma.provider.findMany(),

      this.prisma.organizationMember.count({
        where: {
          organizationId,
          memberStatus: 'active',
        },
      }),

      this.prisma.role.count(),
    ]);

    return {
      organization: {
        id: membership.organization.id,
        name: membership.organization.name,
        status: membership.organization.status,
      },

      subscription: subscription
        ? {
            billingCycle: subscription.billingCycle,
            status: subscription.status,
            currentPeriodEnd:
              subscription.currentPeriodEnd?.toISOString() ?? null,
          }
        : null,

      onboardingProgress: onboardingProgress
        ? {
            currentStep: onboardingProgress.currentStep,
            isCompleted: onboardingProgress.isCompleted,
          }
        : null,

      eyes: organizationEyes.map((eye) => {
        const eyeType = eyeTypes.find((e) => e.id === eye.eyeTypeId);

        const provider = providers.find(
          (p) => p.id === eye.selectedProviderId,
        );

        return {
          eyeType: eyeType?.name ?? '',
          providerName: provider?.name ?? null,
          status: eye.status,
        };
      }),

      memberCount,
      roleCount,
    };
  }
}
