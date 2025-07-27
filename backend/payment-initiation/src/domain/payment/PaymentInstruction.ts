// @ts-ignore
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export class AccountDetails {
  @Column()
  accountId!: string;

  @Column()
  accountType!: string;

  @Column({ nullable: true })
  iban?: string;
}

@Entity()
export class PaymentInstruction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column(type => AccountDetails)
  debtorAccount: AccountDetails;

  @Column(type => AccountDetails)
  creditorAccount: AccountDetails;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ type: 'timestamp', nullable: true })
  requestedExecutionDate?: Date;

  @Column({ default: 'PENDING' })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
} 