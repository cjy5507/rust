import { Card, CardContent, Typography, Button, Chip, Paper, Stack, Box, ChipProps, Tooltip, Fab, Checkbox, FormControlLabel } from '@mui/material';
import Grid from '@mui/material/Grid';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchStores, fetchUserStoreSettings } from '../../api/rolex';

const statusColor: Record<string, ChipProps['color']> = {
  '대기중': 'default',
  '진행중': 'warning',
  '성공': 'success',
  '실패': 'error',
};

const statusIcon: Record<string, React.ReactNode> = {
  '대기중': <HourglassEmptyIcon fontSize="small" />,
  '진행중': <PlayArrowIcon fontSize="small" />,
  '성공': <CheckCircleIcon fontSize="small" />,
  '실패': <ErrorIcon fontSize="small" />,
};

const logs = [
  { id: 1, text: '2024-07-10 09:50 강남점 예약 성공', type: 'success' },
  { id: 2, text: '2024-07-10 10:20 명동점 예약 실패', type: 'error' },
  { id: 3, text: '2024-07-10 10:30 롯데본점 예약 성공', type: 'success' },
  { id: 4, text: '2024-07-10 10:40 신세계 예약 실패', type: 'error' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<any>({});
  const [email, setEmail] = useState<string>('');
  const [selectedStoreIds, setSelectedStoreIds] = useState<any[]>([]);

  // 실시간 시계 상태
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    // 네이버 시간 또는 PC 시간으로 초기화
    let baseTime: Date;
    const naverTimeStr = localStorage.getItem('naverTime');
    if (naverTimeStr && naverTimeStr.trim() !== '') {
      baseTime = new Date(naverTimeStr);
    } else {
      baseTime = new Date();
    }
    let current = baseTime.getTime();

    setClock(new Date(current).toLocaleString('ko-KR', { hour12: false }));

    const timer = setInterval(() => {
      current += 1000;
      setClock(new Date(current).toLocaleString('ko-KR', { hour12: false }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 로그인된 이메일 불러오기
    const email = localStorage.getItem('email') || '';
    setEmail(email);
    fetchStores()
      .then(setStores)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    // 유저별 매장 설정도 불러오기
    if (email) {
      fetchUserStoreSettings(email).then(data => {
        // data.settings: [{ storeId, startTime, visitDate, visitTime, ... }]
        const settingsMap: any = {};
        (data.settings || []).forEach((s: any) => {
          settingsMap[s.storeId || s.store?.id] = s;
        });
        setUserSettings(settingsMap);
      });
    }
  }, []);

  // 실제 자동화 실행 함수 (Playwright 연동 시 구현)
  const runAutomation = (store: any, setting: any) => {
    // TODO: Playwright 자동화 연동
    alert(`자동화 시작!\n매장: ${store.name}\n인증URL: ${store.authUrl}\n예약URL: ${store.reserveUrl}\n시작시간: ${setting?.startTime}\n예약날짜: ${setting?.visitDate || '-'}\n예약시간: ${setting?.visitTime || '-'}\n통신사: ${setting?.carrier}`);
    // 여기에 실제 자동화 로직 연결
  };

  const handleToggleStore = (storeId: any) => {
    setSelectedStoreIds(prev =>
      prev.includes(storeId) ? prev.filter((id: any) => id !== storeId) : [...prev, storeId]
    );
  };

  const handleBatchStart = () => {
    const selectedStores = stores.filter(store => selectedStoreIds.includes(store.id));
    selectedStores.forEach(store => {
      const setting = userSettings[store.id];
      runAutomation(store, setting);
    });
  };

  return (
    <Box maxWidth={1600} mx="auto" px={0} sx={{ fontFamily: 'Pretendard, Montserrat, Noto Sans KR, sans-serif' }}>
      <Grid container spacing={3} alignItems="center" mb={4}>
        <Grid item xs={12} sm={8}>
          <Typography variant="h4" fontWeight={900} color="primary" letterSpacing={2}>
            대시보드
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} style={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            sx={{ fontWeight: 900, borderRadius: 2 }}
            disabled={selectedStoreIds.length === 0}
            onClick={handleBatchStart}
          >
            선택된 매장 자동화 시작
          </Button>
        </Grid>
      </Grid>

      <Typography variant="h6" color="secondary" fontWeight={800} mb={2} letterSpacing={1}>
        매장별 예약 현황
      </Typography>
      {loading ? (
        <Typography color="secondary">매장 목록 불러오는 중...</Typography>
      ) : error ? (
        <Typography color="error">에러: {error}</Typography>
      ) : (
        <Grid container spacing={3} mb={4}>
          {stores.map(store => (
            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} key={store.id}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedStoreIds.includes(store.id)}
                    onChange={() => handleToggleStore(store.id)}
                    color="primary"
                  />
                }
                label="선택"
                sx={{ mb: 1 }}
              />
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
                  background: 'rgba(24,26,32,0.98)',
                  border: '2px solid #FFD700',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.03)',
                    boxShadow: '0 8px 32px 0 rgba(255,215,0,0.18)',
                    borderColor: '#BFA14A',
                  },
                  p: 2,
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Typography variant="h6" color="secondary" fontWeight={900} letterSpacing={1}>
                      {store.name}
                    </Typography>
                    <Chip
                      label={String(store.status ?? '대기중')}
                      color={statusColor[store.status] ?? 'default'}
                      size="medium"
                      icon={(statusIcon[store.status] ?? <HourglassEmptyIcon fontSize="small" />) as React.ReactElement}
                      sx={{ fontWeight: 700, fontSize: 15, px: 1.5 }}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Typography variant="body2" color="secondary">인증 URL:</Typography>
                    <a href={store.authUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>{store.authUrl}</a>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <Typography variant="body2" color="secondary">예약 URL:</Typography>
                    <a href={store.reserveUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', fontWeight: 700 }}>{store.reserveUrl}</a>
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <Button variant="contained" color="primary" size="medium" startIcon={<PlayArrowIcon />} sx={{ fontWeight: 900, borderRadius: 2 }} onClick={() => runAutomation(store, userSettings[store.id])}>
                      시작
                    </Button>
                    <Button variant="outlined" color="primary" size="medium" startIcon={<StopIcon />} sx={{ fontWeight: 900, borderRadius: 2 }}>
                      중지
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Typography variant="h6" color="secondary" fontWeight={800} mb={2} letterSpacing={1}>
        최근 로그
      </Typography>
      <Paper sx={{ p: 3, mb: 6, borderRadius: 4, background: 'rgba(24,26,32,0.98)', border: '2px solid #FFD700', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)' }}>
        <Stack spacing={2}>
          {logs.map(log => (
            <Stack key={log.id} direction="row" alignItems="center" spacing={2}>
              <Chip
                label={log.type === 'success' ? '성공' : '실패'}
                color={log.type === 'success' ? 'success' : 'error'}
                icon={log.type === 'success' ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{ fontWeight: 700, fontSize: 15 }}
              />
              <Typography color={log.type === 'success' ? 'success.main' : 'error.main'} fontWeight={900}>
                {log.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Tooltip title="설정으로 이동" arrow>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 48,
            right: 48,
            borderRadius: '50%',
            minWidth: 64,
            minHeight: 64,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)',
            fontSize: 28,
            p: 0,
            background: 'linear-gradient(135deg, #FFD700 60%, #181A20 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #181A20 60%, #FFD700 100%)',
              color: '#FFD700',
            },
          }}
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon fontSize="inherit" />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default Dashboard; 