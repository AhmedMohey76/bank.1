import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { User } from './modules/users';
import { OTP } from './modules/otp';
import { Account } from './modules/user-account';
import { Transaction } from './modules/transaction';
import { IdempotencyLog } from './modules/onebyone'; // 👈 The new Idempotency entity

import { AuthController } from './controller/auth-controller';
import { AuthService } from './service/auth-service';
import { TransactionController } from './controller/transaction-cotroller';
import { TransactionService } from './service/transaction-service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '0076',
      database: 'bank_db',

      entities: [User, OTP, Account, Transaction, IdempotencyLog],

      synchronize: true,
    }),

    TypeOrmModule.forFeature([User, OTP, Account, Transaction, IdempotencyLog]),

    JwtModule.register({
      global: true,
      secret: 'YOUR_SECRET_KEY',
      signOptions: { expiresIn: '15m' },
    }),
  ],

  controllers: [AuthController, TransactionController],

  providers: [AuthService, TransactionService],
})
export class AppModule {}
