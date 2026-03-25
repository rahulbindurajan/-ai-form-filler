import { useState, useRef, useEffect } from 'react';
import {
  Box, IconButton, TextField, Typography, Paper, Avatar,
  CircularProgress, Fab, Tooltip, Divider, Chip,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useForm } from '../context/FormContext';
import { parseNaturalLanguage, getMissingFieldQuestion } from '../services/openai';
import { type ChatMessage, FIELD_LABELS } from '../types/form';

export function FloatingChatBar() {
  const { formData, fillForm } = useForm();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI banking assistant. Tell me who you'd like to pay and I'll fill the form for you. For example: \"Pay $500 to John Doe, account 9876543210\"",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const filledFields = Object.entries(formData)
    .filter(([, v]) => v.trim() !== '')
    .map(([k]) => FIELD_LABELS[k as keyof typeof FIELD_LABELS]);

  const missingFields = Object.entries(formData)
    .filter(([, v]) => v.trim() === '')
    .map(([k]) => FIELD_LABELS[k as keyof typeof FIELD_LABELS]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Extract fields from user message
      const parsed = await parseNaturalLanguage(input, messages);
      const hasData = Object.values(parsed).some(v => v && String(v).trim() !== '');

      if (hasData) {
        fillForm(parsed);

        // Build a summary of what was filled
        const filled = Object.entries(parsed)
          .filter(([, v]) => v && String(v).trim() !== '')
          .map(([k, v]) => `${FIELD_LABELS[k as keyof typeof FIELD_LABELS]}: ${v}`)
          .join(', ');

        const updatedForm = { ...formData, ...parsed };
        const stillMissing = Object.entries(updatedForm)
          .filter(([, v]) => !v || String(v).trim() === '')
          .map(([k]) => FIELD_LABELS[k as keyof typeof FIELD_LABELS]);

        let responseText = `Got it! I've filled: ${filled}.`;

        if (stillMissing.length > 0) {
          const question = await getMissingFieldQuestion(
            Object.entries(updatedForm).filter(([, v]) => v && String(v).trim() !== '').map(([k]) => FIELD_LABELS[k as keyof typeof FIELD_LABELS]),
            Object.keys(updatedForm).map(k => FIELD_LABELS[k as keyof typeof FIELD_LABELS])
          );
          if (question) responseText += ` ${question}`;
        } else {
          responseText += ' All fields are filled! Please review the form and click Submit when ready.';
        }

        setMessages([...newMessages, { role: 'assistant', content: responseText }]);
      } else {
        // No data extracted — ask for missing info
        const question = await getMissingFieldQuestion(filledFields, Object.keys(FIELD_LABELS).map(k => FIELD_LABELS[k as keyof typeof FIELD_LABELS]));
        const reply = question ?? "I didn't catch the payment details. Could you try again? For example: \"Pay $500 to John, account 123456789\"";
        setMessages([...newMessages, { role: 'assistant', content: reply }]);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong';
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${message}` }]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* FAB button */}
      {!open && (
        <Tooltip title="AI Assistant" placement="left">
          <Fab
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}
          >
            <SmartToyIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Chat Window */}
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 380,
            height: 520,
            zIndex: 1300,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>
                <SmartToyIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>AI Banking Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>Powered by GPT-4o</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Progress chips */}
          {filledFields.length > 0 && (
            <Box sx={{ px: 2, py: 1, bgcolor: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <AutoFixHighIcon sx={{ fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="success.dark" fontWeight={600}>Filled:</Typography>
                {filledFields.slice(0, 4).map(f => (
                  <Chip key={f} label={f} size="small" color="success" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                ))}
                {filledFields.length > 4 && (
                  <Typography variant="caption" color="success.dark">+{filledFields.length - 4} more</Typography>
                )}
              </Box>
            </Box>
          )}

          <Divider />

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                }}
              >
                <Avatar
                  sx={{
                    width: 28, height: 28,
                    bgcolor: msg.role === 'assistant' ? 'primary.main' : 'grey.400',
                    flexShrink: 0,
                  }}
                >
                  {msg.role === 'assistant' ? <SmartToyIcon sx={{ fontSize: 16 }} /> : <PersonIcon sx={{ fontSize: 16 }} />}
                </Avatar>
                <Box
                  sx={{
                    maxWidth: '80%',
                    px: 1.5, py: 1,
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.content}</Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main' }}>
                  <SmartToyIcon sx={{ fontSize: 16 }} />
                </Avatar>
                <Box sx={{ px: 1.5, py: 1, bgcolor: 'grey.100', borderRadius: '16px 16px 16px 4px' }}>
                  <CircularProgress size={14} />
                </Box>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Missing fields hint */}
          {missingFields.length > 0 && missingFields.length < 8 && (
            <Box sx={{ px: 2, py: 0.75, bgcolor: '#fefce8', borderTop: '1px solid #fef08a' }}>
              <Typography variant="caption" color="warning.dark">
                Still needed: {missingFields.slice(0, 3).join(', ')}{missingFields.length > 3 ? ` +${missingFields.length - 3} more` : ''}
              </Typography>
            </Box>
          )}

          {/* Input */}
          <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type payment details..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'grey.200' } }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
