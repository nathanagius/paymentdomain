const axios = require('axios');

const CUSTOMER_API = process.env.CUSTOMER_API_URL || 'http://localhost:4001';
const PAYMENT_API = process.env.PAYMENT_API_URL || 'http://localhost:4000';

const waitFor = async (fn, timeout = 20000, interval = 1000) => {
  const start = Date.now();
  while (true) {
    try {
      return await fn();
    } catch (e) {
      if (Date.now() - start > timeout) throw e;
      await new Promise(res => setTimeout(res, interval));
    }
  }
};

describe('Customer Mock API', () => {
  it('GET /customers returns customers', async () => {
    const res = await waitFor(() => axios.get(`${CUSTOMER_API}/customers`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  }, 30000);

  it('GET /accounts?customerId=cust1 returns accounts', async () => {
    const res = await waitFor(() => axios.get(`${CUSTOMER_API}/accounts`, { params: { customerId: 'cust1' } }));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  }, 30000);
});

describe('Payment Initiation API (BIAN)', () => {
  let paymentInitiationId;

  it('POST /payment-initiations creates a payment', async () => {
    const res = await waitFor(() => axios.post(`${PAYMENT_API}/payment-initiations`, {
      debtorAccount: {
        accountId: 'acc1',
        accountType: 'Current',
        iban: 'GB00CUST1000000001',
      },
      creditorAccount: {
        accountId: 'acc3',
        accountType: 'Current',
        iban: 'GB00CUST2000000001',
      },
      amount: 10.5,
      currency: 'GBP',
      reference: 'Test payment',
      requestedExecutionDate: '2024-06-01',
    }));
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('paymentInitiationId');
    paymentInitiationId = res.data.paymentInitiationId;
  }, 30000);

  it('GET /payment-initiations returns payments', async () => {
    const res = await waitFor(() => axios.get(`${PAYMENT_API}/payment-initiations`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('paymentInitiationId');
    expect(res.data[0]).toHaveProperty('debtorAccount');
    expect(res.data[0]).toHaveProperty('creditorAccount');
  }, 30000);

  it('GET /payment-initiations/:id returns the payment', async () => {
    const res = await waitFor(() => axios.get(`${PAYMENT_API}/payment-initiations/${paymentInitiationId}`));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('paymentInitiationId', paymentInitiationId);
    expect(res.data).toHaveProperty('debtorAccount');
    expect(res.data).toHaveProperty('creditorAccount');
  }, 30000);

  it('POST /payment-initiations/:id/execute marks payment as completed', async () => {
    const res = await waitFor(() => axios.post(`${PAYMENT_API}/payment-initiations/${paymentInitiationId}/execute`));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('status', 'COMPLETED');
  }, 30000);

  it('POST /payment-initiations/:id/notify acknowledges notification', async () => {
    const res = await waitFor(() => axios.post(`${PAYMENT_API}/payment-initiations/${paymentInitiationId}/notify`));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message', 'Notification received');
  }, 30000);

  it('should reject payment if insufficient funds', async () => {
    await expect(
      axios.post(`${PAYMENT_API}/payment-initiations`, {
        debtorAccount: { accountId: 'acc1', accountType: 'Current', iban: 'GB00CUST1000000001' },
        creditorAccount: { accountId: 'acc3', accountType: 'Current', iban: 'GB00CUST2000000001' },
        amount: 2000, // Exceeds mock balance of 1000
        currency: 'GBP',
      })
    ).rejects.toMatchObject({ response: { status: 400, data: { error: 'Insufficient funds' } } });
  }, 30000);

  it('should reject payment if exceeds single payment limit', async () => {
    await expect(
      axios.post(`${PAYMENT_API}/payment-initiations`, {
        debtorAccount: { accountId: 'acc1', accountType: 'Current', iban: 'GB00CUST1000000001' },
        creditorAccount: { accountId: 'acc3', accountType: 'Current', iban: 'GB00CUST2000000001' },
        amount: 600, // Exceeds single payment limit of 500
        currency: 'GBP',
      })
    ).rejects.toMatchObject({ response: { status: 400, data: { error: 'Exceeds single payment limit' } } });
  }, 30000);

  it('should reject payment if exceeds daily limit', async () => {
    await expect(
      axios.post(`${PAYMENT_API}/payment-initiations`, {
        debtorAccount: { accountId: 'acc1', accountType: 'Current', iban: 'GB00CUST1000000001' },
        creditorAccount: { accountId: 'acc3', accountType: 'Current', iban: 'GB00CUST2000000001' },
        amount: 2500, // Exceeds daily limit of 2000
        currency: 'GBP',
      })
    ).rejects.toMatchObject({ response: { status: 400, data: { error: 'Exceeds daily payment limit' } } });
  }, 30000);

  it('should reject payment if not eligible for Faster Payments', async () => {
    await expect(
      axios.post(`${PAYMENT_API}/payment-initiations`, {
        debtorAccount: { accountId: 'acc1', accountType: 'Current', iban: 'GB00CUST1000000001' },
        creditorAccount: { accountId: 'acc3', accountType: 'Current', iban: 'GB00CUST2000000001' },
        amount: 100,
        currency: 'USD', // Not GBP
      })
    ).rejects.toMatchObject({ response: { status: 400, data: { error: 'Not eligible for Faster Payments' } } });
  }, 30000);

  it('should reject payment flagged as potentially fraudulent', async () => {
    await expect(
      axios.post(`${PAYMENT_API}/payment-initiations`, {
        debtorAccount: { accountId: 'acc1', accountType: 'Current', iban: 'GB00CUST1000000001' },
        creditorAccount: { accountId: 'acc3', accountType: 'Current', iban: 'GB00CUST2000000001' },
        amount: 20000, // Over fraud threshold
        currency: 'GBP',
      })
    ).rejects.toMatchObject({ response: { status: 400, data: { error: 'Payment flagged as potentially fraudulent' } } });
  }, 30000);
}); 