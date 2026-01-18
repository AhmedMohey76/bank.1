import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { AdminUser } from './adminUser';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => AdminUser, (adminUser) => adminUser)
  admin: AdminUser;
}
