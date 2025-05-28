import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Toast = ({ open, message, severity = 'info', onClose }: ToastProps) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
    <Alert
      onClose={onClose}
      severity={severity}
      sx={{
        width: '100%',
        background: '#181A20',
        color: '#FFD700',
        fontWeight: 900,
        fontSize: 18,
        borderRadius: 2,
        boxShadow: '0 2px 8px 0 rgba(24,26,32,0.18)',
      }}
    >
      {message}
    </Alert>
  </Snackbar>
);

export default Toast; 