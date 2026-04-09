import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import {
  SocialAccount,
  SocialAccountDocument,
} from './schemas/social-account.schema';

@Injectable()
export class SocialAccountsService {
  private readonly logger = new Logger(SocialAccountsService.name);

  constructor(
    @InjectModel(SocialAccount.name)
    private socialAccountModel: Model<SocialAccountDocument>,
    private configService: ConfigService,
  ) {}

  async getAccountsByUser(userId: string): Promise<SocialAccountDocument[]> {
    return this.socialAccountModel.find({ userId: new Types.ObjectId(userId) });
  }

  async getAccountById(
    accountId: string,
    userId: string,
  ): Promise<SocialAccountDocument> {
    const account = await this.socialAccountModel.findOne({
      _id: accountId,
      userId: new Types.ObjectId(userId),
    });
    if (!account) {
      throw new NotFoundException('Social account not found');
    }
    return account;
  }

  getFacebookAuthUrl(): string {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
    ].join(',');

    return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri || '')}&scope=${scopes}&response_type=code`;
  }

  async handleFacebookCallback(
    code: string,
    userId: string,
  ): Promise<SocialAccountDocument[]> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');
    const redirectUri = this.configService.get<string>('FACEBOOK_REDIRECT_URI');

    // Exchange code for short-lived token
    const tokenResponse = await axios.get(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        params: {
          client_id: appId,
          client_secret: appSecret,
          redirect_uri: redirectUri,
          code,
        },
      },
    );

    const shortLivedToken = tokenResponse.data.access_token;

    // Exchange for long-lived token
    const longLivedResponse = await axios.get(
      'https://graph.facebook.com/v19.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken,
        },
      },
    );

    const longLivedToken = longLivedResponse.data.access_token;
    const expiresIn = longLivedResponse.data.expires_in || 5184000; // 60 days default

    // Get user info
    const userResponse = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: { access_token: longLivedToken, fields: 'id,name' },
    });

    // Get pages the user manages
    const pagesResponse = await axios.get(
      'https://graph.facebook.com/v19.0/me/accounts',
      {
        params: { access_token: longLivedToken },
      },
    );

    const pages = pagesResponse.data.data || [];
    const savedAccounts: SocialAccountDocument[] = [];

    for (const page of pages) {
      // Check for existing account for this page
      const existing = await this.socialAccountModel.findOne({
        userId: new Types.ObjectId(userId),
        pageId: page.id,
      });

      if (existing) {
        existing.accessToken = page.access_token;
        existing.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);
        existing.isActive = true;
        await existing.save();
        savedAccounts.push(existing);
      } else {
        // Check if page has Instagram business account
        let igUserId: string | undefined;
        try {
          const igResponse = await axios.get(
            `https://graph.facebook.com/v19.0/${page.id}`,
            {
              params: {
                fields: 'instagram_business_account',
                access_token: page.access_token,
              },
            },
          );
          igUserId = igResponse.data.instagram_business_account?.id;
        } catch {
          this.logger.warn(`Could not fetch IG account for page ${page.id}`);
        }

        // Save Facebook page account
        const fbAccount = new this.socialAccountModel({
          userId: new Types.ObjectId(userId),
          platform: 'facebook',
          platformUserId: userResponse.data.id,
          platformUsername: userResponse.data.name,
          pageName: page.name,
          pageId: page.id,
          igUserId,
          accessToken: page.access_token,
          tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
          isActive: true,
          metadata: { category: page.category },
        });
        await fbAccount.save();
        savedAccounts.push(fbAccount);

        // If Instagram account exists, save it separately
        if (igUserId) {
          const igExisting = await this.socialAccountModel.findOne({
            userId: new Types.ObjectId(userId),
            igUserId,
            platform: 'instagram',
          });

          if (!igExisting) {
            let igUsername = '';
            try {
              const igUserResp = await axios.get(
                `https://graph.facebook.com/v19.0/${igUserId}`,
                {
                  params: {
                    fields: 'username',
                    access_token: page.access_token,
                  },
                },
              );
              igUsername = igUserResp.data.username || '';
            } catch {
              this.logger.warn(`Could not fetch IG username for ${igUserId}`);
            }

            const igAccount = new this.socialAccountModel({
              userId: new Types.ObjectId(userId),
              platform: 'instagram',
              platformUserId: igUserId,
              platformUsername: igUsername,
              pageId: page.id,
              igUserId,
              accessToken: page.access_token,
              tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
              isActive: true,
            });
            await igAccount.save();
            savedAccounts.push(igAccount);
          }
        }
      }
    }

    return savedAccounts;
  }

  async publishToFacebook(
    accountId: string,
    userId: string,
    message: string,
    imageUrl?: string,
  ): Promise<{ id: string }> {
    const account = await this.getAccountById(accountId, userId);

    if (account.platform !== 'facebook') {
      throw new BadRequestException('Account is not a Facebook account');
    }

    this.checkTokenExpiry(account);

    try {
      let response;
      if (imageUrl) {
        response = await axios.post(
          `https://graph.facebook.com/v19.0/${account.pageId}/photos`,
          null,
          {
            params: {
              url: imageUrl,
              message,
              access_token: account.accessToken,
            },
          },
        );
      } else {
        response = await axios.post(
          `https://graph.facebook.com/v19.0/${account.pageId}/feed`,
          null,
          {
            params: {
              message,
              access_token: account.accessToken,
            },
          },
        );
      }

      return { id: response.data.id || response.data.post_id };
    } catch (error: any) {
      this.handleApiError(error, 'Facebook');
    }
  }

  async publishToInstagram(
    accountId: string,
    userId: string,
    caption: string,
    imageUrl: string,
  ): Promise<{ id: string }> {
    const account = await this.getAccountById(accountId, userId);

    if (account.platform !== 'instagram') {
      throw new BadRequestException('Account is not an Instagram account');
    }

    this.checkTokenExpiry(account);

    const igUserId = account.igUserId;
    if (!igUserId) {
      throw new BadRequestException(
        'No Instagram business account linked to this account',
      );
    }

    try {
      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${igUserId}/media`,
        null,
        {
          params: {
            image_url: imageUrl,
            caption,
            access_token: account.accessToken,
          },
        },
      );

      const containerId = containerResponse.data.id;

      // Step 2: Wait and publish
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const publishResponse = await axios.post(
        `https://graph.facebook.com/v19.0/${igUserId}/media_publish`,
        null,
        {
          params: {
            creation_id: containerId,
            access_token: account.accessToken,
          },
        },
      );

      return { id: publishResponse.data.id };
    } catch (error: any) {
      this.handleApiError(error, 'Instagram');
    }
  }

  async disconnectAccount(accountId: string, userId: string): Promise<void> {
    const account = await this.getAccountById(accountId, userId);
    account.isActive = false;
    await account.save();
  }

  private checkTokenExpiry(account: SocialAccountDocument): void {
    if (account.tokenExpiresAt && account.tokenExpiresAt < new Date()) {
      throw new BadRequestException(
        `${account.platform} token has expired. Please reconnect your account.`,
      );
    }
  }

  private handleApiError(error: any, platform: string): never {
    const errorData = error.response?.data?.error;
    if (errorData) {
      const code = errorData.code;
      const message = errorData.message;

      if (code === 190) {
        throw new BadRequestException(
          `${platform} access token expired or invalid. Please reconnect your account.`,
        );
      }
      if (code === 10 || code === 200) {
        throw new BadRequestException(
          `${platform} permissions error: ${message}`,
        );
      }
      if (code === 4 || code === 32) {
        throw new BadRequestException(
          `${platform} rate limit reached. Please try again later.`,
        );
      }
      throw new BadRequestException(`${platform} API error: ${message}`);
    }
    throw new BadRequestException(
      `Failed to publish to ${platform}: ${error.message}`,
    );
  }
}
