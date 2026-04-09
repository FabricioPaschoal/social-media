import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PostsService } from './posts.service';
import { Post } from './schemas/post.schema';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';

describe('PostsService', () => {
  let service: PostsService;
  let postModel: any;
  let socialAccountsService: Partial<
    Record<keyof SocialAccountsService, jest.Mock>
  >;
  let i18nService: Partial<Record<keyof I18nService, jest.Mock>>;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockPostId = '507f1f77bcf86cd799439012';
  const mockAccountId = '507f1f77bcf86cd799439013';

  const mockPost = {
    _id: mockPostId,
    userId: mockUserId,
    socialAccountId: mockAccountId,
    title: 'Test Post',
    caption: 'Test caption',
    hashtags: ['test'],
    status: 'draft',
    targetPlatform: 'facebook',
    createdAt: new Date(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    socialAccountsService = {
      getAccountById: jest.fn().mockResolvedValue({
        _id: mockAccountId,
        platform: 'facebook',
        pageId: 'page123',
        accessToken: 'token123',
      }),
      publishToFacebook: jest.fn().mockResolvedValue({ id: 'fb-post-123' }),
      publishToInstagram: jest.fn().mockResolvedValue({ id: 'ig-post-123' }),
    };

    i18nService = {
      t: jest.fn().mockImplementation((key: string) => key),
    };

    const mockPostModelInstance = {
      save: jest.fn().mockResolvedValue(mockPost),
    };

    postModel = jest.fn().mockImplementation(() => mockPostModelInstance);
    postModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockPost]),
            }),
          }),
        }),
      }),
    });
    postModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPost),
    });
    postModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockPost),
    });
    postModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockPost);
    postModel.findByIdAndDelete = jest.fn().mockResolvedValue(mockPost);
    postModel.countDocuments = jest.fn().mockResolvedValue(1);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getModelToken(Post.name), useValue: postModel },
        { provide: SocialAccountsService, useValue: socialAccountsService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('should return posts and total count', async () => {
      const result = await service.findAllByUser(mockUserId);

      expect(result).toEqual({ posts: [mockPost], total: 1 });
      expect(postModel.find).toHaveBeenCalled();
      expect(postModel.countDocuments).toHaveBeenCalled();
    });

    it('should filter by status when provided', async () => {
      await service.findAllByUser(mockUserId, 'published');

      expect(postModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a post when found', async () => {
      const result = await service.findById(mockPostId, mockUserId);

      expect(result).toEqual(mockPost);
      expect(postModel.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException when post not found', async () => {
      postModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById(mockPostId, mockUserId)).rejects.toThrow(
        NotFoundException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.posts.notFound');
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for published posts', async () => {
      const publishedPost = { ...mockPost, status: 'published' };
      postModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(publishedPost),
      });

      await expect(
        service.update(mockPostId, mockUserId, { caption: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
      expect(i18nService.t).toHaveBeenCalledWith('common.posts.invalidStatus');
    });
  });

  describe('delete', () => {
    it('should delete a draft post', async () => {
      postModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPost),
      });

      await service.delete(mockPostId, mockUserId);

      expect(postModel.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);
    });

    it('should throw BadRequestException for publishing posts', async () => {
      const publishingPost = { ...mockPost, status: 'publishing' };
      postModel.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(publishingPost),
      });

      await expect(service.delete(mockPostId, mockUserId)).rejects.toThrow(
        BadRequestException,
      );
      expect(i18nService.t).toHaveBeenCalledWith('common.posts.invalidStatus');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      postModel.countDocuments.mockResolvedValue(10);
      postModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue([mockPost]),
          }),
        }),
      });

      const result = await service.getDashboardStats(mockUserId);

      expect(result).toHaveProperty('stats');
      expect(result).toHaveProperty('recentPosts');
      expect(result.stats).toHaveProperty('totalPosts');
      expect(result.stats).toHaveProperty('published');
      expect(result.stats).toHaveProperty('scheduled');
      expect(result.stats).toHaveProperty('failed');
    });
  });

  describe('updatePostStatus', () => {
    it('should update post status', async () => {
      await service.updatePostStatus(mockPostId, 'published');

      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
        }),
      );
    });

    it('should include error message when provided', async () => {
      await service.updatePostStatus(mockPostId, 'failed', 'API error');

      expect(postModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPostId,
        expect.objectContaining({
          status: 'failed',
          errorMessage: 'API error',
        }),
      );
    });
  });
});
