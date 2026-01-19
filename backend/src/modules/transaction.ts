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

  @ManyToOne(() => Account, { nullable: true })
  fromAccount: Account;

  @ManyToOne(() => Account, { nullable: true })
  toAccount: Account;

  @Column()
  type: string;

  @CreateDateColumn()
  createdAt: Date;
}
