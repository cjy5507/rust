import { Card, CardContent, TextField, Button, Stack, Box, Link, InputAdornment, Typography, Paper } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import { Watch as WatchIcon } from '@mui/icons-material';
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        p: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 배경 장식 요소들 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(201, 176, 55, 0.1) 0%, rgba(244, 208, 63, 0.05) 100%)',
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)',
          filter: 'blur(60px)',
        }}
      />

      <Paper
        sx={{
          width: '100%',
          maxWidth: 450,
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* 로고 및 타이틀 */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Box sx={{
            display: 'inline-flex',
            p: 3,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
            color: '#0f172a',
            mb: 3,
            boxShadow: '0 10px 30px rgba(201, 176, 55, 0.4)'
          }}>
            <WatchIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h3" fontWeight={800} color="#c9b037" mb={1} sx={{
            fontFamily: 'Playfair Display, serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ROLEX
          </Typography>
          <Typography variant="h6" color="#e2e8f0" fontWeight={600} mb={1}>
            자동화 시스템
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            프리미엄 예약 자동화 플랫폼에 로그인하세요
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
                    <EmailIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: {
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(71, 85, 105, 0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(201, 176, 55, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c9b037',
                    borderWidth: 2
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  color: '#94a3b8',
                  '&.Mui-focused': {
                    color: '#c9b037'
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
                    <LockIcon sx={{ color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: {
                  background: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(71, 85, 105, 0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(201, 176, 55, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c9b037',
                    borderWidth: 2
                  }
                }
              }}
              InputLabelProps={{
                sx: {
                  color: '#94a3b8',
                  '&.Mui-focused': {
                    color: '#c9b037'
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
                py: 2,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0f172a',
                boxShadow: '0 8px 20px rgba(201, 176, 55, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f4d03f 0%, #c9b037 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(201, 176, 55, 0.6)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              로그인
            </Button>
          </Stack>
        </form>

        {/* 하단 링크 */}
        {/*<Stack direction="row" justifyContent="space-between" mt={4}>*/}
        {/*  <Link*/}
        {/*    href="#"*/}
        {/*    underline="hover"*/}
        {/*    sx={{*/}
        {/*      color: '#94a3b8',*/}
        {/*      fontSize: '0.9rem',*/}
        {/*      fontWeight: 500,*/}
        {/*      '&:hover': { */}
        {/*        color: '#c9b037'*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    회원가입*/}
        {/*  </Link>*/}
        {/*  <Link*/}
        {/*    href="#"*/}
        {/*    underline="hover"*/}
        {/*    sx={{*/}
        {/*      color: '#94a3b8',*/}
        {/*      fontSize: '0.9rem',*/}
        {/*      fontWeight: 500,*/}
        {/*      '&:hover': { */}
        {/*        color: '#c9b037'*/}
        {/*      }*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    비밀번호 찾기*/}
        {/*  </Link>*/}
        {/*</Stack>*/}

        {/* 장식 요소 */}
        <Box
          sx={{
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #c9b037, transparent)',
            borderRadius: '4px 4px 0 0'
          }}
        />
      </Paper>

      <Toast open={toastOpen} message={toastMsg} severity="error" onClose={() => setToastOpen(false)} />
    </Box>
  );
};

export default Login;