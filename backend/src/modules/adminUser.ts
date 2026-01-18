import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AuditLog } from './auditLogs';

@Entity()
export class AdminUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string;

  @OneToMany(() => AuditLog, (log) => log.admin)
  auditLogs: AuditLog[];
}
