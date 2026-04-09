import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GeneratePostDto } from './dto/generate-post.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('generate')
  async generatePost(@Body() generatePostDto: GeneratePostDto) {
    return this.aiService.generatePost(generatePostDto);
  }
}
