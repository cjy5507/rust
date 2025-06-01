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
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStores, fetchUserStoreSettings } from '../../api/rolex';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../hooks/useToast';
import Toast from '../components/layout/Toast';
import ConfirmDialog from '../components/layout/ConfirmDialog';
import { debugEnvironment, interceptApiCalls } from '../utils/environment-debug';

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
    { id: 'init-1', text: '2025-05-30 06:53 시스템 초기화 완료', type: 'success', time: '06:53' },
    { id: 'init-2', text: '2025-05-30 06:53 매장 목록 로드 완료', type: 'info', time: '06:53' },
    { id: 'init-3', text: '2025-05-30 06:53 사용자 설정 로드 완료', type: 'info', time: '06:53' },
  ]);
  
  // 토스트 훅
  const { toast, confirm, showToast, hideToast, showConfirm, hideConfirm, showSuccess, showError, showWarning, showInfo } = useToast();

  // 로그 추가 함수
  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    const now = new Date();
    const time = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 고유한 ID 생성
      text: `${now.toLocaleDateString('ko-KR')} ${time} ${text}`,
      type,
      time
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]); // 최대 20개 로그 유지
  };

  const [clock, setClock] = useState<string>('');
  const [autoStartTimers, setAutoStartTimers] = useState<Record<string, NodeJS.Timeout>>({});

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

  // 자동 시작 시간 체크 함수 (강화된 디버깅 포함)
  const checkAutoStartTime = (store: any, setting: any) => {
    // startTime 필드 먼저 확인 (서버에서 주는 실제 필드명)
    if (!setting?.startTime && !setting?.startDateTime) {
      // console.log(`${store.name}: 시작 시간 설정 없음 (startTime, startDateTime 모두 없음)`);
      return;
    }
    
    const now = new Date();
    
    // startTime을 Date 객체로 변환 (여러 형식 지원)
    let startTime: Date;
    
    // 1순위: startTime 필드 (서버에서 주는 실제 데이터)
    if (setting.startTime) {
      if (typeof setting.startTime === 'string') {
        // DB 형식 1순위: "YYYY-MM-DD HH:mm" (초 없음, 공백 구분)
        if (setting.startTime.includes(' ') && setting.startTime.length === 16) {
          // "2025-05-31 14:37" 형식
          startTime = new Date(setting.startTime + ':00'); // 초 추가해서 파싱
        }
        // DB 형식 2순위: "YYYY-MM-DD HH:mm:ss" (초 포함, 공백 구분)
        else if (setting.startTime.includes(' ') && setting.startTime.length === 19) {
          // "2025-05-31 14:37:00" 형식
          startTime = new Date(setting.startTime);
        }
        // ISO 형식: "YYYY-MM-DDTHH:mm:ss" (T 구분)
        else if (setting.startTime.includes('T')) {
          startTime = new Date(setting.startTime);
        } else {
          // 기타 형식
          startTime = new Date(setting.startTime);
        }
      } else if (setting.startTime instanceof Date) {
        startTime = setting.startTime;
      } else {
        startTime = new Date(setting.startTime);
      }
    }
    // 2순위: startDateTime 필드 (호환성)
    else if (setting.startDateTime) {
      if (setting.startDateTime._d) {
        // dayjs 객체인 경우
        startTime = new Date(setting.startDateTime._d);
      } else if (typeof setting.startDateTime === 'string') {
        // 문자열인 경우
        startTime = new Date(setting.startDateTime);
      } else if (setting.startDateTime instanceof Date) {
        // 이미 Date 객체인 경우
        startTime = setting.startDateTime;
      } else {
        // dayjs 객체의 경우 toDate() 사용
        startTime = setting.startDateTime.toDate ? setting.startDateTime.toDate() : new Date(setting.startDateTime);
      }
    } else {
      return;
    }
    
    // 시간 유효성 검사
    if (isNaN(startTime.getTime())) {
      console.warn(`${store.name}: 잘못된 시작 시간 형식:`, setting.startTime || setting.startDateTime);
      return;
    }
    
    const nowStr = now.toLocaleString('ko-KR', { hour12: false });
    const startTimeStr = startTime.toLocaleString('ko-KR', { hour12: false });
    const timeDiff = startTime.getTime() - now.getTime();
    
    // 디버깅 로그 (매분마다 또는 5초 남았을 때만)
    const remainingSeconds = Math.floor(timeDiff / 1000);
    if (remainingSeconds === 300 || remainingSeconds === 60 || remainingSeconds === 10 || (remainingSeconds > 0 && remainingSeconds <= 5)) {
      console.log(`🕐 ${store.name} 시간 체크:
        현재 시간: ${nowStr}
        시작 시간: ${startTimeStr}
        남은 시간: ${remainingSeconds}초 (${Math.floor(remainingSeconds/60)}분 ${remainingSeconds%60}초)
        상태: ${storeStatuses[store.id]}`);
    }
    
    // 현재 시간이 시작 시간을 지났고, 상태가 '대기중'인 경우에만 자동 시작
    if (now >= startTime && storeStatuses[store.id] === '대기중') {
      console.log(`🚀 ${store.name} 자동 시작 조건 만족:
        현재: ${nowStr} >= 시작: ${startTimeStr}
        상태: ${storeStatuses[store.id]} → 자동화 실행`);
      
      addLog(`${store.name} 자동 시작 시간 도달 - 자동화 실행`, 'info');
      
      // 상태를 먼저 변경하여 중복 실행 방지
      updateStoreStatus(store.id, '실행중');
      
      // 자동화 실행
      runSingleAutomation(store, setting, true); // 자동 실행 표시
    } else if (timeDiff > 0 && storeStatuses[store.id] === '대기중') {
      // 아직 시간이 안 됨 - 아무것도 하지 않음 (정상)
    }
  };

  // 자동 시작 타이머 설정
  useEffect(() => {
    // 기존 타이머들 정리
    Object.values(autoStartTimers).forEach(timer => clearInterval(timer));
    setAutoStartTimers({});

    const newTimers: Record<string, NodeJS.Timeout> = {};

    stores.forEach(store => {
      const setting = userSettings[store.id];
      // startTime 또는 startDateTime 필드가 있으면 타이머 설정
      if (setting?.startTime || setting?.startDateTime) {
        // 1초마다 시간 체크
        const timer = setInterval(() => {
          checkAutoStartTime(store, setting);
        }, 1000);
        newTimers[store.id] = timer;
      }
    });

    setAutoStartTimers(newTimers);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      Object.values(newTimers).forEach(timer => clearInterval(timer));
    };
  }, [stores, userSettings, storeStatuses]);

  useEffect(() => {
    // 환경변수 디버깅
    debugEnvironment();
    interceptApiCalls();
    

    // 데이터 초기화
    const email = localStorage.getItem('email') || '';
    console.log('📧 Dashboard에서 로드한 이메일:', email);
    console.log('📧 localStorage 전체:', localStorage);
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
      console.log('📧 Dashboard에서 사용자 설정 로드 시작, email:', email);
      fetchUserStoreSettings(email).then(data => {
        console.log('📥 Dashboard에서 서버로부터 받은 원본 데이터:', data);
        console.log('📋 받은 설정 배열:', data.settings);
        
        const settingsMap: any = {};
        (data.settings || []).forEach((s: any) => {
          const storeId = s.storeId || s.store?.id;
          console.log('🏪 Dashboard에서 매장 설정 처리:', {
            storeId: storeId,
            원본_서버_데이터: s,
            startTime_필드: s.startTime,
            startDateTime_필드: s.startDateTime,
            visitDate: s.visitDate,
            visitTime: s.visitTime
          });
          
          // 서버에서 받은 원본 데이터를 그대로 저장 (변환하지 않음)
          settingsMap[storeId] = {
            startTime: s.startTime, // 서버에서 받은 원본 startTime
            startDateTime: s.startDateTime, // 호환성용
            visitDate: s.visitDate,
            visitTime: s.visitTime,
            // 추가 필드들도 보존
            ...s
          };
          
          console.log(`📋 ${storeId} 최종 매핑된 설정:`, settingsMap[storeId]);
        });
        
        console.log('🗂️ Dashboard 최종 settingsMap:', settingsMap);
        setUserSettings(settingsMap);
        console.log('✅ Dashboard userSettings 상태 업데이트 완료');
      }).catch(err => {
        console.error('❌ Dashboard 사용자 설정 로드 실패:', err);
        addLog(`사용자 설정 로드 실패: ${err.message}`, 'error');
      });
    } else {
      console.log('❌ 이메일이 없어서 설정을 로드하지 않음');
    }
  }, []);

  // 상태 업데이트 함수
  const updateStoreStatus = (storeId: any, status: string) => {
    setStoreStatuses(prev => ({
      ...prev,
      [storeId]: status
    }));
  };

  // 개별 매장 자동화 실행 (시간 정보 포함)
  const runSingleAutomation = async (store: any, setting: any, isAutoStart = false) => {
    console.log(`🚀 runSingleAutomation 시작 - ${store.name}`);
    console.log('📥 전달받은 store:', store);
    console.log('📥 전달받은 setting:', setting);
    console.log('📥 isAutoStart:', isAutoStart);
    
    const carrier = localStorage.getItem('carrier') || 'SKT';
    console.log('📱 사용할 통신사:', carrier);
    
    // 클라이언트 현재 시간을 ISO 8601 형식으로 가져오기
    const clientTime = new Date().toISOString();
    console.log('📅 클라이언트 현재 시간:', clientTime);
    
    // 설정된 시작 시간 가져오기
    let startTimeStr = null;
    
    // 디버깅: setting 객체의 모든 속성 확인
    console.log('🔍 setting 객체 전체:', JSON.stringify(setting, null, 2));
    
    // startTime 필드 확인 (서버에서 주는 실제 필드명)
    if (setting?.startTime) {
      console.log('✅ startTime 필드 발견:', setting.startTime);
      console.log('typeof startTime:', typeof setting.startTime);
      let startTime: Date;
      
      if (typeof setting.startTime === 'string') {
        console.log('📅 startTime 문자열 형식 감지');
        
        // DB 형식 1순위: "YYYY-MM-DD HH:mm" (초 없음, 공백 구분)
        if (setting.startTime.includes(' ') && setting.startTime.length === 16) {
          // "2025-05-31 14:37" 형식
          console.log('📅 DB 형식 감지 (분까지): YYYY-MM-DD HH:mm');
          startTime = new Date(setting.startTime + ':00'); // 초 추가해서 파싱
        }
        // DB 형식 2순위: "YYYY-MM-DD HH:mm:ss" (초 포함, 공백 구분)
        else if (setting.startTime.includes(' ') && setting.startTime.length === 19) {
          // "2025-05-31 14:37:00" 형식
          console.log('📅 DB 형식 감지 (초까지): YYYY-MM-DD HH:mm:ss');
          startTime = new Date(setting.startTime);
        }
        // ISO 형식: "YYYY-MM-DDTHH:mm:ss" (T 구분)
        else if (setting.startTime.includes('T')) {
          console.log('📅 ISO 형식 감지: YYYY-MM-DDTHH:mm:ss');
          startTime = new Date(setting.startTime);
        } else {
          // 기타 형식
          console.log('📅 기타 문자열 형식, 직접 변환 시도');
          startTime = new Date(setting.startTime);
        }
      } else if (setting.startTime instanceof Date) {
        console.log('📅 startTime Date 객체 감지');
        startTime = setting.startTime;
      } else {
        console.log('📅 startTime 기타 형식, 변환 시도');
        startTime = new Date(setting.startTime);
      }
      
      console.log('변환된 startTime:', startTime);
      console.log('startTime.getTime():', startTime.getTime());
      console.log('isNaN(startTime.getTime()):', isNaN(startTime.getTime()));
      
      if (!isNaN(startTime.getTime())) {
        startTimeStr = startTime.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss 형식
        console.log('✅ 최종 startTimeStr:', startTimeStr);
      } else {
        console.log('❌ startTime 변환 실패 - NaN');
        console.log('원본 startTime 값:', setting.startTime);
      }
    }
    
    // 호환성을 위해 startDateTime도 확인 (기존 코드 호환)
    else if (setting?.startDateTime) {
      console.log('✅ startDateTime 필드 발견 (호환성):', setting.startDateTime);
      let startTime: Date;
      
      if (setting.startDateTime._d) {
        console.log('📅 dayjs 객체 감지 (_d 속성)');
        startTime = new Date(setting.startDateTime._d);
      } else if (typeof setting.startDateTime === 'string') {
        console.log('📅 startDateTime 문자열 형식 감지');
        startTime = new Date(setting.startDateTime);
      } else if (setting.startDateTime instanceof Date) {
        console.log('📅 startDateTime Date 객체 감지');
        startTime = setting.startDateTime;
      } else {
        console.log('📅 startDateTime 기타 형식, toDate() 시도');
        startTime = setting.startDateTime.toDate ? setting.startDateTime.toDate() : new Date(setting.startDateTime);
      }
      
      console.log('변환된 startTime (startDateTime):', startTime);
      console.log('startTime.getTime():', startTime.getTime());
      console.log('isNaN(startTime.getTime()):', isNaN(startTime.getTime()));
      
      if (!isNaN(startTime.getTime())) {
        startTimeStr = startTime.toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss 형식
        console.log('✅ 최종 startTimeStr (startDateTime):', startTimeStr);
      } else {
        console.log('❌ startDateTime 변환 실패 - NaN');
      }
    } else {
      console.log('❌ startTime 및 startDateTime 필드 모두 없음');
      console.log('userSettings[store.id]:', userSettings[store.id]);
    }
    
    // 수동 실행 시 시간 확인 및 경고
    if (!isAutoStart && startTimeStr) {
      const now = new Date();
      const startTime = new Date(startTimeStr);
      const timeDiff = startTime.getTime() - now.getTime();
      const nowStr = now.toLocaleString('ko-KR', { hour12: false });
      const startTimeStr_display = startTime.toLocaleString('ko-KR', { hour12: false });
      
      if (timeDiff > 60000) { // 1분 이상 남은 경우
        const remainingMinutes = Math.floor(timeDiff / 60000);
        const remainingHours = Math.floor(remainingMinutes / 60);
        
        const confirmMessage = 
          `⚠️ 수동 실행 확인\n\n` +
          `${store.name}\n` +
          `설정된 자동 시작 시간: ${startTimeStr_display}\n` +
          `현재 시간: ${nowStr}\n\n` +
          `아직 ${remainingHours > 0 ? `${remainingHours}시간 ` : ''}${remainingMinutes % 60}분 남았습니다.\n\n` +
          `브라우저를 열고 "동의합니다" 버튼 전까지 진행합니다.\n` +
          `"동의합니다" 버튼은 설정된 시간에 자동으로 클릭됩니다.\n\n` +
          `지금 바로 실행하시겠습니까?`;
        
        const confirmed = window.confirm(confirmMessage);
        
        if (!confirmed) {
          console.log(`${store.name}: 사용자가 수동 실행을 취소했습니다.`);
          return;
        }
        
        addLog(`${store.name} 수동 실행 (설정 시간보다 ${remainingMinutes}분 일찍, ${startTimeStr_display}에 동의 버튼 클릭 예정)`, 'info');
      } else {
        addLog(`${store.name} 수동 실행 (시간 도달, 즉시 동의 버튼 클릭)`, 'info');
      }
    } else if (isAutoStart) {
      addLog(`${store.name} 자동 실행 (설정 시간 도달)`, 'success');
    } else {
      console.log(`${store.name}: 시작 시간이 설정되지 않음 - 즉시 실행`);
      addLog(`${store.name} 수동 실행 (시작 시간 미설정, 즉시 실행)`, 'info');
    }
    
    const storeConfig = {
      storeName: store.name,
      authUrl: store.authUrl,
      reserveUrl: store.reserveUrl,
      startTime: startTimeStr, // 설정된 시작 시간 전달
      visitDate: setting?.visitDate || '2025-05-29',
      visitTime: setting?.visitTime || '14:00',
      carrier: carrier,
      email: email,
      clientTime: clientTime // 클라이언트 현재 시간 전달
    };
    
    try {
      updateStoreStatus(store.id, '실행중');
      console.log(`🚀 ${isAutoStart ? '자동' : '수동'} 자동화 시작 요청:`, storeConfig);
      console.log(`📱 클라이언트 시간: ${clientTime}`);
      console.log(`⏰ 설정 시간: ${startTimeStr || '설정 없음'}`);

      const result = await invoke('run_single_automation', {
        storeConfig: storeConfig
      });

      console.log('✅ 개별 자동화 실행 성공:', result);
      updateStoreStatus(store.id, '진행중');
      addLog(`${store.name} 브라우저 실행 완료 (동의 버튼은 ${startTimeStr ? new Date(startTimeStr).toLocaleString('ko-KR', { hour12: false }) : '즉시'} 클릭 예정)`, 'success');
      
      return result;
      
    } catch (error) {
      console.error('❌ 개별 자동화 실행 실패:', error);
      updateStoreStatus(store.id, '실패');
      addLog(`${store.name} 자동화 실행 실패: ${error}`, 'error');
      throw error;
    }
  };

  // 다중 자동화 실행 (수동 일괄 실행)
  const runMultipleAutomation = async () => {
    if (selectedStoreIds.length === 0) {
      showWarning('⚠️ 실행할 매장을 선택하세요.');
      return;
    }

    // 일괄 수동 실행 확인
    const confirmMessage = 
      `🚀 일괄 수동 실행 확인\n\n` +
      `선택된 ${selectedStoreIds.length}개 매장을 지금 바로 실행하시겠습니까?\n\n` +
      `• 설정된 자동 시작 시간과 관계없이 즉시 실행됩니다\n` +
      `• 모든 매장의 브라우저가 동시에 열립니다`;
    
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      console.log('사용자가 일괄 실행을 취소했습니다.');
      return;
    }

    setIsExecuting(true);
    addLog(`${selectedStoreIds.length}개 매장 일괄 수동 실행 시작`, 'info');
    
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
        startTime: null, // 즉시 시작하도록 null로 설정
        visitDate: setting?.visitDate || '2025-05-29',
        visitTime: setting?.visitTime || '14:00',
        carrier: carrier,
        email: email,
        clientTime: null // 시간 비교 제거
      };
    });

    try {
      console.log('🚀 다중 수동 실행 요청 (병렬 실행, 즉시 시작):', storeConfigs);

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
      
      addLog(`일괄 수동 실행 완료 - 성공: ${successCount}개, 실패: ${failCount}개`, 'success');
      showSuccess(`🚀 일괄 수동 실행 완료!\n✅ 성공: ${successCount}개\n❌ 실패: ${failCount}개\n\n모든 매장의 브라우저가 동시에 열렸습니다!`);
      
    } catch (error) {
      console.error('❌ 다중 자동화 실행 실패:', error);
      
      selectedStoreIds.forEach(storeId => {
        updateStoreStatus(storeId, '실패');
      });

      addLog(`일괄 수동 실행 실패: ${error}`, 'error');
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
                  {isExecuting ? '실행 중...' : `일괄 수동 시작 (${selectedStoreIds.length})`}
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

                      {/* 시간 정보 표시 추가 */}
                      {(userSettings[store.id]?.startTime || userSettings[store.id]?.startDateTime) && (
                        <Box 
                          sx={{ 
                            p: 2, 
                            mb: 2,
                            borderRadius: 2, 
                            background: 'rgba(201, 176, 55, 0.1)',
                            border: '1px solid rgba(201, 176, 55, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: 1
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#c9b037' }} />
                            <Typography variant="caption" color="#c9b037" fontWeight={600}>
                              자동 시작 시간
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="#f1f5f9" fontWeight={600} textAlign="center">
                            {(() => {
                              let startTime: Date;
                              
                              // startTime을 Date 객체로 변환 (우선순위: startTime > startDateTime)
                              if (userSettings[store.id].startTime) {
                                if (typeof userSettings[store.id].startTime === 'string') {
                                  // DB 형식 1순위: "YYYY-MM-DD HH:mm" (초 없음, 공백 구분)
                                  if (userSettings[store.id].startTime.includes(' ') && userSettings[store.id].startTime.length === 16) {
                                    // "2025-05-31 14:37" 형식
                                    startTime = new Date(userSettings[store.id].startTime + ':00'); // 초 추가해서 파싱
                                  }
                                  // DB 형식 2순위: "YYYY-MM-DD HH:mm:ss" (초 포함, 공백 구분)
                                  else if (userSettings[store.id].startTime.includes(' ') && userSettings[store.id].startTime.length === 19) {
                                    // "2025-05-31 14:37:00" 형식
                                    startTime = new Date(userSettings[store.id].startTime);
                                  }
                                  // ISO 형식: "YYYY-MM-DDTHH:mm:ss" (T 구분)
                                  else if (userSettings[store.id].startTime.includes('T')) {
                                    startTime = new Date(userSettings[store.id].startTime);
                                  } else {
                                    // 기타 형식
                                    startTime = new Date(userSettings[store.id].startTime);
                                  }
                                } else if (userSettings[store.id].startTime instanceof Date) {
                                  startTime = userSettings[store.id].startTime;
                                } else {
                                  startTime = new Date(userSettings[store.id].startTime);
                                }
                              } else if (userSettings[store.id].startDateTime) {
                                if (userSettings[store.id].startDateTime._d) {
                                  startTime = new Date(userSettings[store.id].startDateTime._d);
                                } else if (typeof userSettings[store.id].startDateTime === 'string') {
                                  startTime = new Date(userSettings[store.id].startDateTime);
                                } else if (userSettings[store.id].startDateTime instanceof Date) {
                                  startTime = userSettings[store.id].startDateTime;
                                } else {
                                  startTime = userSettings[store.id].startDateTime.toDate ? 
                                    userSettings[store.id].startDateTime.toDate() : 
                                    new Date(userSettings[store.id].startDateTime);
                                }
                              }
                              
                              if (isNaN(startTime.getTime())) {
                                return '시간 형식 오류';
                              }
                              
                              return startTime.toLocaleString('ko-KR', {
                                month: '2-digit',
                                day: '2-digit', 
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              });
                            })()}
                          </Typography>
                          {/* 남은 시간 표시 */}
                          {(() => {
                            const now = new Date();
                            let startTime: Date;
                            
                            // startTime을 Date 객체로 변환 (우선순위: startTime > startDateTime)
                            if (userSettings[store.id].startTime) {
                              if (typeof userSettings[store.id].startTime === 'string') {
                                // DB 형식 1순위: "YYYY-MM-DD HH:mm" (초 없음, 공백 구분)
                                if (userSettings[store.id].startTime.includes(' ') && userSettings[store.id].startTime.length === 16) {
                                  // "2025-05-31 14:37" 형식
                                  startTime = new Date(userSettings[store.id].startTime + ':00'); // 초 추가해서 파싱
                                }
                                // DB 형식 2순위: "YYYY-MM-DD HH:mm:ss" (초 포함, 공백 구분)
                                else if (userSettings[store.id].startTime.includes(' ') && userSettings[store.id].startTime.length === 19) {
                                  // "2025-05-31 14:37:00" 형식
                                  startTime = new Date(userSettings[store.id].startTime);
                                }
                                // ISO 형식: "YYYY-MM-DDTHH:mm:ss" (T 구분)
                                else if (userSettings[store.id].startTime.includes('T')) {
                                  startTime = new Date(userSettings[store.id].startTime);
                                } else {
                                  // 기타 형식
                                  startTime = new Date(userSettings[store.id].startTime);
                                }
                              } else if (userSettings[store.id].startTime instanceof Date) {
                                startTime = userSettings[store.id].startTime;
                              } else {
                                startTime = new Date(userSettings[store.id].startTime);
                              }
                            } else if (userSettings[store.id].startDateTime) {
                              if (userSettings[store.id].startDateTime._d) {
                                startTime = new Date(userSettings[store.id].startDateTime._d);
                              } else if (typeof userSettings[store.id].startDateTime === 'string') {
                                startTime = new Date(userSettings[store.id].startDateTime);
                              } else if (userSettings[store.id].startDateTime instanceof Date) {
                                startTime = userSettings[store.id].startDateTime;
                              } else {
                                startTime = userSettings[store.id].startDateTime.toDate ? 
                                  userSettings[store.id].startDateTime.toDate() : 
                                  new Date(userSettings[store.id].startDateTime);
                              }
                            }
                            
                            if (isNaN(startTime.getTime())) {
                              return (
                                <Typography variant="caption" color="#ef4444" textAlign="center">
                                  시간 형식 오류
                                </Typography>
                              );
                            }
                            
                            const remainingMs = startTime.getTime() - now.getTime();
                            
                            if (remainingMs > 0) {
                              const totalSeconds = Math.floor(remainingMs / 1000);
                              const hours = Math.floor(totalSeconds / 3600);
                              const minutes = Math.floor((totalSeconds % 3600) / 60);
                              const seconds = totalSeconds % 60;
                              
                              let timeStr = '';
                              if (hours > 0) timeStr += `${hours}시간 `;
                              if (minutes > 0) timeStr += `${minutes}분 `;
                              timeStr += `${seconds}초 남음`;
                              
                              return (
                                <Typography variant="caption" color="#94a3b8" textAlign="center">
                                  {timeStr}
                                </Typography>
                              );
                            } else if (currentStatus === '대기중') {
                              return (
                                <Typography variant="caption" color="#10b981" textAlign="center" fontWeight={600}>
                                  ⚡ 자동 시작 준비됨
                                </Typography>
                              );
                            } else {
                              return null;
                            }
                          })()}
                        </Box>
                      )}

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
                          onClick={() => {
                            console.log(`🎯 ${store.name} 시작 버튼 클릭`);
                            console.log('🗂️ 전체 userSettings:', userSettings);
                            console.log(`🏪 ${store.name}의 userSettings[${store.id}]:`, userSettings[store.id]);
                            
                            const currentSetting = userSettings[store.id];
                            if (currentSetting) {
                              console.log('✅ 설정 존재함:', {
                                startTime: currentSetting.startTime,
                                startDateTime: currentSetting.startDateTime,
                                visitDate: currentSetting.visitDate,
                                visitTime: currentSetting.visitTime
                              });
                            } else {
                              console.log('❌ 설정이 존재하지 않음');
                            }
                            
                            runSingleAutomation(store, userSettings[store.id], false);
                          }} // 수동 실행 표시
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
