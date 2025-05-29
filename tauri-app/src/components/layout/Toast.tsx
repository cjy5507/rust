import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  duration?: number;
}

const Alert = React.forwardRef<HTMLDivElement, any>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const getIcon = (severity: AlertColor) => {
  switch (severity) {
    case 'success':
      return <CheckCircle fontSize="inherit" />;
    case 'error':
      return <Error fontSize="inherit" />;
    case 'warning':
      return <Warning fontSize="inherit" />;
    default:
      return <Info fontSize="inherit" />;
  }
};

const getColors = (severity: AlertColor) => {
  switch (severity) {
    case 'success':
      return {
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#ffffff'
      };
    case 'error':
      return {
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: '#ffffff'
      };
    case 'warning':
      return {
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: '#ffffff'
      };
    case 'info':
      return {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        color: '#ffffff'
      };
    default:
      return {
        background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
        color: '#0f172a'
      };
  }
};

const Toast = ({ open, message, severity = 'info', onClose, duration = 4000 }: ToastProps) => {
  const colors = getColors(severity);
  
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={duration} 
      onClose={onClose} 
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={getIcon(severity)}
        sx={{
          minWidth: '300px',
          background: colors.background,
          color: colors.color,
          fontWeight: 600,
          fontSize: '1rem',
          borderRadius: 3,
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          '& .MuiAlert-icon': {
            color: colors.color
          },
          '& .MuiAlert-action': {
            color: colors.color
          }
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;