import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './user-account';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  // Link to the Sender's Account
  @ManyToOne(() => Account, { nullable: true })
  fromAccount: Account;

  // Link to the Receiver's Account
  @ManyToOne(() => Account, { nullable: true })
  toAccount: Account;

  // 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL'
  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
