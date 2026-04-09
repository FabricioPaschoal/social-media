import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
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

  @ApiPropertyOptional({ enum: ['facebook', 'instagram', 'both'] })
  @IsEnum(['facebook', 'instagram', 'both'])
  @IsOptional()
  targetPlatform?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  socialAccountId?: string;

  @ApiPropertyOptional({ enum: ['draft', 'scheduled'] })
  @IsEnum(['draft', 'scheduled'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
