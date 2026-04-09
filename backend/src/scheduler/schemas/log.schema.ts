import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true, collection: 'logs' })
export class Log {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  postId: Types.ObjectId;

  @Prop({ required: true, enum: ['info', 'warn', 'error', 'success'] })
  level: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  details: Record<string, any>;
}

export const LogSchema = SchemaFactory.createForClass(Log);

LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ postId: 1 });
LogSchema.index({ level: 1 });
