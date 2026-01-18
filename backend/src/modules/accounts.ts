import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './users';
import { Transaction } from './transactions';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  accountNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column()
  accountType: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user)
  user: User;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[];
}
