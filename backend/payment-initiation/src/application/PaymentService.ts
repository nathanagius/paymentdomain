import { AppDataSource } from '../infrastructure/data-source';
import { PaymentInstruction, PaymentStatus } from '../domain/payment';
import { Repository } from 'typeorm';
import { FundsCheckerService } from '../domain/services/FundsCheckerService';
import { LimitCheckerService } from '../domain/services/LimitCheckerService';
import { SchemeEligibilityService } from '../domain/services/SchemeEligibilityService';
import { FraudDetectionService } from '../domain/services/FraudDetectionService';

export class PaymentService {
  private repo: Repository<PaymentInstruction>;
  private fundsChecker = new FundsCheckerService();
  private limitChecker = new LimitCheckerService();
  private schemeEligibility = new SchemeEligibilityService();
  private fraudDetection = new FraudDetectionService();

  constructor() {
    this.repo = AppDataSource.getRepository(PaymentInstruction);
  }

  async initiatePayment(data: {
    debtorAccount: {
      accountId: string;
      accountType: string;
      iban?: string;
      customerId: string;
    };
    creditorAccount: {
      accountId: string;
      accountType: string;
      iban?: string;
    };
    amount: number;
    currency: string;
    reference?: string;
    requestedExecutionDate?: Date;
  }): Promise<PaymentInstruction> {
    // Business rule checks
    if (!this.limitChecker.isWithinDailyLimit(data.debtorAccount.accountId, data.amount)) {
      throw new Error('Exceeds daily payment limit');
    }
    if (!this.limitChecker.isWithinSinglePaymentLimit(data.amount)) {
      throw new Error('Exceeds single payment limit');
    }
    if (this.fraudDetection.isPaymentRisky(data.amount, data.debtorAccount.accountId, data.creditorAccount.accountId)) {
      throw new Error('Payment flagged as potentially fraudulent');
    }
    if (!(await this.fundsChecker.hasSufficientFunds(data.debtorAccount.accountId, data.amount, data.debtorAccount.customerId))) {
      throw new Error('Insufficient funds');
    }
    if (!this.schemeEligibility.isFasterPaymentsEligible(data.currency, data.amount)) {
      throw new Error('Not eligible for Faster Payments');
    }
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