import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostsService } from '../posts/posts.service';
import { Log, LogDocument } from './schemas/log.schema';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private isProcessing = false;

  constructor(
    private postsService: PostsService,
    @InjectModel(Log.name) private logModel: Model<LogDocument>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledPosts() {
    if (this.isProcessing) {
      this.logger.debug('Scheduler already processing, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      const posts = await this.postsService.getScheduledPosts();

      if (posts.length === 0) {
        return;
      }

      this.logger.log(`Found ${posts.length} scheduled posts to publish`);

      for (const post of posts) {
        try {
          await this.postsService.publishPost(
            post._id.toString(),
            post.userId.toString(),
          );

          await this.createLog({
            userId: post.userId,
            postId: post._id as Types.ObjectId,
            level: 'success',
            action: 'publish',
            message: `Post "${post.title}" published successfully to ${post.targetPlatform}`,
            details: {
              platform: post.targetPlatform,
              platformPostId: post.platformPostId,
            },
          });

          this.logger.log(`Published post ${post._id} successfully`);
        } catch (error: any) {
          await this.createLog({
            userId: post.userId,
            postId: post._id as Types.ObjectId,
            level: 'error',
            action: 'publish',
            message: `Failed to publish post "${post.title}": ${error.message}`,
            details: {
              platform: post.targetPlatform,
              error: error.message,
            },
          });

          this.logger.error(
            `Failed to publish post ${post._id}: ${error.message}`,
          );
        }
      }
    } catch (error: any) {
      this.logger.error(`Scheduler error: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  async createLog(logData: {
    userId: Types.ObjectId;
    postId: Types.ObjectId;
    level: string;
    action: string;
    message: string;
    details?: Record<string, any>;
  }): Promise<LogDocument> {
    const log = new this.logModel(logData);
    return log.save();
  }

  async getLogsByUser(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ logs: LogDocument[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) };
    const [logs, total] = await Promise.all([
      this.logModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('postId', 'title targetPlatform')
        .exec(),
      this.logModel.countDocuments(filter),
    ]);
    return { logs, total };
  }

  async getLogsByPost(postId: string): Promise<LogDocument[]> {
    return this.logModel
      .find({ postId: new Types.ObjectId(postId) })
      .sort({ createdAt: -1 });
  }
}
