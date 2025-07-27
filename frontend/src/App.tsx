import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stepper,
  Step,
  StepLabel,
  Typography,
  TextField,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const steps = ['Select Account', 'Payment Details', 'Review', 'Confirm', 'Result'];

interface Account {
  id: string;
  type: string;
  iban: string;
  balance: number;
  currency: string;
}

interface PaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  creditorAccount: string;
  reference?: string;
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [form, setForm] = useState({
    creditorAccount: '',
    amount: '',
    currency: 'GBP',
    reference: '',
  });
  const [review, setReview] = useState<any>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api';
  const CUSTOMER_API_URL = process.env.REACT_APP_CUSTOMER_API_URL || 'http://localhost:4001';

  // Fetch accounts on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${CUSTOMER_API_URL}/accounts`, { params: { customerId: 'cust1' } })
      .then((res) => setAccounts(res.data))
      .catch(() => setError('Failed to load accounts'))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => setActiveStep((s) => s + 1);
  const handleBack = () => setActiveStep((s) => s - 1);

  // Step 1: Select Account
  const selectAccountStep = (
    <Box>
      <Typography variant="h6" mb={2}>Select Account to Pay From</Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TextField
          select
          label="Account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          fullWidth
        >
          {accounts.map((acc) => (
            <MenuItem key={acc.id} value={acc.iban}>
              {acc.type} ({acc.iban}) - £{acc.balance.toFixed(2)}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Box mt={2}>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!selectedAccount}
        >
          Next
        </Button>
      </Box>
    </Box>
  );

  // Step 2: Payment Details
  const paymentDetailsStep = (
    <Box>
      <Typography variant="h6" mb={2}>Enter Payment Details</Typography>
      <TextField
        label="Recipient IBAN"
        value={form.creditorAccount}
        onChange={(e) => setForm({ ...form, creditorAccount: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Amount"
        type="number"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Currency"
        value={form.currency}
        onChange={(e) => setForm({ ...form, currency: e.target.value })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Reference (optional)"
        value={form.reference}
        onChange={(e) => setForm({ ...form, reference: e.target.value })}
        fullWidth
        margin="normal"
      />
      <Box mt={2}>
        <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
        <Button
          variant="contained"
          onClick={() => {
            setReview({
              debtorAccount: selectedAccount,
              ...form,
            });
            handleNext();
          }}
          disabled={
            !form.creditorAccount || !form.amount || !form.currency || isNaN(Number(form.amount))
          }
        >
          Next
        </Button>
      </Box>
    </Box>
  );

  // Step 3: Review
  const reviewStep = review && (
    <Box>
      <Typography variant="h6" mb={2}>Review Payment</Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography>From: {review.debtorAccount}</Typography>
        <Typography>To: {review.creditorAccount}</Typography>
        <Typography>Amount: £{review.amount} {review.currency}</Typography>
        {review.reference && <Typography>Reference: {review.reference}</Typography>}
      </Paper>
      <Box>
        <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
        <Button
          variant="contained"
          onClick={handleNext}
        >
          Confirm
        </Button>
      </Box>
    </Box>
  );

  // Step 4: Confirm (API call)
  const confirmStep = (
    <Box>
      <Typography variant="h6" mb={2}>Processing Payment...</Typography>
      <CircularProgress />
    </Box>
  );

  // Step 5: Result
  const resultStep = result && (
    <Box>
      <Typography variant="h6" mb={2}>Payment Result</Typography>
      <Alert severity={result.status === 'PENDING' || result.status === 'COMPLETED' ? 'success' : 'error'}>
        Payment {result.status}: £{result.amount} to {result.creditorAccount}
      </Alert>
      <Box mt={2}>
        <Button variant="contained" onClick={() => window.location.reload()}>New Payment</Button>
      </Box>
    </Box>
  );

  // Handle confirm step (API call)
  useEffect(() => {
    if (activeStep === 3 && review) {
      setLoading(true);
      setError(null);
      axios
        .post(`${API_BASE_URL}/payments`, {
          debtorAccount: review.debtorAccount,
          creditorAccount: review.creditorAccount,
          amount: Number(review.amount),
          currency: review.currency,
          reference: review.reference,
        })
        .then((res) => {
          setResult(res.data);
          setActiveStep(4);
        })
        .catch(() => {
          setError('Payment failed');
          setActiveStep(4);
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [activeStep, review]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Payment Initiation
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box>
        {activeStep === 0 && selectAccountStep}
        {activeStep === 1 && paymentDetailsStep}
        {activeStep === 2 && reviewStep}
        {activeStep === 3 && confirmStep}
        {activeStep === 4 && resultStep}
      </Box>
      {error && activeStep !== 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
    </Container>
  );
}

export default App;
