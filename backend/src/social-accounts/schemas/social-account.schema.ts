import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SocialAccountDocument = SocialAccount & Document;

@Schema({ timestamps: true, collection: 'social_accounts' })
export class SocialAccount {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['facebook', 'instagram'] })
  platform: string;

  @Prop({ required: true })
  platformUserId: string;

  @Prop()
  platformUsername: string;

  @Prop()
  pageName: string;

  @Prop()
  pageId: string;

  @Prop()
  igUserId: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop()
  refreshToken: string;

  @Prop()
  tokenExpiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);

SocialAccountSchema.index({ userId: 1, platform: 1 });
SocialAccountSchema.index(
  { userId: 1, pageId: 1 },
  { unique: true, sparse: true },
);
