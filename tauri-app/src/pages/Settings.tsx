import { 
  Card, CardContent, Typography, TextField, Button, Stack, Box, Select, MenuItem, 
  InputLabel, FormControl, CircularProgress, Paper, Chip, ButtonGroup,
  ToggleButton, ToggleButtonGroup, Slider, Alert, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
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
import { Watch as WatchIcon } from '@mui/icons-material';
import SettingsIcon from '@mui/icons-material/Settings';
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
          // 서버에서 받아올 때는 startTime 필드 사용
          let startDateTime = null;
          if (s.startTime) {
            startDateTime = dayjs(s.startTime);
          } else if (s.startDateTime) {
            // 혹시 서버가 startDateTime으로 줄 수도 있으니 호환
            startDateTime = dayjs(s.startDateTime);
          } else if (s.visitDate && s.visitTime) {
            startDateTime = dayjs(`${s.visitDate}T${s.visitTime}`);
          } else {
            startDateTime = dayjs();
          }
          const cleanVisitTime = s.visitTime ? s.visitTime.substring(0, 5) : DEFAULT_VISIT_TIME;
          settingsObj[storeId] = {
            startDateTime,
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
      startDateTime: dayjs(),
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
        // 서버로 보낼 때는 startTime 필드명으로 전달
        startTime: getStoreSetting(store.id).startDateTime ? getStoreSetting(store.id).startDateTime.format('YYYY-MM-DDTHH:mm') : '',
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
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Paper sx={{
        p: 6,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
        border: '1px solid rgba(71, 85, 105, 0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center'
      }}>
        <CircularProgress size={60} sx={{ color: '#c9b037', mb: 3 }} />
        <Typography variant="h6" color="#e2e8f0" fontWeight={600}>
          설정 불러오는 중...
        </Typography>
        <Typography variant="body2" color="#94a3b8" mt={1}>
          잠시만 기다려주세요
        </Typography>
      </Paper>
    </Box>
  );

  if (error) return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Paper sx={{
        p: 6,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
        border: '1px solid #ef4444',
        boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="#ef4444" fontWeight={600} mb={2}>
          오류가 발생했습니다
        </Typography>
        <Typography variant="body2" color="#94a3b8">
          {error}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        minHeight: '100vh',
        background: 'transparent',
        p: { xs: 1, md: 2 }
      }}>
        <Box maxWidth={1200} mx="auto" py={1}>
          {/* 헤더 개선 */}
          <Paper sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)'
          }}>
            <Stack direction="row" alignItems="center" spacing={3} mb={3}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0f172a',
                boxShadow: '0 8px 20px rgba(201, 176, 55, 0.3)'
              }}>
                <SettingsIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={800} color="#c9b037" sx={{
                  fontFamily: 'Playfair Display, serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  시스템 설정
                </Typography>
                <Typography variant="h6" color="#e2e8f0" fontWeight={500} mt={0.5}>
                  자동화 매개변수 및 개인정보 관리
                </Typography>
              </Box>
            </Stack>
            <Typography variant="body1" color="#94a3b8" sx={{ fontSize: '1.1rem' }}>
              매장별 예약 시간과 개인 정보를 설정하여 최적의 자동화 환경을 구성하세요
            </Typography>
          </Paper>

          {/* 개인 정보 섹션 개선 */}
          <Paper sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                <EmailIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="#f1f5f9">
                개인 정보 설정
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
            p: { xs: 3, md: 4 }, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)'
          }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CalendarTodayIcon sx={{ color: '#10b981', fontSize: 24 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="#f1f5f9">
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
                        {/* 자동화 시작 시간 - DateTimePicker로 변경 */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} mb={1} color="#f0f6fc">
                            🚀 자동화 시작 날짜/시간
                          </Typography>
                          <DateTimePicker
                            label="자동화 시작 날짜/시간"
                            value={getStoreSetting(store.id).startDateTime}
                            onChange={date => handleStoreChange(store.id, 'startDateTime', date)}
                            format="YYYY-MM-DD HH:mm"
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                sx: { '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }
                              }
                            }}
                          />
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                fontSize: '1.2rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0f172a',
                boxShadow: '0 8px 20px rgba(201, 176, 55, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #f4d03f 0%, #c9b037 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 30px rgba(201, 176, 55, 0.6)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  color: '#94a3b8'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              설정 저장
            </Button>
          </Box>
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
