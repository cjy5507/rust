import { Card, CardContent, Typography, TextField, Button, Stack, Box, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { fetchStores, fetchUserStoreSettings, saveUserStoreSetting } from '../../api/rolex';
import PasswordChangeDialog from './PasswordChangeDialog';
import Toast from '../components/layout/Toast';

const DEFAULT_START_TIME = '10:00';
const DEFAULT_VISIT_DATE = dayjs();
const DEFAULT_VISIT_TIME = dayjs('10:00', 'HH:mm');
const DEFAULT_MESSAGE = '문의드립니다';

const Settings = () => {
  const [storeList, setStoreList] = useState<any[]>([]);
  const [carrier, setCarrier] = useState('SKT');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [storeSettings, setStoreSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success'|'error'|'info'>('success');

  // email은 localStorage에서 읽음
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
          settingsObj[storeId] = {
            startTime: s.startTime || DEFAULT_START_TIME,
            visitDate: s.visitDate ? dayjs(s.visitDate) : DEFAULT_VISIT_DATE,
            visitTime: s.visitTime ? dayjs(s.visitTime, 'HH:mm') : DEFAULT_VISIT_TIME,
          };
        });
        setStoreSettings(settingsObj);
        setCarrier(userSettingsResp.carrier || 'SKT');
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
        visitTime: getStoreSetting(store.id).visitTime.format('HH:mm'),
        carrier,
        message,
      }));
      // 여러 매장 저장이지만, carrier는 한 번만 반영하면 됨
      const responses = await Promise.all(settingsArr.map(saveUserStoreSetting));
      // 서버에서 carrier 최신값 내려주면 반영
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
    // 둘 다 비어있으면 아무것도 하지 않음
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

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Box color="error.main">에러: {error}</Box>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box maxWidth={800} mx="auto" my={7} sx={{ fontFamily: 'Pretendard, Montserrat, Noto Sans KR, sans-serif' }}>
        <Typography variant="h4" fontWeight={900} color="primary" mb={4} letterSpacing={3}>
          설정
        </Typography>
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', background: 'rgba(24,26,32,0.98)', border: '2px solid #FFD700' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="secondary" mb={2} letterSpacing={1}>
              공통 설정
            </Typography>
            <Stack direction="row" alignItems="center" spacing={4} mb={2}>
              <TextField
                label="이메일"
                value={email}
                disabled
                fullWidth
                InputLabelProps={{ sx: { color: '#FFD700', fontWeight: 700 } }}
                InputProps={{ sx: { background: '#222', borderRadius: 2, color: '#fff' } }}
              />
              <Button
                variant="outlined"
                sx={{ height: 56, minWidth: 140, fontWeight: 700, color: '#FFD700', borderColor: '#FFD700' }}
                onClick={() => setPasswordDialogOpen(true)}
              >
                비밀번호 변경
              </Button>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={4}>
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel id="carrier-label" sx={{ color: '#FFD700', fontWeight: 700 }}>통신사</InputLabel>
                <Select
                  labelId="carrier-label"
                  value={carrier}
                  label="통신사"
                  onChange={e => setCarrier(e.target.value)}
                  sx={{ background: '#222', borderRadius: 2, color: '#fff', fontWeight: 700 }}
                >
                  <MenuItem value="SKT">SKT</MenuItem>
                  <MenuItem value="KT">KT</MenuItem>
                  <MenuItem value="LGU+">LGU+</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="메시지"
                value={message}
                onChange={e => setMessage(e.target.value)}
                fullWidth
                InputLabelProps={{ sx: { color: '#FFD700', fontWeight: 700 } }}
                InputProps={{ sx: { background: '#222', borderRadius: 2, color: '#fff' } }}
                placeholder="문의드립니다"
              />
            </Stack>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', background: 'rgba(24,26,32,0.98)', border: '2px solid #FFD700' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="secondary" mb={2} letterSpacing={1}>
              매장별 예약/방문 설정
            </Typography>
            <Grid container spacing={3}>
              {storeList.map(store => (
                <Grid item xs={12} sm={6} md={4} key={store.id}>
                  <Card sx={{ p: 2, borderRadius: 3, background: '#181A20', border: '1.5px solid #FFD700', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}>
                    <Typography variant="subtitle1" fontWeight={900} color="primary" mb={1} letterSpacing={1}>
                      {store.name}
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="자동화 시작 시간"
                        type="time"
                        value={getStoreSetting(store.id).startTime}
                        onChange={e => handleStoreChange(store.id, 'startTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true, sx: { color: '#FFD700', fontWeight: 700 } }}
                        InputProps={{ sx: { background: '#222', borderRadius: 2, color: '#fff' } }}
                      />
                      <DatePicker
                        label="방문 일자"
                        value={getStoreSetting(store.id).visitDate}
                        onChange={date => handleStoreChange(store.id, 'visitDate', date)}
                        format="YYYY-MM-DD"
                        slotProps={{ textField: { fullWidth: true, InputLabelProps: { sx: { color: '#FFD700', fontWeight: 700 } }, InputProps: { sx: { background: '#222', borderRadius: 2, color: '#fff' } } } }}
                      />
                      <TimePicker
                        label="방문 시간"
                        value={getStoreSetting(store.id).visitTime}
                        onChange={time => handleStoreChange(store.id, 'visitTime', time)}
                        format="HH:mm"
                        minutesStep={30}
                        slotProps={{ textField: { fullWidth: true, InputLabelProps: { sx: { color: '#FFD700', fontWeight: 700 } }, InputProps: { sx: { background: '#222', borderRadius: 2, color: '#fff' } } } }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        <Stack direction="row" justifyContent="flex-end" mt={4}>
          <Button
            variant="contained"
            size="large"
            sx={{
              fontWeight: 900,
              fontSize: 18,
              background: 'linear-gradient(90deg, #FFD700 60%, #BFA14A 100%)',
              color: '#181A20',
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(255,215,0,0.18)',
              px: 5,
              '&:hover': {
                background: 'linear-gradient(90deg, #181A20 60%, #FFD700 100%)',
                color: '#FFD700',
              },
            }}
            onClick={handleSave}
          >
            저장
          </Button>
        </Stack>
      </Box>
      <PasswordChangeDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSubmit={handlePasswordChange}
      />
      <Toast open={toastOpen} message={toastMsg} severity={toastSeverity} onClose={() => setToastOpen(false)} />
    </LocalizationProvider>
  );
};

export default Settings; 