import { Card, CardContent, Typography, Button, Chip, Paper, Stack, Box, ChipProps, Tooltip, Fab, Checkbox, Alert, Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PendingIcon from '@mui/icons-material/Pending';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import DeselectIcon from '@mui/icons-material/Deselect';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Watch as WatchIcon } from '@mui/icons-material';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { fetchStores, fetchUserStoreSettings } from '../../api/rolex';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import Toast from '../components/layout/Toast';
import ConfirmDialog from '../components/layout/ConfirmDialog';

// 상태별 색상과 아이콘 정의 (롤렉스 테마)
const statusConfig = {
  '대기중': { color: 'default' as ChipProps['color'], icon: <HourglassEmptyIcon />, bgColor: 'rgba(125, 133, 144, 0.1)' },
  '실행중': { color: 'info' as ChipProps['color'], icon: <PendingIcon />, bgColor: 'rgba(23, 162, 184, 0.2)' },
  '진행중': { color: 'warning' as ChipProps['color'], icon: <PlayArrowIcon />, bgColor: 'rgba(255, 193, 7, 0.2)' }, 
  '성공': { color: 'success' as ChipProps['color'], icon: <CheckCircleIcon />, bgColor: 'rgba(40, 167, 69, 0.2)' },
  '실패': { color: 'error' as ChipProps['color'], icon: <ErrorIcon />, bgColor: 'rgba(220, 53, 69, 0.2)' },
};

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
  
  // 동적 로그
  const [logs, setLogs] = useState([
    { id: 1, text: '2025-05-30 06:53 시스템 초기화 완료', type: 'success', time: '06:53' },
    { id: 2, text: '2025-05-30 06:53 매장 목록 로드 완료', type: 'info', time: '06:53' },
    { id: 3, text: '2025-05-30 06:53 사용자 설정 로드 완료', type: 'info', time: '06:53' },
  ]);
  
  // 토스트 훅
  const { toast, confirm, showToast, hideToast, showConfirm, hideConfirm, showSuccess, showError, showWarning, showInfo } = useToast();

  // 로그 추가 함수
  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const now = new Date();
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      text: `${now.toLocaleDateString('ko-KR')} ${time} ${text}`,
      type,
      time
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]); // 최대 20개 로그 유지
  };

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
    // API URL 확인 로그 - 더 상세하게
    const currentMode = import.meta.env.MODE;
    const currentAPI = import.meta.env.VITE_API_BASE_URL;
    const isDev = import.meta.env.DEV;
    const isProd = import.meta.env.PROD;
    
    console.log('🌐 Environment Details:');
    console.log('- MODE:', currentMode);
    console.log('- DEV:', isDev);
    console.log('- PROD:', isProd);
    console.log('- API URL:', currentAPI);
    console.log('- All env vars:', import.meta.env);
    
    addLog(`환경: ${currentMode} | DEV:${isDev} | PROD:${isProd}`, 'info');
    addLog(`API URL: ${currentAPI}`, 'info');
    
    // 데이터 초기화
    const email = localStorage.getItem('email') || '';
    setEmail(email);
    
    addLog('매장 목록 로드 시작', 'info');
    
    fetchStores()
      .then(data => {
        setStores(data);
        // 모든 매장을 초기에 '대기중' 상태로 설정
        const initialStatuses: Record<string, string> = {};
        data.forEach((store: any) => {
          initialStatuses[store.id] = '대기중';
        });
        setStoreStatuses(initialStatuses);
        addLog(`${data.length}개 매장 목록 로드 완료`, 'success');
      })
      .catch(err => {
        setError(err.message);
        addLog(`매장 목록 로드 실패: ${err.message}`, 'error');
      })
      .finally(() => setLoading(false));

    if (email) {
      addLog('사용자 설정 로드 시작', 'info');
      fetchUserStoreSettings(email).then(data => {
        const settingsMap: any = {};
        (data.settings || []).forEach((s: any) => {
          settingsMap[s.storeId || s.store?.id] = s;
        });
        setUserSettings(settingsMap);
        addLog('사용자 설정 로드 완료', 'success');
      }).catch(err => {
        addLog(`사용자 설정 로드 실패: ${err.message}`, 'error');
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
      addLog(`${store.name} 자동화 실행 시작`, 'info');
      
      console.log('🚀 개별 자동화 시작 요청:', storeConfig);

      const result = await invoke('run_single_automation', {
        storeConfig: storeConfig
      });

      console.log('✅ 개별 자동화 실행 성공:', result);
      updateStoreStatus(store.id, '진행중');
      addLog(`${store.name} 브라우저 실행 완료`, 'success');
      
      return result;
      
    } catch (error) {
      console.error('❌ 개별 자동화 실행 실패:', error);
      updateStoreStatus(store.id, '실패');
      addLog(`${store.name} 자동화 실행 실패: ${error}`, 'error');
      throw error;
    }
  };

  // 다중 자동화 실행
  const runMultipleAutomation = async () => {
    if (selectedStoreIds.length === 0) {
      showWarning('⚠️ 실행할 매장을 선택하세요.');
      return;
    }

    setIsExecuting(true);
    addLog(`${selectedStoreIds.length}개 매장 일괄 자동화 시작`, 'info');
    
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
      
      // @ts-ignore
      results.forEach((result: any, index: number) => {
        const storeId = selectedStoreIds[index];
        const store = stores.find(s => s.id === storeId);
        if (storeId) {
          updateStoreStatus(storeId, result.success ? '진행중' : '실패');
          addLog(`${store?.name}: ${result.success ? '브라우저 실행 성공' : '실행 실패'}`, result.success ? 'success' : 'error');
        }
      });

      // @ts-ignore
      const successCount = results.filter((r: any) => r.success).length;
      // @ts-ignore
      const failCount = results.length - successCount;
      
      addLog(`일괄 자동화 완료 - 성공: ${successCount}개, 실패: ${failCount}개`, 'success');
      showSuccess(`🚀 병렬 자동화 완료!\n✅ 성공: ${successCount}개\n❌ 실패: ${failCount}개\n\n모든 매장의 브라우저가 동시에 열렸습니다!`);
      
    } catch (error) {
      console.error('❌ 다중 자동화 실행 실패:', error);
      
      selectedStoreIds.forEach(storeId => {
        updateStoreStatus(storeId, '실패');
      });

      addLog(`일괄 자동화 실행 실패: ${error}`, 'error');
      showError(`❌ 다중 자동화 실행 실패:\n${error}`);
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
      
      addLog(`${store.name} 자동화 중지 신호 전송`, 'info');
      showInfo(`🛑 ${store.name} 중지 신호를 전송했습니다.\n브라우저 창을 수동으로 닫아주세요.`);
    } catch (error) {
      console.error('중지 실패:', error);
      addLog(`${store.name} 자동화 중지 실패: ${error}`, 'error');
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

  // 리셋 기능 개선 - 전체 시스템 초기화
  const handleFullReset = () => {
    showConfirm(
      '🔄 전체 시스템을 초기화하시겠습니까?\n\n• 모든 매장 상태가 "대기중"으로 변경됩니다\n• 선택된 매장이 모두 해제됩니다\n• 실행 중인 작업은 중지되지 않습니다',
      () => {
        // 모든 상태 초기화
        const resetStatuses: Record<string, string> = {};
        stores.forEach(store => {
          resetStatuses[store.id] = '대기중';
        });
        setStoreStatuses(resetStatuses);
        
        // 선택 해제
        setSelectedStoreIds([]);
        
        // 실행 상태 초기화
        setIsExecuting(false);
        
        addLog('시스템 전체 초기화 완료', 'success');
        showSuccess('✅ 시스템이 초기화되었습니다.');
      }
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      p: { xs: 1, md: 2 }
    }}>
      <Box maxWidth={1400} mx="auto">
        {/* 헤더 개선 */}
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #475569',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <Grid container spacing={3} alignItems="center">
            {/* 브랜드 섹션 */}
            <Grid item xs={12} lg={4}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                  color: '#0d1117',
                  boxShadow: '0 8px 20px rgba(201, 176, 55, 0.3)'
                }}>
                  <WatchIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={800} color="#c9b037" sx={{ 
                    fontFamily: 'Playfair Display, serif',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    ROLEX
                  </Typography>
                  <Typography variant="subtitle1" color="#94a3b8" fontWeight={500}>
                    자동화 시스템
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography variant="body2" color="#64748b" fontWeight={500}>
                      {clock}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            
            {/* 컨트롤 섹션 */}
            <Grid item xs={12} lg={4}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid #334155',
                backdropFilter: 'blur(5px)'
              }}>
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SelectAllIcon />}
                    onClick={handleSelectAll}
                    disabled={isExecuting}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      borderColor: '#475569',
                      color: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#c9b037',
                        background: 'rgba(201, 176, 55, 0.1)'
                      }
                    }}
                  >
                    전체선택
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DeselectIcon />}
                    onClick={handleDeselectAll}
                    disabled={isExecuting}
                    sx={{ 
                      borderRadius: 2,
                      fontWeight: 600,
                      borderColor: '#475569',
                      color: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#c9b037',
                        background: 'rgba(201, 176, 55, 0.1)'
                      }
                    }}
                  >
                    전체해제
                  </Button>
                  <Tooltip title="모든 매장 상태를 초기화하고 선택을 해제합니다" arrow>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RestartAltIcon />}
                      onClick={handleFullReset}
                      disabled={isExecuting}
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 600,
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        '&:hover': {
                          borderColor: '#dc2626',
                          background: 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                    >
                      전체 리셋
                    </Button>
                  </Tooltip>
                </Stack>
              </Paper>
            </Grid>
            
            {/* 액션 섹션 */}
            <Grid item xs={12} lg={4}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  disabled={selectedStoreIds.length === 0 || isExecuting}
                  onClick={handleBatchStart}
                  sx={{ 
                    fontWeight: 700,
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 30px rgba(59, 130, 246, 0.4)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                      color: '#94a3b8'
                    }
                  }}
                >
                  {isExecuting ? '실행 중...' : `일괄 시작 (${selectedStoreIds.length})`}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* 상태 인디케이터 */}
          {selectedStoreIds.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Alert 
                icon={<InfoIcon />}
                severity="info" 
                sx={{ 
                  borderRadius: 2,
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#e2e8f0'
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {selectedStoreIds.length}개 매장이 선택되었습니다. 
                  {isExecuting ? ' 자동화가 실행 중입니다...' : ' "일괄 시작" 버튼을 클릭하여 실행하세요.'}
                </Typography>
              </Alert>
            </Box>
          )}
        </Paper>

        {/* 매장 카드 섹션 개선 */}
        {loading ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid #475569',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <WatchIcon sx={{ fontSize: 48, color: '#c9b037', mb: 2 }} />
            <Typography variant="h6" color="#e2e8f0" fontWeight={600}>매장 목록 불러오는 중...</Typography>
            <Typography variant="body2" color="#94a3b8" mt={1}>잠시만 기다려주세요</Typography>
          </Paper>
        ) : error ? (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            border: '1px solid #ef4444',
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)'
          }}>
            <ErrorIcon sx={{ fontSize: 48, color: '#ef4444', mb: 2 }} />
            <Typography variant="h6" color="#ef4444" fontWeight={600}>오류가 발생했습니다</Typography>
            <Typography variant="body2" color="#94a3b8" mt={1}>{error}</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} mb={4}>
            {stores.map(store => {
              const currentStatus = storeStatuses[store.id] || '대기중';
              const isSelected = selectedStoreIds.includes(store.id);
              const isStoreExecuting = ['실행중', '진행중'].includes(currentStatus);
              // @ts-ignore
              const statusInfo = statusConfig[currentStatus];
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(201, 176, 55, 0.15) 0%, rgba(244, 208, 63, 0.1) 100%)'
                        : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                      border: isSelected 
                        ? '2px solid #c9b037' 
                        : '1px solid #475569',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isSelected ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
                      boxShadow: isSelected 
                        ? '0 20px 40px rgba(201, 176, 55, 0.3)'
                        : '0 10px 30px rgba(0,0,0,0.3)',
                      '&:hover': {
                        transform: isSelected ? 'translateY(-6px) scale(1.02)' : 'translateY(-4px) scale(1.01)',
                        borderColor: '#c9b037',
                        boxShadow: '0 20px 50px rgba(201, 176, 55, 0.2)',
                      },
                      height: '100%',
                    }}
                  >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* 헤더 */}
                      <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleStore(store.id)}
                          disabled={isStoreExecuting}
                          size="small"
                          sx={{ 
                            p: 0,
                            color: '#c9b037',
                            '&.Mui-checked': {
                              color: '#c9b037'
                            }
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="subtitle1" 
                            color="#f1f5f9" 
                            fontWeight={700}
                            sx={{ 
                              fontSize: '1.05rem', 
                              lineHeight: 1.3,
                              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {store.name}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* 상태 표시 개선 */}
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          background: `linear-gradient(135deg, ${statusInfo.bgColor}, rgba(255, 255, 255, 0.05))`,
                          border: `1px solid rgba(201, 176, 55, 0.2)`,
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 60,
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      >
                        <Chip
                          label={currentStatus}
                          color={statusInfo.color}
                          size="medium"
                          icon={React.cloneElement(statusInfo.icon, { sx: { fontSize: '18px !important' } })}
                          sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.9rem',
                            height: 36,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                          }}
                        />
                      </Box>

                      {/* 액션 버튼들 개선 */}
                      <Stack direction="row" spacing={1.5} mt="auto">
                        <Button 
                          variant="contained" 
                          size="small" 
                          startIcon={<PlayArrowIcon />}
                          disabled={isStoreExecuting}
                          onClick={() => runSingleAutomation(store, userSettings[store.id])}
                          sx={{ 
                            flex: 1, 
                            fontSize: '0.8rem', 
                            py: 1,
                            borderRadius: 2,
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                            },
                            '&:disabled': {
                              background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                              color: "#94a3b8"
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
                            fontSize: '0.8rem', 
                            py: 1,
                            borderRadius: 2,
                            fontWeight: 700,
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.1)',
                              borderColor: '#dc2626',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                            },
                            '&:disabled': {
                              borderColor: '#475569',
                              color: '#64748b'
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

        {/* 로그 섹션 개선 */}
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          border: '1px solid #475569',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)'
        }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={3}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white'
            }}>
              <AccessTimeIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="h5" color="#f1f5f9" fontWeight={700}>
              실행 로그
            </Typography>
            <Chip 
              label="실시간" 
              color="success" 
              size="small" 
              sx={{ fontWeight: 600 }} 
            />
          </Stack>
          
          <Divider sx={{ mb: 3, borderColor: '#475569' }} />
          
          <Stack spacing={2} sx={{ maxHeight: 250, overflow: 'auto' }}>
            {logs.map(log => (
              <Paper
                key={log.id}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  border: '1px solid #334155',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#c9b037',
                    transform: 'translateX(4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                  }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Chip
                    label={log.type === 'success' ? '성공' : log.type === 'info' ? '정보' : '실패'}
                    color={log.type === 'success' ? 'success' : log.type === 'info' ? 'info' : 'error'}
                    size="small"
                    sx={{ 
                      fontSize: '0.75rem', 
                      minWidth: 70,
                      fontWeight: 600
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    color="#e2e8f0"
                    sx={{ 
                      fontSize: '0.9rem', 
                      flex: 1,
                      fontWeight: 500
                    }}
                  >
                    {log.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="#94a3b8"
                    sx={{ 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(148, 163, 184, 0.1)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1
                    }}
                  >
                    {log.time}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>

        {/* 설정 FAB 개선 */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
            color: '#0f172a',
            boxShadow: '0 8px 25px rgba(201, 176, 55, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #f4d03f 0%, #c9b037 100%)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 35px rgba(201, 176, 55, 0.6)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Box>
      
      {/* Toast 컴포넌트 */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
      
      {/* 확인 대화상자 */}
      <ConfirmDialog
        open={confirm.open}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
        onClose={hideConfirm}
      />
    </Box>
  );
};

export default Dashboard;
