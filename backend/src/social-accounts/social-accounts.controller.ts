import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SocialAccountsService } from './social-accounts.service';

@ApiTags('social-accounts')
@Controller('social-accounts')
export class SocialAccountsController {
  constructor(
    private readonly socialAccountsService: SocialAccountsService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  async getAccounts(@Request() req: any) {
    return this.socialAccountsService.getAccountsByUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('facebook/auth-url')
  getFacebookAuthUrl() {
    return { url: this.socialAccountsService.getFacebookAuthUrl() };
  }

  @Get('facebook/callback')
  async facebookCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    try {
      // state contains the userId passed during OAuth initiation
      const userId = state;
      await this.socialAccountsService.handleFacebookCallback(code, userId);
      res.redirect(`${frontendUrl}/social-accounts?connected=true`);
    } catch (error: any) {
      res.redirect(
        `${frontendUrl}/social-accounts?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  async disconnectAccount(@Param('id') id: string, @Request() req: any) {
    await this.socialAccountsService.disconnectAccount(id, req.user.userId);
    return { message: 'Account disconnected successfully' };
  }
}
