import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, Brackets } from 'typeorm';
import { Account } from '../modules/user-account';
import { Transaction } from '../modules/transaction';
import { IdempotencyLog } from '../modules/onebyone';
import { GetTransactionsDto } from '../dto/get-transaction';

@Injectable()
export class TransactionService {
  constructor(private dataSource: DataSource) {}

  // ---------------------------------------------------------
  // 1. TRANSFER MONEY (With Idempotency & Locking)
  // ---------------------------------------------------------
  async transfer(
    idempotencyKey: string,
    fromAccountId: number,
    toAccountNumber: string,
    amount: number,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      // A. 🛡️ IDEMPOTENCY CHECK (Prevents double submission)
      const existingKey = await manager.findOne(IdempotencyLog, {
        where: { key: idempotencyKey },
        lock: { mode: 'pessimistic_write' }, // Lock this key so no one else can write it simultaneously
      });

      if (existingKey) {
        return {
          message: 'Transfer already processed (Idempotent)',
          transactionId: existingKey.transactionId,
        };
      }

      // B. 🔍 VALIDATION (Sender & Receiver)
      // Lock the SENDER to prevent negative balance race conditions
      const sender = await manager.findOne(Account, {
        where: { id: fromAccountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!sender) throw new NotFoundException('Sender account not found');
      if (Number(sender.balance) < amount)
        throw new BadRequestException('Insufficient funds');

      const receiver = await manager.findOne(Account, {
        where: { accountNumber: toAccountNumber },
      });

      if (!receiver) throw new NotFoundException('Receiver account not found');

      // C. 💸 EXECUTE TRANSFER (Update Balances)
      // Use Number() to ensure we don't accidentally concat strings
      sender.balance = Number(sender.balance) - Number(amount);
      receiver.balance = Number(receiver.balance) + Number(amount);

      await manager.save(sender);
      await manager.save(receiver);

      // D. 📝 CREATE RECEIPT (Transaction Record)
      const record = manager.create(Transaction, {
        amount: amount,
        fromAccount: sender,
        toAccount: receiver,
        type: 'TRANSFER',
      });

      const savedTransaction = await manager.save(record);

      // E. 🔒 SAVE IDEMPOTENCY KEY
      const keyLog = manager.create(IdempotencyLog, {
        key: idempotencyKey,
        transactionId: savedTransaction.id,
      });
      await manager.save(keyLog);

      return {
        message: 'Transfer successful',
        transactionId: savedTransaction.id,
      };
    });
  }

  // ---------------------------------------------------------
  // 2. GET HISTORY (Pagination & Security)
  // ---------------------------------------------------------
  async getHistory(userId: number, query: GetTransactionsDto) {
    const { page = 1, limit = 10, type, accountId } = query;
    const skip = (page - 1) * limit;

    // A. Security: Find all accounts belonging to this user
    // We only show transactions where the user owns AT LEAST one of the accounts involved.
    const userAccounts = await this.dataSource.getRepository(Account).find({
      where: { user: { id: userId } },
    });

    // If user has no accounts, they have no transactions
    if (userAccounts.length === 0) {
      return { data: [], count: 0, page, limit, totalPages: 0 };
    }

    const userAccountIds = userAccounts.map((acc) => acc.id);

    // B. Build the Query
    const qb = this.dataSource
      .getRepository(Transaction)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.fromAccount', 'fromAccount')
      .leftJoinAndSelect('transaction.toAccount', 'toAccount')

      // Complex Logic: "Show me transfers where I am the Sender OR I am the Receiver"
      .where(
        new Brackets((qb) => {
          qb.where('fromAccount.id IN (:...ids)', {
            ids: userAccountIds,
          }).orWhere('toAccount.id IN (:...ids)', { ids: userAccountIds });
        }),
      );

    // C. Apply Filters (Optional)
    if (type) {
      qb.andWhere('transaction.type = :type', { type });
    }

    if (accountId) {
      // Allow filtering by a specific account number (e.g. "Show only my Savings history")
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('fromAccount.accountNumber = :accNum', {
            accNum: accountId,
          }).orWhere('toAccount.accountNumber = :accNum', {
            accNum: accountId,
          });
        }),
      );
    }

    // D. Pagination & Sorting
    qb.orderBy('transaction.createdAt', 'DESC').skip(skip).take(limit);

    // E. Execute
    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}
