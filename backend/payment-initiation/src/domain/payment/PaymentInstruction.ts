// @ts-ignore
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

@Entity()
export class PaymentInstruction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  debtorAccount: string;

  @Column()
  creditorAccount: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ default: 'PENDING' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
} 