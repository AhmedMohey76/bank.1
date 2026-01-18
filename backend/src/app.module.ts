import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

// 1. Import ALL Entities (Database Tables)
import { User } from './modules/users';
import { OTP } from './modules/otp';
import { Account } from './modules/user-account';
import { Transaction } from './modules/transaction';
import { IdempotencyLog } from './modules/onebyone'; // 👈 The new Idempotency entity

// 2. Import Controllers & Services
import { AuthController } from './controller/auth-controller';
import { AuthService } from './service/auth-service';
import { TransactionController } from './controller/transaction-cotroller';
import { TransactionService } from './service/transaction-service';

@Module({
  imports: [
    // 3. Main Database Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '0076', // Your pgAdmin password
      database: 'bank_db',

      // 👇 IMPORTANT: Add ALL 5 entities here so TypeORM creates the tables
      entities: [User, OTP, Account, Transaction, IdempotencyLog],

      synchronize: true, // ⚠️ Auto-updates DB (great for dev, turn off in production)
    }),

    // 4. Register Repositories (Ingredients for the chefs)
    // 👇 Add ALL 5 entities here too so Services can use them
    TypeOrmModule.forFeature([User, OTP, Account, Transaction, IdempotencyLog]),

    // 5. JWT Configuration (Security Tokens)
    JwtModule.register({
      global: true,
      secret: 'YOUR_SECRET_KEY',
      signOptions: { expiresIn: '15m' },
    }),
  ],

  // 6. Controllers (The Waiters)
  controllers: [AuthController, TransactionController],

  // 7. Services (The Chefs)
  providers: [AuthService, TransactionService],
})
export class AppModule {}
