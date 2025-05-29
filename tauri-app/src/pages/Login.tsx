import { Card, CardContent, TextField, Button, Stack, Box, Link, InputAdornment } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
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
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background: 'linear-gradient(135deg, #181A20 60%, #FFD700 100%)',
        fontFamily: 'Pretendard, Montserrat, Noto Sans KR, sans-serif',
      }}
    >
      <Card
        sx={{
          minWidth: 360,
          maxWidth: 400,
          p: 4,
          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
          borderRadius: 5,
          background: 'rgba(24,26,32,0.98)',
          border: '2px solid #FFD700',
        }}
      >
        <CardContent>
          <form onSubmit={handleLogin}>
            <Stack spacing={3} mt={2}>
              <TextField
                label="이메일"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                variant="filled"
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#FFD700' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: '#181A20',
                    borderRadius: 2,
                    color: '#fff',
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 700 },
                }}
              />
              <TextField
                label="비밀번호"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                variant="filled"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#FFD700' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    background: '#181A20',
                    borderRadius: 2,
                    color: '#fff',
                  },
                }}
                InputLabelProps={{
                  sx: { color: '#FFD700', fontWeight: 700 },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 900,
                  fontSize: 18,
                  background: 'linear-gradient(90deg, #FFD700 60%, #BFA14A 100%)',
                  color: '#181A20',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px 0 rgba(255,215,0,0.18)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #181A20 60%, #FFD700 100%)',
                    color: '#FFD700',
                  },
                }}
                fullWidth
              >
                로그인
              </Button>
            </Stack>
          </form>
          <Stack direction="row" justifyContent="space-between" mt={3}>
            <Link
              href="#"
              underline="hover"
              fontWeight={700}
              fontSize={15}
              sx={{
                color: '#FFD700',
                '&:hover': { color: '#fff', textDecoration: 'underline' },
              }}
            >
              회원가입
            </Link>
            <Link
              href="#"
              underline="hover"
              fontWeight={700}
              fontSize={15}
              sx={{
                color: '#FFD700',
                '&:hover': { color: '#fff', textDecoration: 'underline' },
              }}
            >
              비밀번호 찾기
            </Link>
          </Stack>
        </CardContent>
      </Card>
      <Toast open={toastOpen} message={toastMsg} severity="error" onClose={() => setToastOpen(false)} />
    </Box>
  );
};

export default Login; 