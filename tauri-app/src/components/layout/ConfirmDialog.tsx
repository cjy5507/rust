import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

const ConfirmDialog = ({ open, message, onConfirm, onCancel, onClose }: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #475569',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white'
          }}>
            <WarningIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#f1f5f9">
            확인
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Typography 
          variant="body1" 
          color="#e2e8f0"
          sx={{ 
            fontSize: '1rem', 
            lineHeight: 1.6,
            whiteSpace: 'pre-line'
          }}
        >
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ pb: 3, px: 3, gap: 1 }}>
        <Button 
          onClick={handleCancel}
          variant="outlined"
          sx={{
            minWidth: 100,
            borderColor: '#475569',
            color: '#e2e8f0',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#64748b',
              background: 'rgba(100, 116, 139, 0.1)'
            }
          }}
        >
          취소
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color="warning"
          sx={{
            minWidth: 100,
            fontWeight: 700,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
            }
          }}
        >
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
