import { AppDataSource } from '../infrastructure/data-source';
import { PaymentInstruction, PaymentStatus } from '../domain/payment';
import { Repository } from 'typeorm';

export class PaymentService {
  private repo: Repository<PaymentInstruction>;

  constructor() {
    this.repo = AppDataSource.getRepository(PaymentInstruction);
  }

  async initiatePayment(data: {
    debtorAccount: string;
    creditorAccount: string;
    amount: number;
    currency: string;
    reference?: string;
  }): Promise<PaymentInstruction> {
    const payment = this.repo.create({
      ...data,
      status: 'PENDING',
    });
    return this.repo.save(payment);
  }

  async getPaymentById(id: string): Promise<PaymentInstruction | null> {
    return this.repo.findOneBy({ id });
  }

  async listPayments(): Promise<PaymentInstruction[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: PaymentStatus): Promise<PaymentInstruction | null> {
    const payment = await this.getPaymentById(id);
    if (!payment) return null;
    payment.status = status;
    return this.repo.save(payment);
  }
} 