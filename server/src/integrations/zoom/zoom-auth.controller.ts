import {
  Controller,
  Get,
  Query,
  Res,
  Logger,
  BadRequestException,
  Param,
} from '@nestjs/common';
import type { Response } from 'express';
import axios from 'axios';
import { ProviderConnectionRepository } from '../../ingestion/repositories/provider-connection.repository';
import { EncryptionService } from '../../common/encryption.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ZoomClientService } from './zoom-client.service';

/**
 * Handles the Zoom OAuth 2.0 flow.
 */
@Controller('integrations/zoom')
export class ZoomAuthController {
  private readonly logger = new Logger(ZoomAuthController.name);

  private readonly clientId = process.env.ZOOM_CLIENT_ID;
  private readonly clientSecret = process.env.ZOOM_CLIENT_SECRET;
  private readonly redirectUri = process.env.ZOOM_REDIRECT_URI as string;

  constructor(
    private readonly connectionRepo: ProviderConnectionRepository,
    private readonly encryptionService: EncryptionService,
    private readonly prisma: PrismaService,
    private readonly zoomClient: ZoomClientService,
  ) {}

  /**
   * Step 1: Redirect user to Zoom's OAuth consent page.
   */
  @Get('install')
  async install(
    @Query('organizationEyeId') organizationEyeId: string,
    @Res() res: Response,
  ) {
    if (!organizationEyeId) {
      throw new BadRequestException('Missing organizationEyeId query parameter');
    }

    if (!this.clientId) {
      throw new BadRequestException('ZOOM_CLIENT_ID is not configured');
    }

    const zoomAuthUrl =
      `https://zoom.us/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${this.clientId}` +
      `&redirect_uri=${encodeURIComponent(this.redirectUri)}` +
      `&state=${organizationEyeId}`;

    this.logger.log(`Redirecting to Zoom OAuth for eye: ${organizationEyeId}`);
    return res.redirect(zoomAuthUrl);
  }

  /**
   * Step 2: Zoom redirects here after the user grants access.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
  ) {
    if (error) {
      this.logger.warn(`Zoom OAuth denied: ${error}`);
      throw new BadRequestException(`Zoom authorization was denied: ${error}`);
    }

    if (!code || !state) {
      throw new BadRequestException('Missing code or state parameter');
    }

    const organizationEyeId = state;

    const eye = await this.prisma.organizationEye.findUnique({
      where: { id: organizationEyeId },
    });

    if (!eye) {
      throw new BadRequestException(
        `OrganizationEye ${organizationEyeId} not found`,
      );
    }

    const zoomProvider = await this.prisma.provider.findUnique({
      where: { key: 'zoom' },
    });

    if (!zoomProvider) {
      throw new BadRequestException(
        'Zoom provider not found in database. Did you run the seed?',
      );
    }

    try {
      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const tokenResponse = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri,
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const data = tokenResponse.data;

      const tokenExpiresAt = new Date();
      tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + (data.expires_in || 3600));

      const encryptedAccessToken = this.encryptionService.encrypt(data.access_token);
      const encryptedRefreshToken = data.refresh_token 
        ? this.encryptionService.encrypt(data.refresh_token)
        : null;

      const connection = await this.connectionRepo.create({
        organizationEyeId,
        providerId: zoomProvider.id,
        status: 'connected',
        externalAccountId: data.owner_id || 'unknown',
        accessTokenEncrypted: encryptedAccessToken,
        refreshTokenEncrypted: encryptedRefreshToken,
        tokenExpiresAt,
        scopes: data.scope ? data.scope.split(' ') : [],
        connectedAt: new Date(),
        connectionMetadata: {
          token_type: data.token_type,
        },
      });

      await this.prisma.organizationEye.update({
        where: { id: organizationEyeId },
        data: { status: 'connected' },
      });

      this.logger.log(
        `Zoom connected successfully: connection=${connection.id}, owner=${data.owner_id}`,
      );

      return {
        success: true,
        message: 'Successfully connected to Zoom!',
        data: {
          connectionId: connection.id,
          externalAccountId: data.owner_id,
        },
      };

    } catch (err) {
      this.logger.error(
        `Zoom OAuth error: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw new BadRequestException('Failed to complete Zoom OAuth flow');
    }
  }

  /**
   * use this endpoint to test the Zoom client connection and fetch resources.
   * Example: GET /integrations/zoom/test-client/:connectionId
   * Returns the health check result and any resources found.
   */
  @Get('test-client/:connectionId')
  async testClient(@Param('connectionId') connectionId: string) {
    const connection = await this.connectionRepo.findById(connectionId);
    if (!connection) {
      return { error: 'Connection record not found in database' };
    }

    const mappedConnection = this.connectionRepo.mapToInterface(connection);

    const healthCheck = await this.zoomClient.verifyConnection(mappedConnection as any);

    let resources = []  as any[];
    if (healthCheck.isValid) {
      try {
        resources = await this.zoomClient.getResources(mappedConnection as any);
      } catch (err: any) {
        resources = [{ error: `Failed to fetch resources: ${err.message}` }];
      }
    }

    return {
      healthCheck,
      resourcesFound: resources.length,
      resources,
    };
  }
}