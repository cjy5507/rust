import { 
  Card, CardContent, Typography, TextField, Button, Stack, Box, Select, MenuItem, 
  InputLabel, FormControl, CircularProgress, Paper, Chip, ButtonGroup,
  ToggleButton, ToggleButtonGroup, Slider, Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchStores, fetchUserStoreSettings, saveUserStoreSetting } from '../../api/rolex';
import PasswordChangeDialog from './PasswordChangeDialog';
import Toast from '../components/layout/Toast';
import SaveIcon from '@mui/icons-material/Save';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WatchIcon from '@mui/icons-material/Watch';
import { useNavigate } from 'react-router-dom';

const DEFAULT_START_TIME = '10:00';
const DEFAULT_VISIT_DATE = dayjs();
const DEFAULT_VISIT_TIME = '10:00';

// 24시간 전체 시간 옵션들 (30분 단위)
const generateTimeOptions = (minuteInterval = 30) => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += minuteInterval) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayStr = hour < 12 
        ? `${timeStr} (오전 ${hour === 0 ? 12 : hour}시 ${minute === 0 ? '' : minute + '분'})`
        : `${timeStr} (오후 ${hour === 12 ? 12 : hour - 12}시 ${minute === 0 ? '' : minute + '분'})`;
      times.push({ value: timeStr, label: displayStr.replace('시 분', '시') });
    }
  }
  return times;
};

// 일반 시간 옵션은 30분 단위
const ALL_TIME_OPTIONS = generateTimeOptions(30);

// 자동화 시간은 1분 단위로 더 세밀하게 제공
const AUTOMATION_TIME_OPTIONS = generateTimeOptions(1);

const Settings = () => {
  const navigate = useNavigate();
  const [storeList, setStoreList] = useState<any[]>([]);
  const [carrier, setCarrier] = useState('SKT');
  const [message, setMessage] = useState('문의드립니다');
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success'|'error'|'info'>('success');

  const email = typeof window !== 'undefined' ? localStorage.getItem('email') || '' : '';

  useEffect(() => {
    if (!email) return;
    setLoading(true);
    Promise.all([
      fetchStores(),
      fetchUserStoreSettings(email)
    ])
      .then(([stores, userSettingsResp]) => {
        setStoreList(stores);
        const settingsArr = userSettingsResp.settings || [];
        const settingsObj: any = {};
        settingsArr.forEach((s: any) => {
          const storeId = s.store?.id || s.storeId || s.id;
          // 시간 형식에서 초 부분 제거 (예: 14:30:00 -> 14:30)
          const cleanStartTime = s.startTime ? s.startTime.substring(0, 5) : DEFAULT_START_TIME;
          const cleanVisitTime = s.visitTime ? s.visitTime.substring(0, 5) : DEFAULT_VISIT_TIME;
          
          settingsObj[storeId] = {
            startTime: cleanStartTime,
            visitDate: s.visitDate ? dayjs(s.visitDate) : DEFAULT_VISIT_DATE,
            visitTime: cleanVisitTime,
          };
        });
        setStoreSettings(settingsObj);
        setCarrier(userSettingsResp.carrier || 'SKT');
        setMessage(userSettingsResp.message || '문의드립니다');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [email]);

  const getStoreSetting = (id: string) => {
    return storeSettings[id] || {
      startTime: DEFAULT_START_TIME,
      visitDate: DEFAULT_VISIT_DATE,
      visitTime: DEFAULT_VISIT_TIME,
    };
  };

  const handleStoreChange = (id: string, key: string, value: any) => {
    setStoreSettings((prev: any) => ({
      ...prev,
      [id]: { ...getStoreSetting(id), [key]: value },
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const settingsArr = storeList.map(store => ({
        email,
        storeId: store.id,
        startTime: getStoreSetting(store.id).startTime,
        visitDate: getStoreSetting(store.id).visitDate.format('YYYY-MM-DD'),
        visitTime: getStoreSetting(store.id).visitTime,
        carrier,
        message,
      }));
      
      const responses = await Promise.all(settingsArr.map(saveUserStoreSetting));
      if (responses[0]?.carrier) setCarrier(responses[0].carrier);
      
      setToastMsg('설정이 저장되었습니다!');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (e: any) {
      let msg = e?.message;
      if (e?.response) {
        try {
          msg = await e.response.text();
        } catch {}
      }
      setToastMsg(msg || '저장 실패');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (current: string, next: string) => {
    if (!current && !next) return;
    try {
      setLoading(true);
      await saveUserStoreSetting({ email, currentPassword: current, password: next });
      setToastMsg('비밀번호가 변경되었습니다!');
      setToastSeverity('success');
      setToastOpen(true);
      setPasswordDialogOpen(false);
    } catch (e: any) {
      let msg = e?.message;
      if (e?.response) {
        try {
          msg = await e.response.text();
        } catch {}
      }
      setToastMsg(msg || '비밀번호 변경 실패');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <CircularProgress size={60} sx={{ color: '#c9b037' }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#0d1117',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#dc3545',
      fontSize: '1.2rem'
    }}>
      에러: {error}
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        minHeight: '100vh',
        background: '#0d1117',
        p: 2
      }}>
        {/* 헤더 네비게이션 바 */}
        <Box 
          sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            mb: 3,
            background: '#161b22',
            borderBottom: '1px solid #30363d',
            backdropFilter: 'blur(10px)',
            px: 2,
            py: 1,
          }}
        >
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            maxWidth={1200} 
            mx="auto"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0d1117'
              }}>
                <WatchIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="#c9b037">
                롤렉스 자동화
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="text"
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  color: '#9198a1',
                  fontSize: '0.85rem',
                  '&:hover': { 
                    background: 'rgba(201, 176, 55, 0.1)',
                    color: '#c9b037'
                  }
                }}
              >
                대시보드
              </Button>
              <Button
                variant="text"
                onClick={() => navigate('/logs')}
                sx={{ 
                  color: '#9198a1',
                  fontSize: '0.85rem',
                  '&:hover': { 
                    background: 'rgba(201, 176, 55, 0.1)',
                    color: '#c9b037'
                  }
                }}
              >
                로그
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/settings')}
                sx={{ 
                  background: 'rgba(201, 176, 55, 0.2)',
                  color: '#c9b037',
                  fontSize: '0.85rem',
                  '&:hover': { 
                    background: 'rgba(201, 176, 55, 0.3)',
                  }
                }}
              >
                설정
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Box maxWidth={1200} mx="auto" py={1}>
          {/* 헤더 */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: '#161b22',
            border: '1px solid #30363d',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0d1117'
              }}>
                <AccessTimeIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="#c9b037">
                자동화 설정
              </Typography>
            </Stack>
            <Typography variant="body1" color="#9198a1">
              매장별 예약 시간과 개인 정보를 설정하세요
            </Typography>
          </Paper>

          {/* 공통 설정 */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: '#161b22',
            border: '1px solid #30363d',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1.5, 
                background: 'rgba(201, 176, 55, 0.15)',
              }}>
                <EmailIcon sx={{ color: '#c9b037', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={600} color="#f0f6fc">
                개인 정보
              </Typography>
            </Stack>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="이메일"
                  value={email}
                  disabled
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#30363d'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c9b037'
                      },
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: '#9198a1' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<VpnKeyIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                  sx={{ 
                    height: 56, 
                    borderRadius: 1.5,
                    fontWeight: 600,
                    width: '100%',
                    borderColor: '#30363d',
                    color: '#c9b037',
                    '&:hover': {
                      borderColor: '#c9b037',
                      background: 'rgba(201, 176, 55, 0.1)'
                    }
                  }}
                >
                  비밀번호 변경
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: '#9198a1' }}>통신사</InputLabel>
                  <Select
                    value={carrier}
                    label="통신사"
                    onChange={e => setCarrier(e.target.value)}
                    sx={{
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#30363d'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c9b037'
                      },
                    }}
                  >
                    <MenuItem value="SKT">SKT</MenuItem>
                    <MenuItem value="KT">KT</MenuItem>
                    <MenuItem value="LGU+">LGU+</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="문의 메시지"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  fullWidth
                  InputProps={{
                    sx: {
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#30363d'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#c9b037'
                      },
                    }
                  }}
                  InputLabelProps={{
                    sx: { color: '#9198a1' }
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* 매장별 설정 */}
          <Paper sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2,
            background: '#161b22',
            border: '1px solid #30363d',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <CalendarTodayIcon sx={{ color: '#c9b037' }} />
              <Typography variant="h6" fontWeight={600} color="#f0f6fc">
                매장별 예약 설정
              </Typography>
            </Stack>
            
            <Grid container spacing={3}>
              {storeList.map(store => (
                <Grid item xs={12} md={6} lg={4} key={store.id}>
                  <Card sx={{
                    borderRadius: 2,
                    border: '1px solid #30363d',
                    background: '#161b22',
                    transition: 'all 0.3s ease',
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} color="#c9b037" mb={3} textAlign="center">
                        {store.name}
                      </Typography>
                      
                      <Stack spacing={3}>
                        {/* 자동화 시작 시간 - 24시간 전체 (1분 단위) */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#f0f6fc">
                            🚀 자동화 시작 시간 (1분 단위)
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={getStoreSetting(store.id).startTime}
                              onChange={e => handleStoreChange(store.id, 'startTime', e.target.value)}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 300,
                                  },
                                },
                              }}
                            >
                              {AUTOMATION_TIME_OPTIONS.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>

                        {/* 방문 날짜 */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#f0f6fc">
                            📅 방문 날짜
                          </Typography>
                          <DatePicker
                            value={getStoreSetting(store.id).visitDate}
                            onChange={date => handleStoreChange(store.id, 'visitDate', date)}
                            format="YYYY-MM-DD"
                            slotProps={{ 
                              textField: { 
                                fullWidth: true,
                                sx: { 
                                  '& .MuiOutlinedInput-root': { 
                                    borderRadius: 1.5
                                  } 
                                }
                              }
                            }}
                          />
                        </Box>

                        {/* 방문 시간 - 24시간 전체 */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#f0f6fc">
                            🕐 방문 시간
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              value={getStoreSetting(store.id).visitTime}
                              onChange={e => handleStoreChange(store.id, 'visitTime', e.target.value)}
                              MenuProps={{
                                PaperProps: {
                                  style: {
                                    maxHeight: 300,
                                  },
                                },
                              }}
                            >
                              {ALL_TIME_OPTIONS.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* 저장 버튼 */}
          <Stack direction="row" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1.1rem',
                fontWeight: 700,
              }}
            >
              설정 저장
            </Button>
          </Stack>
        </Box>

        <PasswordChangeDialog
          open={passwordDialogOpen}
          onClose={() => setPasswordDialogOpen(false)}
          onSubmit={handlePasswordChange}
        />
        
        <Toast 
          open={toastOpen} 
          message={toastMsg} 
          severity={toastSeverity} 
          onClose={() => setToastOpen(false)} 
        />
      </Box>
    </LocalizationProvider>
  );
};

export default Settings;
