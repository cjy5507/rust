import { useState, useCallback } from 'react';
import { AlertColor } from '@mui/material';

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

interface ConfirmState {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showToast = useCallback((message: string, severity: AlertColor = 'info') => {
    setToast({
      open: true,
      message,
      severity
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);
  
  const showConfirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirm({
      open: true,
      message,
      onConfirm,
      onCancel: onCancel || (() => {})
    });
  }, []);
  
  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({ ...prev, open: false }));
  }, []);

  // 편의 메서드들
  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return {
    toast,
    confirm,
    showToast,
    hideToast,
    showConfirm,
    hideConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
