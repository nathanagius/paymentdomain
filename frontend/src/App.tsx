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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

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
  creditorAccount: string | { iban: string };
  reference?: string;
  requestedExecutionDate?: string | Date;
}

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCreditorAccount, setSelectedCreditorAccount] = useState<string>('');
  const [form, setForm] = useState({
    creditorAccount: {
      accountId: '',
      accountType: 'External',
      iban: '',
    },
    amount: '',
    currency: 'GBP',
    reference: '',
    requestedExecutionDate: null as Date | null,
  });
  const [review, setReview] = useState<any>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
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
  const selectedAccountObj = accounts.find(acc => acc.iban === selectedAccount) ? {
    accountId: accounts.find(acc => acc.iban === selectedAccount)?.id || '',
    accountType: accounts.find(acc => acc.iban === selectedAccount)?.type || '',
    iban: selectedAccount,
  } : { accountId: '', accountType: '', iban: '' };

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
        select
        label="Select Recipient Account (optional)"
        value={selectedCreditorAccount}
        onChange={(e) => {
          setSelectedCreditorAccount(e.target.value);
          const acc = accounts.find(a => a.iban === e.target.value);
          if (acc) {
            setForm({
              ...form,
              creditorAccount: {
                ...form.creditorAccount,
                iban: acc.iban,
                accountId: acc.id,
                accountType: acc.type,
              },
            });
          }
        }}
        fullWidth
        margin="normal"
      >
        <MenuItem value="">-- Enter Manually --</MenuItem>
        {accounts.map((acc) => (
          <MenuItem key={acc.id} value={acc.iban}>
            {acc.type} ({acc.iban}) - £{acc.balance.toFixed(2)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Recipient IBAN"
        value={form.creditorAccount.iban}
        onChange={(e) => setForm({ ...form, creditorAccount: { ...form.creditorAccount, iban: e.target.value } })}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Recipient Account ID"
        value={form.creditorAccount.accountId}
        onChange={(e) => setForm({ ...form, creditorAccount: { ...form.creditorAccount, accountId: e.target.value } })}
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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Requested Execution Date"
          value={form.requestedExecutionDate}
          onChange={(date: Date | null) => setForm({ ...form, requestedExecutionDate: date })}
          slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
        />
      </LocalizationProvider>
      <Box mt={2}>
        <Button onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
        <Button
          variant="contained"
          onClick={() => {
            setReview({
              debtorAccount: selectedAccountObj,
              ...form,
            });
            handleNext();
          }}
          disabled={
            !form.creditorAccount.iban || !form.creditorAccount.accountId || !form.amount || !form.currency || isNaN(Number(form.amount))
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
        <Typography>From: {review.debtorAccount.iban}</Typography>
        <Typography>To: {review.creditorAccount.iban}</Typography>
        <Typography>Amount: £{review.amount} {review.currency}</Typography>
        {review.reference && <Typography>Reference: {review.reference}</Typography>}
        {review.requestedExecutionDate && (
          <Typography>
            Execution Date: {typeof review.requestedExecutionDate === 'string'
              ? review.requestedExecutionDate
              : review.requestedExecutionDate instanceof Date
                ? review.requestedExecutionDate.toLocaleDateString()
                : ''}
          </Typography>
        )}
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
        Payment {result.status}
        {result.amount && result.currency && (
          <>: £{result.amount} {result.currency}</>
        )}
        {result.creditorAccount && (
          typeof result.creditorAccount === 'object' && 'iban' in result.creditorAccount
            ? <> to {(result.creditorAccount as { iban: string }).iban}</>
            : <> to {result.creditorAccount}</>
        )}
        {result.requestedExecutionDate && (
          <> on {typeof result.requestedExecutionDate === 'string'
            ? result.requestedExecutionDate
            : result.requestedExecutionDate instanceof Date
              ? result.requestedExecutionDate.toLocaleDateString()
              : ''}
          </>
        )}
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
        .post(`${API_BASE_URL}/payment-initiations`, {
          debtorAccount: {
            ...review.debtorAccount,
            customerId: 'cust1', // Hardcoded for demo
          },
          creditorAccount: review.creditorAccount,
          amount: Number(review.amount),
          currency: review.currency,
          reference: review.reference,
          requestedExecutionDate: review.requestedExecutionDate ?
            (typeof review.requestedExecutionDate === 'string'
              ? review.requestedExecutionDate
              : review.requestedExecutionDate instanceof Date
                ? review.requestedExecutionDate.toISOString().slice(0, 10)
                : undefined)
            : undefined,
        })
        .then((res) => {
          setResult(res.data);
          setActiveStep(4);
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Payment failed');
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
