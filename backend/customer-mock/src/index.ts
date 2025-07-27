import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock data
const customers = [
  { id: 'cust1', name: 'Alice Smith' },
  { id: 'cust2', name: 'Bob Jones' },
];

const accounts = [
  { id: 'acc1', customerId: 'cust1', type: 'Current', iban: 'GB00CUST1000000001', balance: 15000.00, currency: 'GBP' },
  { id: 'acc2', customerId: 'cust1', type: 'Savings', iban: 'GB00CUST1000000002', balance: 400.00, currency: 'GBP' },
  { id: 'acc3', customerId: 'cust2', type: 'Current', iban: 'GB00CUST2000000001', balance: 800.00, currency: 'GBP' },
];

app.get('/customers', (_req, res) => {
  res.json(customers);
});

app.get('/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
});

app.get('/accounts', (req, res) => {
  const { customerId } = req.query;
  if (!customerId) return res.status(400).json({ error: 'customerId required' });
  const accs = accounts.filter(a => a.customerId === customerId);
  res.json(accs);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Customer Mock API running on port ${PORT}`);
}); 