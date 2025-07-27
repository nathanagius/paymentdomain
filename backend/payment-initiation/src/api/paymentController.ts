import { Router } from 'express';
import { PaymentService } from '../application/PaymentService';

const router = Router();
const service = new PaymentService();

// BIAN canonical endpoints
router.post('/payment-initiations', async (req, res) => {
  try {
    const { debtorAccount, creditorAccount, amount, currency, reference, requestedExecutionDate } = req.body;
    if (!debtorAccount || !creditorAccount || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Flatten for service, but pass nested objects
    const payment = await service.initiatePayment({
      debtorAccount,
      creditorAccount,
      amount,
      currency,
      reference,
      requestedExecutionDate,
    });
    res.status(201).json({
      paymentInitiationId: payment.id,
      status: payment.status,
      creationDate: payment.createdAt,
    });
  } catch (err: any) {
    console.error('POST /payment-initiations error:', err);
    res.status(400).json({ error: err.message || 'Failed to initiate payment' });
  }
});

router.get('/payment-initiations', async (_req, res) => {
  try {
    const payments = await service.listPayments();
    res.json(payments.map(payment => ({
      paymentInitiationId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      debtorAccount: payment.debtorAccount,
      creditorAccount: payment.creditorAccount,
      reference: payment.reference,
      requestedExecutionDate: payment.requestedExecutionDate,
      creationDate: payment.createdAt,
    })));
  } catch (err) {
    console.error('GET /payment-initiations error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

router.get('/payment-initiations/:id', async (req, res) => {
  try {
    const payment = await service.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json({
      paymentInitiationId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      debtorAccount: payment.debtorAccount,
      creditorAccount: payment.creditorAccount,
      reference: payment.reference,
      requestedExecutionDate: payment.requestedExecutionDate,
      creationDate: payment.createdAt,
    });
  } catch (err) {
    console.error('GET /payment-initiations/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Optional: Execute endpoint (for explicit execution)
router.post('/payment-initiations/:id/execute', async (req, res) => {
  // For demo, just mark as completed
  try {
    const payment = await service.updateStatus(req.params.id, 'COMPLETED');
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json({
      paymentInitiationId: payment.id,
      status: payment.status,
      executionDate: new Date(),
    });
  } catch (err) {
    console.error('POST /payment-initiations/:id/execute error:', err);
    res.status(500).json({ error: 'Failed to execute payment' });
  }
});

// Optional: Notify endpoint (for status notification)
router.post('/payment-initiations/:id/notify', async (req, res) => {
  // For demo, just acknowledge
  res.json({ message: 'Notification received' });
});

// Deprecated: Old endpoints (to be removed)
// router.post('/api/payments', ...)
// router.get('/api/payments', ...)
// router.get('/api/payments/:id', ...)

export default router; 