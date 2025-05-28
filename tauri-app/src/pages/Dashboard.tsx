import { Card, CardContent, Typography, Button, Grid, Chip, Paper, Stack, Box, ChipProps, Tooltip, Fab } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const storeList = [
  { id: '1', name: '강남점', status: '대기중', lastResult: '성공' },
  { id: '2', name: '명동점', status: '진행중', lastResult: '실패' },
  { id: '3', name: '롯데본점', status: '성공', lastResult: '성공' },
  { id: '4', name: '신세계', status: '실패', lastResult: '실패' },
];

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

  return (
    <Box maxWidth={1200} mx="auto" my={4} px={2} sx={{ fontFamily: 'Pretendard, Montserrat, Noto Sans KR, sans-serif' }}>
      <Grid container spacing={3} alignItems="center" mb={4}>
        <Grid item xs={12} sm={8} {...({} as any)}>
          <Typography variant="h4" fontWeight={900} color="primary" letterSpacing={2}>
            대시보드
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4} {...({} as any)}>
          <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
            <Button variant="contained" color="primary" size="large" startIcon={<PlayArrowIcon />} sx={{ fontWeight: 900, borderRadius: 2 }}>
              전체 시작
            </Button>
            <Button variant="outlined" color="primary" size="large" startIcon={<StopIcon />} sx={{ fontWeight: 900, borderRadius: 2 }}>
              전체 중지
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Typography variant="h6" color="secondary" fontWeight={800} mb={2} letterSpacing={1}>
        매장별 예약 현황
      </Typography>
      <Grid container spacing={3} mb={4}>
        {storeList.map(store => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={store.id} {...({} as any)}>
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
                    label={String(store.status)}
                    color={statusColor[store.status]}
                    size="medium"
                    icon={statusIcon[store.status] as React.ReactElement | undefined}
                    sx={{ fontWeight: 700, fontSize: 15, px: 1.5 }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Typography variant="body2" color="secondary">최근 결과:</Typography>
                  <Typography
                    variant="body1"
                    color={store.lastResult === '성공' ? 'success.main' : store.lastResult === '실패' ? 'error.main' : 'warning.main'}
                    fontWeight={900}
                  >
                    {store.lastResult}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" color="primary" size="medium" startIcon={<PlayArrowIcon />} sx={{ fontWeight: 900, borderRadius: 2 }}>
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