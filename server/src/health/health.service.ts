import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthCheckResult, ServiceHealth, HealthStatus } from './health.types';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const dbHealth = await this.checkDatabase();

    const overallStatus: HealthStatus =
      dbHealth.status === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
      version: process.env.npm_package_version ?? '0.0.1',
      services: {
        server: {
          status: 'ok',
          message: 'Server is running',
        },
        database: dbHealth,
      },
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Lightweight query — just ping the DB
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - start;
      return {
        status: 'ok',
        message: 'Database is reachable',
        latencyMs,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'down',
        message:
          error instanceof Error ? error.message : 'Unknown database error',
        latencyMs: Date.now() - start,
      };
    }
  }
}
