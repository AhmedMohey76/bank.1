import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { TransactionService } from '../service/transaction-service';
import { AuthGuard } from '../guards/auth-guard';
import { GetTransactionsDto } from '../dto/get-transaction';

interface RequestWithUser {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // -------------------------------------------------------
  // 1. SEND MONEY
  // -------------------------------------------------------
  @UseGuards(AuthGuard)
  @Post('transfer')
  async transfer(
    @Request() req,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() body: { fromAccountId: number; toAccount: string; amount: number },
  ) {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }

    return await this.transactionService.transfer(
      idempotencyKey,
      body.fromAccountId,
      body.toAccount,
      body.amount,
    );
  }

  // -------------------------------------------------------
  // 2. VIEW HISTORY
  // -------------------------------------------------------
  @UseGuards(AuthGuard)
  @Get()
  async getTransactions(
    @Request() req: RequestWithUser, // 👈 2. Apply the interface here!
    @Query() query: GetTransactionsDto,
  ) {
    return await this.transactionService.getHistory(req.user.sub, query);
  }
}
