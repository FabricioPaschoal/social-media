import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccount } from './schemas/social-account.schema';

describe('SocialAccountsService', () => {
  let service: SocialAccountsService;
  let socialAccountModel: any;
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>;

  const mockAccountId = '507f1f77bcf86cd799439013';
  const mockUserId = '507f1f77bcf86cd799439011';

  const mockAccount = {
    _id: mockAccountId,
    userId: mockUserId,
    platform: 'facebook',
    platformUserId: 'fb-user-123',
    platformUsername: 'Test User',
    pageName: 'Test Page',
    pageId: 'page123',
    accessToken: 'token123',
    tokenExpiresAt: new Date(Date.now() + 86400000),
    isActive: true,
    save: jest.fn(),
  };

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          FACEBOOK_APP_ID: 'test-app-id',
          FACEBOOK_APP_SECRET: 'test-app-secret',
          FACEBOOK_REDIRECT_URI:
            'http://localhost:4000/api/social-accounts/facebook/callback',
        };
        return config[key];
      }),
    };

    socialAccountModel = {
      find: jest.fn().mockResolvedValue([mockAccount]),
      findOne: jest.fn().mockResolvedValue(mockAccount),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAccountsService,
        {
          provide: getModelToken(SocialAccount.name),
          useValue: socialAccountModel,
        },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<SocialAccountsService>(SocialAccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccountsByUser', () => {
    it('should return accounts for a user', async () => {
      const result = await service.getAccountsByUser(mockUserId);

      expect(result).toEqual([mockAccount]);
      expect(socialAccountModel.find).toHaveBeenCalled();
    });
  });

  describe('getAccountById', () => {
    it('should return an account when found', async () => {
      const result = await service.getAccountById(mockAccountId, mockUserId);

      expect(result).toEqual(mockAccount);
      expect(socialAccountModel.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when account not found', async () => {
      socialAccountModel.findOne.mockResolvedValue(null);

      await expect(
        service.getAccountById('nonexistent', mockUserId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFacebookAuthUrl', () => {
    it('should return a valid Facebook auth URL', () => {
      const url = service.getFacebookAuthUrl();

      expect(url).toContain('https://www.facebook.com/v19.0/dialog/oauth');
      expect(url).toContain('client_id=test-app-id');
      expect(url).toContain('scope=');
      expect(url).toContain('pages_manage_posts');
      expect(url).toContain('instagram_content_publish');
    });
  });

  describe('disconnectAccount', () => {
    it('should deactivate an account', async () => {
      socialAccountModel.findOne.mockResolvedValue(mockAccount);

      await service.disconnectAccount(mockAccountId, mockUserId);

      expect(mockAccount.isActive).toBe(false);
      expect(mockAccount.save).toHaveBeenCalled();
    });
  });

  describe('checkTokenExpiry (private)', () => {
    it('should throw BadRequestException when token is expired', () => {
      const expiredAccount = {
        ...mockAccount,
        platform: 'facebook',
        tokenExpiresAt: new Date(Date.now() - 86400000),
      };

      // Access private method via prototype
      expect(() => {
        (service as any).checkTokenExpiry(expiredAccount);
      }).toThrow(BadRequestException);
    });

    it('should not throw when token is valid', () => {
      const validAccount = {
        ...mockAccount,
        tokenExpiresAt: new Date(Date.now() + 86400000),
      };

      expect(() => {
        (service as any).checkTokenExpiry(validAccount);
      }).not.toThrow();
    });
  });
});
