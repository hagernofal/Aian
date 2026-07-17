import { Module, Global } from '@nestjs/common';
import { WebhookController } from './webhooks/webhook.controller';
import { WebhookService } from './webhooks/webhook.service';
import { WebhookEventDispatcherService } from './webhooks/webhook-event-dispatcher.service';
import { BaseCollectorService } from './base-collector.service';

/**
 * Collection Module.
 * Manages webhook reception, signature validation, and routing to base collectors.
 * Note: WebhookSignatureValidatorFactory is provided globally by IngestionModule.
 */
@Global()
@Module({
  controllers: [WebhookController],
  providers: [
    WebhookEventDispatcherService,
    WebhookService,
    BaseCollectorService,
  ],
  exports: [BaseCollectorService, WebhookService],
})
export class CollectionModule {}
