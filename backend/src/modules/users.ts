import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OTP } from './otp';
import { Account } from './user-account';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'varchar', nullable: true })
  currentRefreshToken: string | null;

  @OneToMany(() => OTP, (otp) => otp.user)
  otps: OTP[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}
