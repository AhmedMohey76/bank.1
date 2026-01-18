import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTransactionsDto {
  @IsOptional()
  @Type(() => Number) // Convert string "1" to number 1
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['TRANSFER', 'DEPOSIT', 'WITHDRAWAL'])
  type?: string;

  @IsOptional()
  @IsString()
  accountId?: string; // Optional: Filter by specific account
}
