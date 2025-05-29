import { Card, CardContent, TextField, Button, Stack, Box, Link, InputAdornment, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import WatchIcon from '@mui/icons-material/Watch';
import { login } from '../../api/rolex';
import Toast from '../components/layout/Toast';

// onLogin prop 타입 추가
interface LoginProps {
  onLogin: () => void;
}

// 네이버 표준시 fetch 함수 추가
async function fetchNaverTime(): Promise<string | null> {
  try {
    const res = await fetch('https://time.navyism.com/?host=naver.com');
    const html = await res.text();
    const match = html.match(/<span id="time_area">([0-9\- :]+)<\/span>/);
    if (match && match[1]) {
      // '2024-06-13 15:23:45' → ISO 문자열로 변환
      return match[1].replace(' ', 'T');
    }
  } catch (e) {
    console.error('네이버 시간 동기화 실패', e);
  }
  return null;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const naverTime = await fetchNaverTime();
      const data = await login(email, password, naverTime);
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (data.email) localStorage.setItem('email', data.email);
        if (data.username) localStorage.setItem('username', data.username);
        if (data.role) localStorage.setItem('role', data.role);
        if (data.carrier) localStorage.setItem('carrier', data.carrier);
        if (naverTime) {
          localStorage.setItem('naverTime', naverTime ? naverTime : '');
        }
      }
      onLogin();
      navigate('/dashboard');
    } catch (err: any) {
      setToastMsg('비밀번호가 일치하지 않습니다.');
      setToastOpen(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        p: 2
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          borderRadius: 3,
          background: 'white',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}
      >
        {/* 로고 및 타이틀 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ 
            display: 'inline-flex',
            p: 2, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            mb: 2
          }}>
            <WatchIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" fontWeight={600} color="#1e293b" mb={1}>
            ROLEX 예약 시스템
          </Typography>
          <Typography variant="body2" color="#64748b">
            자동화 시스템에 로그인하세요
          </Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <Stack spacing={3}>
            <TextField
              label="이메일"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              fullWidth
              variant="outlined"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e2e8f0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
            
            <TextField
              label="비밀번호"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              fullWidth
              variant="outlined"
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e2e8f0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#cbd5e1'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#3b82f6'
                  }
                }
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              로그인
            </Button>
          </Stack>
        </form>

        {/* 하단 링크 */}
        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Link
            href="#"
            underline="hover"
            sx={{
              color: '#64748b',
              fontSize: '0.875rem',
              '&:hover': { 
                color: '#3b82f6'
              }
            }}
          >
            회원가입
          </Link>
          <Link
            href="#"
            underline="hover"
            sx={{
              color: '#64748b',
              fontSize: '0.875rem',
              '&:hover': { 
                color: '#3b82f6'
              }
            }}
          >
            비밀번호 찾기
          </Link>
        </Stack>
      </Paper>
      
      <Toast open={toastOpen} message={toastMsg} severity="error" onClose={() => setToastOpen(false)} />
    </Box>
  );
};

export default Login;
