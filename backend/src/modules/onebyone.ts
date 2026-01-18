import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class IdempotencyLog {
  // We use the Key as the Primary Column (it must be unique!)
  @PrimaryColumn()
  key: string;

  // We store the ID of the transaction we created, so we can tell the user "Here is the receipt you already made"
  @Column()
  transactionId: number;

  @CreateDateColumn()
  createdAt: Date;
}
