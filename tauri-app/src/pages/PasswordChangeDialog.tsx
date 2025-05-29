import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { useToast } from '../hooks/useToast';
import Toast from '../components/layout/Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (current: string, next: string) => void;
}

const PasswordChangeDialog = ({ open, onClose, onSubmit }: Props) => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [nextCheck, setNextCheck] = useState('');
  
  // 토스트 훅
  const { toast, showWarning, hideToast } = useToast();

  const handleSubmit = () => {
    if (next !== nextCheck) {
      showWarning('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    onSubmit(current, next);
    setCurrent('');
    setNext('');
    setNextCheck('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" align="center" fontWeight="bold">
          비밀번호 변경
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 3 }}>
          <TextField
            label="현재 비밀번호"
            type="password"
            fullWidth
            size="small"
            margin="dense"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            InputLabelProps={{ shrink: true }}
            placeholder="현재 비밀번호를 입력하세요"
          />
          <Box sx={{ mt: 3 }}>
            <TextField
              label="새 비밀번호"
              type="password"
              fullWidth
              size="small"
              margin="dense"
              value={next}
              onChange={e => setNext(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="새 비밀번호를 입력하세요"
            />
          </Box>
          <Box sx={{ mt: 1 }}>
            <TextField
              label="새 비밀번호 확인"
              type="password"
              fullWidth
              size="small"
              margin="dense"
              value={nextCheck}
              onChange={e => setNextCheck(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="새 비밀번호를 다시 입력하세요"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100 }}>취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ minWidth: 100 }}>변경</Button>
      </DialogActions>
      
      {/* Toast 컴포넌트 */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </Dialog>
  );
};

export default PasswordChangeDialog; 