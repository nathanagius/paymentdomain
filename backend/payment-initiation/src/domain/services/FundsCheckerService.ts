import axios from 'axios';

export class FundsCheckerService {
  // In a real system, this would query the account aggregate or an external service
  async hasSufficientFunds(accountId: string, amount: number, customerId: string): Promise<boolean> {
    const CUSTOMER_API_URL = process.env.CUSTOMER_API_URL || 'http://customer-mock:4001';
    try {
      // Fetch accounts for the specific customer
      const res = await axios.get(`${CUSTOMER_API_URL}/accounts`, { params: { customerId } });
      const account = res.data.find((a: any) => a.id === accountId);
      if (!account) return false;
      return amount <= account.balance;
    } catch (err) {
      // On error, be safe and return false
      return false;
    }
  }
} 