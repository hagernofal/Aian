import { Module, OnModuleInit } from '@nestjs/common';
import { JiraAuthController } from './controllers/jira-auth.controller';
import { JiraEventsController } from './controllers/jira-events.controller';
import { JiraClientService } from './services/jira-client.service';
import { JiraAdapterService } from './services/jira-adapter.service';
import { JiraWebhookValidator } from './validators/jira-webhook.validator';
import { ProviderClientFactory } from '../provider-client.factory';
import { WebhookSignatureValidatorFactory } from '../../ingestion/collection/webhooks/webhook-signature-validator.factory';
import { Provider } from '../contracts';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [JiraAuthController, JiraEventsController],
  providers: [JiraClientService, JiraAdapterService, JiraWebhookValidator],
  exports: [JiraClientService, JiraAdapterService, JiraWebhookValidator],
})
export class JiraModule implements OnModuleInit {
  constructor(
    private readonly clientFactory: ProviderClientFactory,
    private readonly validatorFactory: WebhookSignatureValidatorFactory,
    private readonly jiraClient: JiraClientService,
    private readonly jiraAdapter: JiraAdapterService,
    private readonly jiraValidator: JiraWebhookValidator,
  ) {}

  onModuleInit() {
    this.clientFactory.registerClient(Provider.JIRA, this.jiraClient);
    this.clientFactory.registerAdapter(Provider.JIRA, this.jiraAdapter);
    this.validatorFactory.registerValidator(Provider.JIRA, this.jiraValidator);
  }
}
