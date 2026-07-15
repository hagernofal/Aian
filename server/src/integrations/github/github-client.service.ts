import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import {
  ProviderClient,
  ProviderConnection,
  ConnectionVerificationResult,
  ProviderResource,
} from '../contracts';
import { EncryptionService } from '../../common/encryption.service';
import { GithubAppEnvKeys, GithubApiUrls, GithubResourceType } from './github-connection.constants';

/**
 * GitHub-specific implementation of ProviderClient.
 *
 * Unlike Slack (long-lived bot token), GitHub App installation tokens
 * expire every ~1 hour. This service regenerates a fresh installation
 * token on demand using the App's JWT, signed with our private key.
 */
@Injectable()
export class GithubClientService implements ProviderClient {
  private readonly logger = new Logger(GithubClientService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Verify the connection by listing repositories accessible to this
   * installation. If the call succeeds, the installation is still active.
   */
  async verifyConnection(
    connection: ProviderConnection,
  ): Promise<ConnectionVerificationResult> {
    try {
      const token = await this.getValidInstallationToken(connection);

      const response = await axios.get(
        `${GithubApiUrls.BASE}/installation/repositories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );

      this.logger.debug(
        `GitHub connection verified: ${response.data.total_count} repositories accessible`,
      );

      return {
        isValid: true,
        message: `Connected. ${response.data.total_count} repositories accessible.`,
        accountName: connection.externalAccountId ?? undefined,
        accountId: connection.externalAccountId ?? undefined,
      };
    } catch (error) {
      this.logger.error(
        `GitHub verifyConnection error: ${(error as Error).message}`,
      );
      return {
        isValid: false,
        message: `Failed to verify GitHub installation: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Fetch all repositories accessible to this installation.
   * Maps each GitHub repository to a ProviderResource.
   */
  async getResources(
    connection: ProviderConnection,
  ): Promise<ProviderResource[]> {
    const token = await this.getValidInstallationToken(connection);
    const resources: ProviderResource[] = [];

    let page = 1;
    let totalCount = Infinity;

    while (resources.length < totalCount) {
      const response = await axios.get(
        `${GithubApiUrls.BASE}/installation/repositories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
          params: { per_page: 100, page },
        },
      );

      totalCount = response.data.total_count;

      for (const repo of response.data.repositories || []) {
        resources.push({
          externalResourceId: String(repo.id),
          name: repo.full_name,
          resourceType: GithubResourceType,
          metadata: {
            private: repo.private,
            defaultBranch: repo.default_branch,
            htmlUrl: repo.html_url,
          },
        });
      }

      page += 1;
      if (!response.data.repositories?.length) break; // safety exit
    }

    this.logger.log(`Fetched ${resources.length} GitHub repositories`);
    return resources;
  }

  /**
   * Installation tokens expire hourly. This regenerates one if the
   * stored token is missing/expired, using the App's signed JWT.
   * NOTE: This does not persist the refreshed token — persisting refreshed
   * credentials is the Collection Service's responsibility (Amir), same
   * pattern as Slack. This method only returns a usable token for the
   * current API call.
   */
  private async getValidInstallationToken(
    connection: ProviderConnection,
  ): Promise<string> {
    const now = new Date();
    const storedExpiry = connection.tokenExpiresAt
      ? new Date(connection.tokenExpiresAt)
      : null;

    // If we have a still-valid stored token, decrypt and reuse it.
    if (storedExpiry && storedExpiry > now && connection.accessTokenEncrypted) {
      return this.encryptionService.decrypt(connection.accessTokenEncrypted);
    }

    // Otherwise, mint a fresh installation token.
    const appJwt = this.generateAppJwt();
    const installationId = connection.externalAccountId;

    try {
      const response = await axios.post(
        `${GithubApiUrls.BASE}/app/installations/${installationId}/access_tokens`,
        {},
        {
          headers: {
            Authorization: `Bearer ${appJwt}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );

      return response.data.token;
    } catch (error) {
      throw new InternalServerErrorException(
        'PROVIDER_TOKEN_EXPIRED: could not refresh GitHub installation token',
      );
    }
  }

  /**
   * Signs a JWT using the GitHub App's private key.
   * Shared logic — used here and by GithubAuthController.
   */
  generateAppJwt(): string {
    const appId = this.configService.get<string>(GithubAppEnvKeys.APP_ID);
    const privateKeyPath = this.configService.get<string>(
      'GITHUB_APP_PRIVATE_KEY_PATH',
    );

    if (!appId || !privateKeyPath) {
      throw new InternalServerErrorException(
        'GitHub App is not configured (missing APP_ID or PRIVATE_KEY_PATH)',
      );
    }

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const now = Math.floor(Date.now() / 1000);

    return jwt.sign(
      {
        iat: now - 60,
        exp: now + 9 * 60,
        iss: appId,
      },
      privateKey,
      { algorithm: 'RS256' },
    );
  }
}