import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class IdempotencyLog {
  @PrimaryColumn()
  key: string;

  @Column()
  transactionId: number;

  @CreateDateColumn()
  createdAt: Date;
}
