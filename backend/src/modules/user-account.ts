import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './users';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  accountNumber: string;

  // Use 'decimal' for money to avoid math errors!
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 'CURRENT' })
  accountType: string; // 'CURRENT' or 'SAVINGS'

  // Link Account -> User
  @ManyToOne(() => User, (user) => user.accounts)
  user: User;
}
