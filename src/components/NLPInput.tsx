import { useState } from 'react';
import {
  Box, TextField, Button, Typography, CircularProgress,
  Chip, Collapse, Alert,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { useForm } from '../context/FormContext';
import { parseNaturalLanguage } from '../services/openai';

const EXAMPLES = [
  'Pay $500 to John Doe, account 9876543210, routing 021000021',
  'Transfer five hundred dollars to Jane Smith, account 112233445',
  'Send 1200 USD to Robert Brown for rent, account 998877665',
];

export function NLPInput() {
  const { fillForm } = useForm();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFill = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setSuccess(false);
    setError('');
    try {
      const parsed = await parseNaturalLanguage(input);
      const hasData = Object.values(parsed).some(v => v && String(v).trim() !== '');
      if (hasData) {
        fillForm(parsed);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Could not extract any details. Try being more specific.');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setError(message);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <AutoFixHighIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Natural Language Fill
        </Typography>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={2}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) handleFill();
        }}
        placeholder='e.g. "Pay $500 to John Doe, account 9876543210, routing 021000021"'
        variant="outlined"
        sx={{ mb: 1.5 }}
      />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
        <Button
          variant="contained"
          onClick={handleFill}
          disabled={loading || !input.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon />}
          sx={{ fontWeight: 600 }}
        >
          {loading ? 'Filling...' : 'Fill Form with AI'}
        </Button>
        <Typography variant="caption" color="text.secondary">
          or Ctrl+Enter
        </Typography>
      </Box>

      {/* Examples */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <LightbulbOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">Try:</Typography>
        {EXAMPLES.map((ex, i) => (
          <Chip
            key={i}
            label={ex.length > 40 ? ex.slice(0, 40) + '…' : ex}
            size="small"
            variant="outlined"
            onClick={() => setInput(ex)}
            sx={{ cursor: 'pointer', fontSize: 11 }}
          />
        ))}
      </Box>

      <Collapse in={success}>
        <Alert severity="success" sx={{ mt: 1.5 }}>Form fields filled successfully!</Alert>
      </Collapse>
      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>
      </Collapse>
    </Box>
  );
}
