import { Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import html2pdf from 'html2pdf.js';

export function ExportButton() {
  const handleExport = () => {
    const element = document.getElementById('payment-form');
    if (!element) return;

    html2pdf()
      .set({
        margin: 10,
        filename: `payment-transfer-${new Date().toISOString().slice(0, 10)}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save();
  };

  return (
    <Button
      variant="outlined"
      onClick={handleExport}
      startIcon={<PictureAsPdfIcon />}
    >
      Export PDF
    </Button>
  );
}
