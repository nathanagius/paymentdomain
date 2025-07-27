const axios = require('axios');

const CUSTOMER_API = process.env.CUSTOMER_API_URL || 'http://localhost:4001';
const PAYMENT_API = process.env.PAYMENT_API_URL || 'http://localhost:4000/api';

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

describe('Payment Initiation API', () => {
  let paymentId;

  it('POST /payments creates a payment', async () => {
    const res = await waitFor(() => axios.post(`${PAYMENT_API}/payments`, {
      debtorAccount: 'GB00CUST1000000001',
      creditorAccount: 'GB00CUST2000000001',
      amount: 10.5,
      currency: 'GBP',
      reference: 'Test payment',
    }));
    expect(res.status).toBe(201);
    expect(res.data).toHaveProperty('id');
    paymentId = res.data.id;
  }, 30000);

  it('GET /payments returns payments', async () => {
    const res = await waitFor(() => axios.get(`${PAYMENT_API}/payments`));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
  }, 30000);

  it('GET /payments/:id returns the payment', async () => {
    const res = await waitFor(() => axios.get(`${PAYMENT_API}/payments/${paymentId}`));
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('id', paymentId);
  }, 30000);
}); 