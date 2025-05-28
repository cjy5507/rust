import { Card, CardContent, Typography, TextField, Switch, Button, Stack, Box, Grid, FormControlLabel, Tooltip, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useState } from 'react';

const storeList = [
  { id: '1', name: '강남점' },
  { id: '2', name: '명동점' },
];

const Settings = () => {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [headless, setHeadless] = useState(true);
  const [carrier, setCarrier] = useState('SKT');
  // 매장별 상태: { [id]: { startTime: string, visitDate: Dayjs|null, visitTime: Dayjs|null } }
  const [storeSettings, setStoreSettings] = useState(() =>
    Object.fromEntries(
      storeList.map(store => [store.id, {
        startTime: '10:00',
        visitDate: dayjs(),
        visitTime: dayjs('10:00', 'HH:mm'),
      }])
    )
  );

  const handleStoreChange = (id: string, key: string, value: any) => {
    setStoreSettings(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  };

  const handleSave = () => {
    // TODO: 실제 저장 로직 연결
    alert(`설정이 저장되었습니다!\n통신사: ${carrier}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        maxWidth={800}
        mx="auto"
        my={7}
        sx={{ fontFamily: 'Pretendard, Montserrat, Noto Sans KR, sans-serif' }}
      >
        <Typography
          variant="h4"
          fontWeight={900}
          color="primary"
          mb={4}
          letterSpacing={3}
          sx={{ textTransform: 'uppercase', fontFamily: 'Montserrat, Pretendard, Noto Sans KR, sans-serif' }}
        >
          설정
        </Typography>
        <Card
          sx={{ mb: 4, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', background: 'rgba(24,26,32,0.98)', border: '2px solid #FFD700' }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="secondary" mb={2} letterSpacing={1}>
              공통 설정
            </Typography>
            <Stack direction="row" alignItems="center" spacing={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={globalEnabled}
                    onChange={e => setGlobalEnabled(e.target.checked)}
                    color="primary"
                    sx={{ '& .MuiSwitch-thumb': { backgroundColor: '#FFD700' }, '& .MuiSwitch-track': { backgroundColor: '#333', opacity: 1 } }}
                  />
                }
                label={<Typography fontWeight={700} color="#FFD700">자동화 전체 활성화</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={headless}
                    onChange={e => setHeadless(e.target.checked)}
                    color="primary"
                    sx={{ '& .MuiSwitch-thumb': { backgroundColor: '#FFD700' }, '& .MuiSwitch-track': { backgroundColor: '#333', opacity: 1 } }}
                  />
                }
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontWeight={700} color="#FFD700">빠른 모드(봇 감지될 수 있음)</Typography>
                    <Tooltip title="이 모드를 사용하면 브라우저가 보이지 않게 실행되어 빠르지만, 봇으로 감지될 수 있습니다." arrow>
                      <Typography fontSize={13} color="error" fontWeight={700}>
                      </Typography>
                    </Tooltip>
                  </Stack>
                }
              />
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
            </Stack>
          </CardContent>
        </Card>
        <Card
          sx={{ borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', background: 'rgba(24,26,32,0.98)', border: '2px solid #FFD700' }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={800} color="secondary" mb={2} letterSpacing={1}>
              매장별 예약/방문 설정
            </Typography>
            <Grid container spacing={3 as any}>
              {storeList.map(store => (
                <Grid item xs={12} sm={6} md={4} key={store.id} {...({} as any)}>
                  <Card sx={{ p: 2, borderRadius: 3, background: '#181A20', border: '1.5px solid #FFD700', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}>
                    <Typography variant="subtitle1" fontWeight={900} color="primary" mb={1} letterSpacing={1}>
                      {store.name}
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="자동화 시작 시간"
                        type="time"
                        value={storeSettings[store.id].startTime}
                        onChange={e => handleStoreChange(store.id, 'startTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true, sx: { color: '#FFD700', fontWeight: 700 } }}
                        InputProps={{ sx: { background: '#222', borderRadius: 2, color: '#fff' } }}
                      />
                      <DatePicker
                        label="방문 일자"
                        value={storeSettings[store.id].visitDate}
                        onChange={date => handleStoreChange(store.id, 'visitDate', date)}
                        format="YYYY-MM-DD"
                        slotProps={{ textField: { fullWidth: true, InputLabelProps: { sx: { color: '#FFD700', fontWeight: 700 } }, InputProps: { sx: { background: '#222', borderRadius: 2, color: '#fff' } } } }}
                      />
                      <TimePicker
                        label="방문 시간"
                        value={storeSettings[store.id].visitTime}
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
    </LocalizationProvider>
  );
};

export default Settings; 