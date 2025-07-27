import { Router } from 'express';
import { PaymentService } from '../application/PaymentService';

const router = Router();
const service = new PaymentService();

router.post('/payments', async (req, res) => {
  try {
    const { debtorAccount, creditorAccount, amount, currency, reference } = req.body;
    if (!debtorAccount || !creditorAccount || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payment = await service.initiatePayment({ debtorAccount, creditorAccount, amount, currency, reference });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate payment' });
  }
});

router.get('/payments', async (_req, res) => {
  try {
    const payments = await service.listPayments();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/payments/:id', async (req, res) => {
  try {
    const payment = await service.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

export default router; 