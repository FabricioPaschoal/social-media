import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePostDto {
  @ApiProperty({ example: 'Launch of our new eco-friendly product line' })
  @IsString()
  @IsNotEmpty()
  postDescription: string;

  @ApiPropertyOptional({ example: 'Increase brand awareness' })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional({ example: 'Millennials interested in sustainability' })
  @IsString()
  @IsOptional()
  audience?: string;

  @ApiPropertyOptional({ example: 'Professional yet friendly' })
  @IsString()
  @IsOptional()
  tone?: string;

  @ApiPropertyOptional({ example: 'image', enum: ['image', 'video', 'carousel', 'text'] })
  @IsString()
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({ example: ['sustainable', 'eco-friendly'] })
  @IsArray()
  @IsOptional()
  mandatoryKeywords?: string[];

  @ApiPropertyOptional({ example: 'GreenLife Co.' })
  @IsString()
  @IsOptional()
  brandName?: string;
}
