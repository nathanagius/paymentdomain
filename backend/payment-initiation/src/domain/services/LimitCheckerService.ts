export class LimitCheckerService {
  static SINGLE_PAYMENT_LIMIT = 500;
  static DAILY_LIMIT = 2000;

  isWithinSinglePaymentLimit(amount: number): boolean {
    return amount <= LimitCheckerService.SINGLE_PAYMENT_LIMIT;
  }

  isWithinDailyLimit(accountId: string, amount: number): boolean {
    // Mock: daily total is always 0
    return amount <= LimitCheckerService.DAILY_LIMIT;
  }
} 