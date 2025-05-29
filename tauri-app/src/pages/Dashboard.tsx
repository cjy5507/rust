import { Card, CardContent, Typography, Button, Chip, Paper, Stack, Box, ChipProps, Tooltip, Fab, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WatchIcon from '@mui/icons-material/Watch';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchStores, fetchUserStoreSettings } from '../../api/rolex';
import { invoke } from '@tauri-apps/api/core';

// 상태별 색상과 아이콘 정의 (롤렉스 테마)
const statusConfig = {
  '대기중': { color: 'default' as ChipProps['color'], icon: <HourglassEmptyIcon />, bgColor: 'rgba(125, 133, 144, 0.1)' },
  '실행중': { color: 'info' as ChipProps['color'], icon: <PendingIcon />, bgColor: 'rgba(23, 162, 184, 0.2)' },
  '진행중': { color: 'warning' as ChipProps['color'], icon: <PlayArrowIcon />, bgColor: 'rgba(255, 193, 7, 0.2)' }, 
  '성공': { color: 'success' as ChipProps['color'], icon: <CheckCircleIcon />, bgColor: 'rgba(40, 167, 69, 0.2)' },
  '실패': { color: 'error' as ChipProps['color'], icon: <ErrorIcon />, bgColor: 'rgba(220, 53, 69, 0.2)' },
};

// 동적 로그
const logs = [
  { id: 1, text: '2025-05-29 22:15 롯데 명동 자동화 시작', type: 'info', time: '22:15' },
  { id: 2, text: '2025-05-29 22:14 환경 설정 완료', type: 'success', time: '22:14' },
  { id: 3, text: '2025-05-29 22:13 시스템 준비 중', type: 'info', time: '22:13' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<any>({});
  const [email, setEmail] = useState<string>('');
  const [selectedStoreIds, setSelectedStoreIds] = useState<any[]>([]);
  const [storeStatuses, setStoreStatuses] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  // 실시간 시계 상태
  const [clock, setClock] = useState<string>('');

  useEffect(() => {
    // 시계 초기화
    const updateClock = () => {
      setClock(new Date().toLocaleString('ko-KR', { 
        hour12: false,
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 데이터 초기화
    const email = localStorage.getItem('email') || '';
    setEmail(email);
    
    fetchStores()
      .then(data => {
        setStores(data);
        // 모든 매장을 초기에 '대기중' 상태로 설정
        const initialStatuses: Record<string, string> = {};
        data.forEach((store: any) => {
          initialStatuses[store.id] = '대기중';
        });
        setStoreStatuses(initialStatuses);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    if (email) {
      fetchUserStoreSettings(email).then(data => {
        const settingsMap: any = {};
        (data.settings || []).forEach((s: any) => {
          settingsMap[s.storeId || s.store?.id] = s;
        });
        setUserSettings(settingsMap);
      });
    }
  }, []);

  // 상태 업데이트 함수
  const updateStoreStatus = (storeId: any, status: string) => {
    setStoreStatuses(prev => ({
      ...prev,
      [storeId]: status
    }));
  };

  // 개별 매장 자동화 실행
  const runSingleAutomation = async (store: any, setting: any) => {
    const carrier = localStorage.getItem('carrier') || 'SKT';
    
    const storeConfig = {
      storeName: store.name,
      authUrl: store.authUrl,
      reserveUrl: store.reserveUrl,
      startTime: setting?.startTime || '10:00',
      visitDate: setting?.visitDate || '2025-05-29',
      visitTime: setting?.visitTime || '14:00',
      carrier: carrier,
      email: email
    };
    
    try {
      updateStoreStatus(store.id, '실행중');
      
      console.log('🚀 개별 자동화 시작 요청:', storeConfig);

      const result = await invoke('run_single_automation', {
        storeConfig: storeConfig
      });

      console.log('✅ 개별 자동화 실행 성공:', result);
      updateStoreStatus(store.id, '진행중');
      
      return result;
      
    } catch (error) {
      console.error('❌ 개별 자동화 실행 실패:', error);
      updateStoreStatus(store.id, '실패');
      throw error;
    }
  };

  // 다중 자동화 실행
  const runMultipleAutomation = async () => {
    if (selectedStoreIds.length === 0) {
      alert('⚠️ 실행할 매장을 선택하세요.');
      return;
    }

    setIsExecuting(true);
    
    selectedStoreIds.forEach(storeId => {
      updateStoreStatus(storeId, '실행중');
    });

    const carrier = localStorage.getItem('carrier') || 'SKT';
    
    const storeConfigs = selectedStoreIds.map(storeId => {
      const store = stores.find(s => s.id === storeId);
      const setting = userSettings[storeId];
      
      return {
        storeName: store.name,
        authUrl: store.authUrl,
        reserveUrl: store.reserveUrl,
        startTime: setting?.startTime || '10:00',
        visitDate: setting?.visitDate || '2025-05-29',
        visitTime: setting?.visitTime || '14:00',
        carrier: carrier,
        email: email
      };
    });

    try {
      console.log('🚀 다중 자동화 시작 요청 (병렬 실행):', storeConfigs);

      const results = await invoke('run_multiple_automation', {
        storeConfigs: storeConfigs
      });

      console.log('✅ 다중 자동화 실행 성공:', results);
      
      results.forEach((result: any, index: number) => {
        const storeId = selectedStoreIds[index];
        if (storeId) {
          updateStoreStatus(storeId, result.success ? '진행중' : '실패');
        }
      });

      const successCount = results.filter((r: any) => r.success).length;
      const failCount = results.length - successCount;
      
      alert(`🚀 병렬 자동화 완료!\n✅ 성공: ${successCount}개\n❌ 실패: ${failCount}개\n\n모든 매장의 브라우저가 동시에 열렸습니다!`);
      
    } catch (error) {
      console.error('❌ 다중 자동화 실행 실패:', error);
      
      selectedStoreIds.forEach(storeId => {
        updateStoreStatus(storeId, '실패');
      });

      alert(`❌ 다중 자동화 실행 실패:\n${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  // 자동화 중지 (개별)
  const stopSingleAutomation = async (store: any) => {
    try {
      const result = await invoke('stop_automation', {
        storeName: store.name
      });
      
      updateStoreStatus(store.id, '대기중');
      console.log(`🛑 ${store.name} 자동화 중지:`, result);
      
      alert(`🛑 ${store.name} 중지 신호를 전송했습니다.\n브라우저 창을 수동으로 닫아주세요.`);
    } catch (error) {
      console.error('중지 실패:', error);
    }
  };

  // 체크박스 관련 함수들
  const handleToggleStore = (storeId: any) => {
    setSelectedStoreIds(prev =>
      prev.includes(storeId) ? prev.filter((id: any) => id !== storeId) : [...prev, storeId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStoreIds(stores.map(store => store.id));
  };

  const handleDeselectAll = () => {
    setSelectedStoreIds([]);
  };

  const handleBatchStart = () => {
    runMultipleAutomation();
  };

  const handleResetAllStatus = () => {
    const resetStatuses: Record<string, string> = {};
    stores.forEach(store => {
      resetStatuses[store.id] = '대기중';
    });
    setStoreStatuses(resetStatuses);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: '#0d1117',
      p: 2
    }}>
      <Box maxWidth={1400} mx="auto">
        {/* 헤더 */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          borderRadius: 2,
          background: '#161b22',
          border: '1px solid #30363d',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                  color: '#0d1117'
                }}>
                  <WatchIcon sx={{ fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#c9b037" sx={{ fontFamily: 'Playfair Display, serif' }}>
                    ROLEX 자동화
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#9198a1' }} />
                    <Typography variant="body2" color="#9198a1">
                      {clock}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SelectAllIcon />}
                  onClick={handleSelectAll}
                  disabled={isExecuting}
                  sx={{ borderRadius: 1.5 }}
                >
                  전체선택
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DeselectIcon />}
                  onClick={handleDeselectAll}
                  disabled={isExecuting}
                  sx={{ borderRadius: 1.5 }}
                >
                  전체해제
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetAllStatus}
                  disabled={isExecuting}
                  sx={{ borderRadius: 1.5 }}
                >
                  리셋
                </Button>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<PlayArrowIcon />}
                disabled={selectedStoreIds.length === 0 || isExecuting}
                onClick={handleBatchStart}
                sx={{ 
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                }}
              >
                {isExecuting ? '실행 중...' : `시작 (${selectedStoreIds.length})`}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* 매장 카드 섹션 */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, background: '#161b22', border: '1px solid #30363d' }}>
            <Typography color="#9198a1">매장 목록 불러오는 중...</Typography>
          </Paper>
        ) : error ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, background: '#161b22', border: '1px solid #30363d' }}>
            <Typography color="#dc3545">에러: {error}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2} mb={3}>
            {stores.map(store => {
              const currentStatus = storeStatuses[store.id] || '대기중';
              const isSelected = selectedStoreIds.includes(store.id);
              const isStoreExecuting = ['실행중', '진행중'].includes(currentStatus);
              const statusInfo = statusConfig[currentStatus];
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      background: '#161b22',
                      border: isSelected 
                        ? '2px solid #c9b037' 
                        : '1px solid #30363d',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: isSelected 
                        ? '0 8px 25px rgba(201, 176, 55, 0.4)'
                        : '0 8px 32px rgba(0,0,0,0.3)',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: isSelected ? '#c9b037' : '#f4d03f',
                        boxShadow: '0 12px 40px rgba(201, 176, 55, 0.2)',
                      },
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* 헤더 */}
                      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleStore(store.id)}
                          disabled={isStoreExecuting}
                          size="small"
                          sx={{ p: 0 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            color="#f0f6fc" 
                            fontWeight={600}
                            sx={{ fontSize: '0.95rem', lineHeight: 1.3 }}
                          >
                            {store.name}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* 상태 표시 */}
                      <Box 
                        sx={{ 
                          p: 1.5, 
                          borderRadius: 1.5, 
                          background: statusInfo.bgColor,
                          border: `1px solid rgba(201, 176, 55, 0.3)`,
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Chip
                          label={currentStatus}
                          color={statusInfo.color}
                          size="small"
                          icon={React.cloneElement(statusInfo.icon, { sx: { fontSize: '16px !important' } })}
                          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                        />
                      </Box>

                      {/* 액션 버튼들 */}
                      <Stack direction="row" spacing={1}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          startIcon={<PlayArrowIcon />}
                          disabled={isStoreExecuting}
                          onClick={() => runSingleAutomation(store, userSettings[store.id])}
                          sx={{ 
                            flex: 1, 
                            fontSize: '0.75rem', 
                            py: 0.8,
                            borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #20c997 0%, #28a745 100%)',
                            },
                            '&:disabled': {
                              background: "#30363d",
                              color: "#7d8590"
                            }
                          }}
                        >
                          시작
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          startIcon={<StopIcon />}
                          disabled={currentStatus === '대기중'}
                          onClick={() => stopSingleAutomation(store)}
                          sx={{ 
                            flex: 1, 
                            fontSize: '0.75rem', 
                            py: 0.8,
                            borderRadius: 1.5,
                            borderColor: '#dc3545',
                            color: '#dc3545',
                            '&:hover': {
                              background: 'rgba(220, 53, 69, 0.1)',
                              borderColor: '#dc3545'
                            },
                            '&:disabled': {
                              borderColor: '#30363d',
                              color: '#7d8590'
                            }
                          }}
                        >
                          중지
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* 로그 섹션 */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 2,
          background: '#161b22',
          border: '1px solid #30363d',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <Typography variant="h6" color="#f0f6fc" fontWeight={600} mb={2}>
            실행 로그
          </Typography>
          <Stack spacing={1.5} sx={{ maxHeight: 200, overflow: 'auto' }}>
            {logs.map(log => (
              <Paper
                key={log.id}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  background: '#0d1117',
                  border: '1px solid #30363d'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={log.type === 'success' ? '성공' : log.type === 'info' ? '정보' : '실패'}
                    color={log.type === 'success' ? 'success' : log.type === 'info' ? 'info' : 'error'}
                    size="small"
                    sx={{ fontSize: '0.7rem', minWidth: 60 }}
                  />
                  <Typography 
                    variant="body2" 
                    color="#e6edf3"
                    sx={{ fontSize: '0.85rem', flex: 1 }}
                  >
                    {log.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="#7d8590"
                    sx={{ fontSize: '0.7rem' }}
                  >
                    {log.time}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>

        {/* 설정 FAB */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon />
        </Fab>
      </Box>
    </Box>
  );
};

export default Dashboard;
