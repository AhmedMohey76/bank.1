import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;
}
