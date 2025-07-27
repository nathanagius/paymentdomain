export class SchemeEligibilityService {
  isFasterPaymentsEligible(currency: string, amount: number): boolean {
    // Mock: Faster Payments supports GBP up to £250,000
    return currency === 'GBP' && amount <= 250000;
  }
} 