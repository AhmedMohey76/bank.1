import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User } from '../modules/users';
import { OTP } from '../modules/otp';
import { CreateUserDto } from '../dto/create-user';
import { SendOtpDto } from '../dto/send-otp';
import { VerifyOtpDto } from '../dto/verify-otp';
import { RefreshTokenDto } from '../dto/refresh-token';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(OTP) private otpRepository: Repository<OTP>,
    private jwtService: JwtService,
  ) {}

  // ==========================================
  // 1. REGISTER USER
  // ==========================================
  async register(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, phoneNumber, email, password } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this email or phone already exists',
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = this.userRepository.create({
      fullName,
      email,
      phoneNumber,
      passwordHash,
    });

    return await this.userRepository.save(newUser);
  }

  // ==========================================
  // 2. SEND OTP
  // ==========================================
  async sendOtp(sendOtpDto: SendOtpDto) {
    const { phoneNumber } = sendOtpDto;

    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException('User with this phone number not found');
    }

    const limitDuration = 15 * 60 * 1000;
    const timeThreshold = new Date(Date.now() - limitDuration);

    const recentOtps = await this.otpRepository.count({
      where: {
        user: { id: user.id },
        createdAt: MoreThan(timeThreshold),
      },
    });

    if (recentOtps >= 3) {
      throw new BadRequestException(
        'Too many OTP requests. Please wait a while.',
      );
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const newOtp = this.otpRepository.create({
      user: user,
      code: otpCode,
      expiresAt: expiresAt,
      isUsed: false,
    });

    await this.otpRepository.save(newOtp);

    console.log(`>>> 🔔 SMS SENT TO ${phoneNumber}: ${otpCode}`);

    return { message: 'OTP sent successfully' };
  }

  // ==========================================
  // 3. VERIFY OTP
  // ==========================================
  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phoneNumber, otpCode } = verifyOtpDto;

    const user = await this.userRepository.findOne({ where: { phoneNumber } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otpRecord = await this.otpRepository.findOne({
      where: {
        user: { id: user.id },
        code: otpCode,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otpRecord.isUsed) {
      throw new BadRequestException('OTP already used');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP expired');
    }

    otpRecord.isUsed = true;
    await this.otpRepository.save(otpRecord);

    return await this.getTokens(user.id, user.email);
  }

  // ==========================================
  // 4. REFRESH TOKEN (Updated)
  // ==========================================
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: 'YOUR_REFRESH_SECRET',
        },
      );

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      if (refreshToken !== user.currentRefreshToken) {
        throw new UnauthorizedException('Invalid Refresh Token');
      }

      return await this.getTokens(user.id, user.email);
    } catch (error) {
      console.error('Refresh Token Error:', error);
      throw new UnauthorizedException('Access Denied');
    }
  }

  /// ==========================================
  // 5. LOGOUT
  // ==========================================
  async logout(userId: number) {
    await this.userRepository.update(userId, {
      currentRefreshToken: null,
    });

    return { message: 'Logged out successfully' };
  }
  // ==========================================
  // 6. PRIVATE HELPER (Updated)
  // ==========================================
  private async getTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: 'YOUR_SECRET_KEY',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: 'YOUR_REFRESH_SECRET',
        expiresIn: '7d',
      }),
    ]);

    await this.userRepository.update(userId, {
      currentRefreshToken: refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
