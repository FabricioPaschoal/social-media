import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user.userId, createPostDto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.findAllByUser(
      req.user.userId,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.postsService.getDashboardStats(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.postsService.findById(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.user.userId, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    await this.postsService.delete(id, req.user.userId);
    return { message: 'Post deleted successfully' };
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() req: any) {
    return this.postsService.publishPost(id, req.user.userId);
  }
}
