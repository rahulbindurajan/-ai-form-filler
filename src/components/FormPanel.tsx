import { useState } from 'react';
import {
  Box, TextField, Typography, Button, Grid, MenuItem,
  InputAdornment, IconButton, Tooltip, Chip, Divider, Alert,
  CircularProgress,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from '../context/FormContext';
import { type FormField, FIELD_LABELS, FIELD_HELP } from '../types/form';
import { askFieldHelp, validateForm } from '../services/openai';
import { ExportButton } from './ExportButton';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'];

export function FormPanel() {
  const { formData, aiFilledFields, setField, resetForm } = useForm();
  const [helpField, setHelpField] = useState<FormField | null>(null);
  const [helpQuestion, setHelpQuestion] = useState('');
  const [helpAnswer, setHelpAnswer] = useState('');
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpError, setHelpError] = useState('');
  const [validation, setValidation] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const [validating, setValidating] = useState(false);

  const handleHelp = async (field: FormField) => {
    setHelpField(field);
    setHelpAnswer('');
    setHelpError('');
    setHelpQuestion(`What is ${FIELD_LABELS[field]}?`);
    setHelpLoading(true);
    try {
      const answer = await askFieldHelp(`What is ${FIELD_LABELS[field]}?`, FIELD_LABELS[field]);
      setHelpAnswer(answer);
    } catch (e: unknown) {
      setHelpError(e instanceof Error ? e.message : 'Failed to get AI help. Please try again.');
    }
    setHelpLoading(false);
  };

  const handleCustomHelp = async () => {
    if (!helpField || !helpQuestion.trim()) return;
    setHelpLoading(true);
    setHelpAnswer('');
    setHelpError('');
    try {
      const answer = await askFieldHelp(helpQuestion, FIELD_LABELS[helpField]);
      setHelpAnswer(answer);
    } catch (e: unknown) {
      setHelpError(e instanceof Error ? e.message : 'Failed to get AI help. Please try again.');
    }
    setHelpLoading(false);
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidation(null);
    try {
      const result = await validateForm(formData);
      setValidation(result);
    } catch (e: unknown) {
      setValidation({ valid: false, issues: [e instanceof Error ? e.message : 'Validation failed. Please try again.'] });
    }
    setValidating(false);
  };

  const filledCount = Object.values(formData).filter(v => v.trim() !== '').length;
  const totalFields = Object.keys(formData).length;

  const fieldSx = (field: FormField) => ({
    '& .MuiOutlinedInput-root': aiFilledFields.has(field)
      ? {
          '& fieldset': { borderColor: '#3b82f6', borderWidth: 2 },
          backgroundColor: '#eff6ff',
        }
      : {},
  });

  return (
    <Box id="payment-form" sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.dark">
            Fund Transfer Form
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filledCount} of {totalFields} fields filled
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {aiFilledFields.size > 0 && (
            <Chip
              icon={<AutoFixHighIcon />}
              label={`${aiFilledFields.size} AI-filled`}
              color="primary"
              size="small"
              variant="outlined"
            />
          )}
          <Tooltip title="Reset form">
            <IconButton onClick={resetForm} size="small" color="error">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Form Fields */}
      <Grid container spacing={2.5}>
        {/* Recipient Name */}
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.firstName}
            value={formData.firstName}
            onChange={e => setField('firstName', e.target.value)}
            sx={fieldSx('firstName')}
            placeholder="John"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.firstName}>
                      <IconButton size="small" onClick={() => handleHelp('firstName')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.lastName}
            value={formData.lastName}
            onChange={e => setField('lastName', e.target.value)}
            sx={fieldSx('lastName')}
            placeholder="Doe"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.lastName}>
                      <IconButton size="small" onClick={() => handleHelp('lastName')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>

        {/* Account & Routing */}
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.accountNumber}
            value={formData.accountNumber}
            onChange={e => setField('accountNumber', e.target.value)}
            sx={fieldSx('accountNumber')}
            placeholder="123456789"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.accountNumber}>
                      <IconButton size="small" onClick={() => handleHelp('accountNumber')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.routingNumber}
            value={formData.routingNumber}
            onChange={e => setField('routingNumber', e.target.value)}
            sx={fieldSx('routingNumber')}
            placeholder="021000021"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.routingNumber}>
                      <IconButton size="small" onClick={() => handleHelp('routingNumber')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>

        {/* Amount & Currency */}
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.amount}
            value={formData.amount}
            onChange={e => setField('amount', e.target.value)}
            sx={fieldSx('amount')}
            placeholder="500.00"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.amount}>
                      <IconButton size="small" onClick={() => handleHelp('amount')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            select
            label={FIELD_LABELS.currency}
            value={formData.currency}
            onChange={e => setField('currency', e.target.value)}
            sx={fieldSx('currency')}
          >
            {CURRENCIES.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Payment Date */}
        <Grid size={6}>
          <TextField
            fullWidth
            type="date"
            label={FIELD_LABELS.paymentDate}
            value={formData.paymentDate}
            onChange={e => setField('paymentDate', e.target.value)}
            sx={fieldSx('paymentDate')}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        {/* Memo */}
        <Grid size={6}>
          <TextField
            fullWidth
            label={FIELD_LABELS.memo}
            value={formData.memo}
            onChange={e => setField('memo', e.target.value)}
            sx={fieldSx('memo')}
            placeholder="e.g. Rent for March"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={FIELD_HELP.memo}>
                      <IconButton size="small" onClick={() => handleHelp('memo')}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }
            }}
          />
        </Grid>
      </Grid>

      {/* AI Help Panel */}
      {helpField && (
        <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f0f9ff', borderRadius: 2, border: '1px solid #bae6fd' }}>
          <Typography variant="subtitle2" fontWeight={700} color="info.dark" mb={1}>
            AI Help — {FIELD_LABELS[helpField]}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <TextField
              size="small"
              fullWidth
              value={helpQuestion}
              onChange={e => setHelpQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomHelp()}
              placeholder="Ask a question about this field..."
            />
            <Button variant="contained" size="small" onClick={handleCustomHelp} disabled={helpLoading} sx={{ whiteSpace: 'nowrap' }}>
              Ask AI
            </Button>
          </Box>
          {helpLoading && <CircularProgress size={18} />}
          {helpError && (
            <Alert severity="error" sx={{ mt: 1 }} onClose={() => setHelpError('')}>
              {helpError}
            </Alert>
          )}
          {helpAnswer && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {helpAnswer}
            </Typography>
          )}
        </Box>
      )}

      {/* Validation */}
      {validation && (
        <Box sx={{ mt: 2 }}>
          {validation.valid ? (
            <Alert icon={<CheckCircleIcon />} severity="success">
              Form looks good! All fields are valid.
            </Alert>
          ) : (
            <Alert severity="warning">
              <Typography variant="subtitle2" fontWeight={700} mb={0.5}>Please review:</Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validation.issues.map((issue, i) => (
                  <li key={i}><Typography variant="body2">{issue}</Typography></li>
                ))}
              </ul>
            </Alert>
          )}
        </Box>
      )}

      {/* Actions */}
      <Divider sx={{ mt: 3, mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={handleValidate}
          disabled={validating}
          startIcon={validating ? <CircularProgress size={16} /> : <CheckCircleIcon />}
        >
          Validate with AI
        </Button>
        <ExportButton />
        <Button
          variant="contained"
          size="large"
          color="success"
          sx={{ px: 4, fontWeight: 700 }}
        >
          Submit Transfer
        </Button>
      </Box>
    </Box>
  );
}
