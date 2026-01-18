import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Account } from './accounts';
import { OTP } from './otp';

@Entity() // This tells NestJS this class is a database table
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  currentRefreshToken: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];
}
