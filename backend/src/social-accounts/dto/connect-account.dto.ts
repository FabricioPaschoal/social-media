import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ConnectAccountDto {
  @ApiProperty({ example: 'facebook', enum: ['facebook', 'instagram'] })
  @IsEnum(['facebook', 'instagram'])
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'OAuth authorization code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: 'Selected page ID for Facebook pages' })
  @IsString()
  @IsOptional()
  pageId?: string;
}

export class DisconnectAccountDto {
  @ApiProperty({ description: 'Social account ID to disconnect' })
  @IsString()
  @IsNotEmpty()
  accountId: string;
}
