import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SocialAccountsService } from '../social-accounts/social-accounts.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private socialAccountsService: SocialAccountsService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    userId: string,
    createPostDto: CreatePostDto,
  ): Promise<PostDocument> {
    // Verify the social account belongs to the user
    await this.socialAccountsService.getAccountById(
      createPostDto.socialAccountId,
      userId,
    );

    const postData: any = {
      userId: new Types.ObjectId(userId),
      socialAccountId: new Types.ObjectId(createPostDto.socialAccountId),
      title: createPostDto.title,
      caption: createPostDto.caption,
      hashtags: createPostDto.hashtags || [],
      imagePrompt: createPostDto.imagePrompt,
      imageUrl: createPostDto.imageUrl,
      category: createPostDto.category,
      emojis: createPostDto.emojis || [],
      variations: createPostDto.variations || [],
      targetPlatform: createPostDto.targetPlatform,
      aiInput: createPostDto.aiInput || {},
      aiOutput: createPostDto.aiOutput || {},
    };

    if (createPostDto.publishMode === 'schedule' && createPostDto.scheduledAt) {
      const scheduledDate = new Date(createPostDto.scheduledAt);
      if (scheduledDate <= new Date()) {
        throw new BadRequestException(
          this.i18n.t('common.posts.invalidStatus'),
        );
      }
      postData.status = 'scheduled';
      postData.scheduledAt = scheduledDate;
    } else if (createPostDto.publishMode === 'now') {
      postData.status = 'publishing';
    } else {
      postData.status = 'draft';
    }

    const post = new this.postModel(postData);
    const saved = await post.save();

    // If publishing now, trigger immediate publish
    if (postData.status === 'publishing') {
      this.publishPost(saved._id.toString(), userId).catch((err) => {
        this.logger.error(`Immediate publish failed: ${err.message}`);
      });
    }

    return saved;
  }

  async findAllByUser(
    userId: string,
    status?: string,
    page = 1,
    limit = 20,
  ): Promise<{ posts: PostDocument[]; total: number }> {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      filter.status = status;
    }

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('socialAccountId', 'platform platformUsername pageName')
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return { posts, total };
  }

  async findById(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel
      .findOne({
        _id: postId,
        userId: new Types.ObjectId(userId),
      })
      .populate(
        'socialAccountId',
        'platform platformUsername pageName pageId igUserId',
      );

    if (!post) {
      throw new NotFoundException(this.i18n.t('common.posts.notFound'));
    }
    return post;
  }

  async update(
    postId: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<PostDocument> {
    const post = await this.findById(postId, userId);

    if (post.status === 'published' || post.status === 'publishing') {
      throw new BadRequestException(this.i18n.t('common.posts.invalidStatus'));
    }

    if (updatePostDto.socialAccountId) {
      await this.socialAccountsService.getAccountById(
        updatePostDto.socialAccountId,
        userId,
      );
    }

    const updateData: any = { ...updatePostDto };
    if (updatePostDto.socialAccountId) {
      updateData.socialAccountId = new Types.ObjectId(
        updatePostDto.socialAccountId,
      );
    }
    if (updatePostDto.scheduledAt) {
      updateData.scheduledAt = new Date(updatePostDto.scheduledAt);
    }

    const updated = await this.postModel.findByIdAndUpdate(postId, updateData, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException(this.i18n.t('common.posts.notFound'));
    }
    return updated;
  }

  async delete(postId: string, userId: string): Promise<void> {
    const post = await this.findById(postId, userId);
    if (post.status === 'publishing') {
      throw new BadRequestException(this.i18n.t('common.posts.invalidStatus'));
    }
    await this.postModel.findByIdAndDelete(postId);
  }

  async publishPost(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postModel
      .findById(postId)
      .populate('socialAccountId');

    if (!post) {
      throw new NotFoundException(this.i18n.t('common.posts.notFound'));
    }

    const account = post.socialAccountId as any;
    if (!account) {
      await this.updatePostStatus(
        postId,
        'failed',
        this.i18n.t('common.posts.socialAccountRequired'),
      );
      throw new BadRequestException(
        this.i18n.t('common.posts.socialAccountRequired'),
      );
    }

    await this.postModel.findByIdAndUpdate(postId, { status: 'publishing' });

    try {
      const fullCaption = this.buildFullCaption(post.caption, post.hashtags);

      let result: { id: string };

      if (
        post.targetPlatform === 'facebook' ||
        (post.targetPlatform === 'both' && account.platform === 'facebook')
      ) {
        result = await this.socialAccountsService.publishToFacebook(
          account._id.toString(),
          userId,
          fullCaption,
          post.imageUrl,
        );
      } else if (
        post.targetPlatform === 'instagram' ||
        (post.targetPlatform === 'both' && account.platform === 'instagram')
      ) {
        if (!post.imageUrl) {
          throw new BadRequestException(
            this.i18n.t('common.posts.captionRequired'),
          );
        }
        result = await this.socialAccountsService.publishToInstagram(
          account._id.toString(),
          userId,
          fullCaption,
          post.imageUrl,
        );
      } else {
        throw new BadRequestException(
          `Unsupported platform: ${post.targetPlatform}`,
        );
      }

      const publishedPost = await this.postModel.findByIdAndUpdate(
        postId,
        {
          status: 'published',
          publishedAt: new Date(),
          platformPostId: result.id,
        },
        { new: true },
      );
      if (!publishedPost) {
        throw new NotFoundException(this.i18n.t('common.posts.notFound'));
      }
      return publishedPost;
    } catch (error: any) {
      await this.updatePostStatus(postId, 'failed', error.message);
      throw error;
    }
  }

  async getScheduledPosts(): Promise<PostDocument[]> {
    return this.postModel
      .find({
        status: 'scheduled',
        scheduledAt: { $lte: new Date() },
      })
      .populate('socialAccountId');
  }

  async updatePostStatus(
    postId: string,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    const update: any = { status };
    if (errorMessage) {
      update.errorMessage = errorMessage;
    }
    if (status === 'published') {
      update.publishedAt = new Date();
    }
    await this.postModel.findByIdAndUpdate(postId, update);
  }

  async getDashboardStats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const [totalPosts, published, scheduled, failed] = await Promise.all([
      this.postModel.countDocuments({ userId: userObjectId }),
      this.postModel.countDocuments({
        userId: userObjectId,
        status: 'published',
      }),
      this.postModel.countDocuments({
        userId: userObjectId,
        status: 'scheduled',
      }),
      this.postModel.countDocuments({
        userId: userObjectId,
        status: 'failed',
      }),
    ]);

    const recentPosts = await this.postModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('socialAccountId', 'platform platformUsername pageName');

    return {
      stats: { totalPosts, published, scheduled, failed },
      recentPosts,
    };
  }

  private buildFullCaption(caption: string, hashtags: string[]): string {
    if (!hashtags || hashtags.length === 0) return caption;
    const hashtagStr = hashtags.map((h) => `#${h}`).join(' ');
    return `${caption}\n\n${hashtagStr}`;
  }
}
