export class FraudDetectionService {
  isPaymentRisky(amount: number, debtorAccount: string, creditorAccount: string): boolean {
    // Mock: flag payments over £10,000 as risky
    return amount > 10000;
  }
} 