import { Box, Container, Typography, Divider, Paper, Alert } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { FormProvider } from './context/FormContext';
import { FormPanel } from './components/FormPanel';
import { NLPInput } from './components/NLPInput';
import { DocumentUpload } from './components/DocumentUpload';
import { FloatingChatBar } from './components/FloatingChatBar';

const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  return (
    <FormProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f0f4f8', pb: 10 }}>
        {/* Top Bar */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
            color: 'white',
            py: 2,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: 3,
          }}
        >
          <AccountBalanceIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              AI Banking Form Filler
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Powered by Gemini 1.5 Flash — Fill forms in seconds
            </Typography>
          </Box>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {/* API Key Warning */}
          {!hasApiKey && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <strong>Missing API Key:</strong> Add <code>VITE_GEMINI_API_KEY=your-key</code> to your <code>.env</code> file and restart the dev server.
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.5fr' }, gap: 3 }}>
            {/* Left Column — AI Input Tools */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* NLP Input */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                <NLPInput />
              </Paper>

              {/* Document Upload */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                <DocumentUpload />
              </Paper>

              {/* How to use hint */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5, borderRadius: 3,
                  bgcolor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="primary.dark" mb={1}>
                  How to use
                </Typography>
                <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.75 } }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Type a sentence describing your payment above, or upload an invoice
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    AI fills the form — <strong>blue highlighted fields</strong> were auto-filled
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Click <strong>?</strong> on any field to ask the AI for help
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Review, validate, then click <strong>Submit Transfer</strong>
                  </Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Or use the <strong>chat bubble</strong> (bottom right) to fill the form conversationally.
                </Typography>
              </Paper>
            </Box>

            {/* Right Column — Form */}
            <Paper elevation={1} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <FormPanel />
            </Paper>
          </Box>
        </Container>

        {/* Floating Chat */}
        <FloatingChatBar />
      </Box>
    </FormProvider>
  );
}

export default App;
