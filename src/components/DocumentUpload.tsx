import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, CircularProgress, Alert, Collapse, LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useForm } from '../context/FormContext';
import { parseDocument } from '../services/openai';

export function DocumentUpload() {
  const { fillForm } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const base64 = await fileToBase64(file);
      const parsed = await parseDocument(base64, file.type);
      const hasData = Object.values(parsed).some(v => v && String(v).trim() !== '');
      if (hasData) {
        fillForm(parsed);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError('Could not extract payment details from this document. Try a clearer image.');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to process document';
      setError(message);
    }

    setLoading(false);
  }, [fillForm]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'application/pdf': [],
    },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CloudUploadIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700}>
          Upload Invoice / Document
        </Typography>
      </Box>

      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed`,
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'primary.50' : 'grey.50',
          transition: 'all 0.2s',
          '&:hover': loading ? {} : {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          },
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <Box>
            <CircularProgress size={32} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Reading document with AI...
            </Typography>
            <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />
          </Box>
        ) : success ? (
          <Box sx={{ color: 'success.main' }}>
            <CheckCircleIcon sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="body2" fontWeight={600}>
              {fileName} — details extracted!
            </Typography>
          </Box>
        ) : (
          <Box>
            <InsertDriveFileIcon sx={{ fontSize: 36, color: 'grey.400', mb: 1 }} />
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {isDragActive ? 'Drop it here!' : 'Drag & drop an invoice or image'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              or click to browse — JPG, PNG, WebP, PDF supported
            </Typography>
          </Box>
        )}
      </Box>

      <Collapse in={!!error}>
        <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError('')}>{error}</Alert>
      </Collapse>
    </Box>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
