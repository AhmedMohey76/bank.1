import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthService } from '../service/auth-service';
import { CreateUserDto } from '../dto/create-user';
import { SendOtpDto } from '../dto/send-otp';
import { VerifyOtpDto } from '../dto/verify-otp';
import { RefreshTokenDto } from '../dto/refresh-token';
import { User } from '../modules/users';
import { AuthGuard } from '../guards/auth-guard';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.authService.register(createUserDto);
  }

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Request() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    return await this.authService.logout(userId);
  }
}
