import {
  Controller,
  Post,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Controller for receiving provider webhooks.
 * Webhooks are mounted at: POST /api/v1/webhooks/:connectionId
 */
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly prismaService: PrismaService
  ) {}

  @Post('zoom')
  @HttpCode(HttpStatus.OK)
  async handleZoomWebhook(
    @Req() req: RawBodyRequest<any>,
  ) {
    const zoomProvider= await this.prismaService.provider.findUnique({
      where:{key:'zoom'}
    })

    if(!zoomProvider)
       throw new NotFoundException

    const account_id= req.body.payload.account_id;
    const providerConnection= await this.prismaService.providerConnection.findFirst({
      where: {
        externalAccountId:account_id,
        providerId:zoomProvider.id
      }
      
    })
    const connectionId=providerConnection?.id || 'null';
    console.log('connectionId:', connectionId)
    await this.webhookService.processWebhook(connectionId, req as any);
    return { received: true };
  }

  @Post(':connectionId')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('connectionId') connectionId: string,
    // By typing it as RawBodyRequest<any>, we avoid TS1272 express Request import issues
    @Req() req: RawBodyRequest<any>,
  ) {
    // Pass the request to the service for validation and dispatch
    await this.webhookService.processWebhook(connectionId, req as any);
    // We always respond 200 OK immediately after validation
    // to prevent the provider from retrying and backing up their queues.
    return { received: true };
  }
}
