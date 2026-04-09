import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true, collection: 'posts' })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SocialAccount' })
  socialAccountId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  caption: string;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop()
  imagePrompt: string;

  @Prop()
  imageUrl: string;

  @Prop()
  category: string;

  @Prop({ type: [String], default: [] })
  emojis: string[];

  @Prop({ type: [Object], default: [] })
  variations: Record<string, any>[];

  @Prop({
    required: true,
    enum: ['draft', 'scheduled', 'publishing', 'published', 'failed'],
    default: 'draft',
  })
  status: string;

  @Prop({ enum: ['facebook', 'instagram', 'both'] })
  targetPlatform: string;

  @Prop()
  scheduledAt: Date;

  @Prop()
  publishedAt: Date;

  @Prop()
  platformPostId: string;

  @Prop()
  platformResponse: string;

  @Prop()
  errorMessage: string;

  @Prop({ type: Object, default: {} })
  aiInput: Record<string, any>;

  @Prop({ type: Object, default: {} })
  aiOutput: Record<string, any>;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ userId: 1, status: 1 });
PostSchema.index({ status: 1, scheduledAt: 1 });
PostSchema.index({ userId: 1, createdAt: -1 });
