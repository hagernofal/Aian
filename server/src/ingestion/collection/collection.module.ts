import { Module } from '@nestjs/common';
import { WebhookController } from './webhooks/webhook.controller';
import { WebhookService } from './webhooks/webhook.service';
import { WebhookSignatureValidatorFactory } from './webhooks/webhook-signature-validator.factory';
import { WebhookEventDispatcherService } from './webhooks/webhook-event-dispatcher.service';
import { IntegrationsModule } from '../../integrations/integrations.module';
import { BaseCollectorService } from './base-collector.service';

/**
 * Collection Module.
 * Manages webhook reception, signature validation, and routing to base collectors.
 */
@Module({
  imports: [IntegrationsModule], // We need ProviderClientFactory from this
  controllers: [WebhookController],
  providers: [
    WebhookSignatureValidatorFactory,
    WebhookEventDispatcherService,
    WebhookService,
    BaseCollectorService,
  ],
  exports: [WebhookSignatureValidatorFactory, BaseCollectorService],
})
export class CollectionModule {}
