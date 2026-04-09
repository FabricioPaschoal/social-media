import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'Spring Sale Announcement' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Check out our amazing spring sale! 🌸' })
  @IsString()
  @IsNotEmpty()
  caption: string;

  @ApiPropertyOptional({ example: ['springsale', 'deals'] })
  @IsArray()
  @IsOptional()
  hashtags?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imagePrompt?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  emojis?: string[];

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  variations?: Record<string, any>[];

  @ApiProperty({ example: 'facebook', enum: ['facebook', 'instagram', 'both'] })
  @IsEnum(['facebook', 'instagram', 'both'])
  @IsNotEmpty()
  targetPlatform: string;

  @ApiProperty({ description: 'Social account ID to publish to' })
  @IsString()
  @IsNotEmpty()
  socialAccountId: string;

  @ApiPropertyOptional({ enum: ['now', 'schedule'], default: 'now' })
  @IsEnum(['now', 'schedule'])
  @IsOptional()
  publishMode?: string;

  @ApiPropertyOptional({ example: '2025-03-01T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'AI input parameters used to generate this post',
  })
  @IsOptional()
  aiInput?: Record<string, any>;

  @ApiPropertyOptional({ description: 'AI output from generation' })
  @IsOptional()
  aiOutput?: Record<string, any>;
}
