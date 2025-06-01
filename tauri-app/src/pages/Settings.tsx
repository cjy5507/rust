import { 
  Card, CardContent, Typography, TextField, Button, Stack, Box, Select, MenuItem, 
  InputLabel, FormControl, CircularProgress, Paper, Chip, ButtonGroup,
  ToggleButton, ToggleButtonGroup, Slider, Alert, Divider
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker, LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko'; // 한국어 로케일 추가
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { fetchStores, fetchUserStoreSettings, saveUserStoreSetting } from '../../api/rolex';

// dayjs 플러그인 설정
dayjs.extend(customParseFormat);
dayjs.locale('ko'); // 한국어 로케일 설정

console.log('📅 dayjs 설정 완료:', {
  locale: dayjs.locale(),
  now: dayjs().format('YYYY-MM-DD HH:mm:ss')
});

// 안전한 날짜/시간 변환 함수
const safeFormatDateTime = (dayjsObj: any): string => {
  console.log('🔄 safeFormatDateTime 시작:', dayjsObj);
  
  // 1차: dayjs 객체 유효성 검사
  if (!dayjsObj || !dayjsObj.isValid || !dayjsObj.isValid()) {
    console.log('❌ dayjs 객체가 유효하지 않음');
    const fallback = dayjs().add(1, 'day').hour(10).minute(0).second(0);
    const result = fallback.format('YYYY-MM-DD HH:mm');
    console.log('📅 기본값 반환:', result);
    return result;
  }
  
  // 2차: dayjs로 변환 시도
  try {
    const dayjsResult = dayjsObj.format('YYYY-MM-DD HH:mm');
    console.log('✅ dayjs 변환 성공:', dayjsResult);
    
    // 변환 결과 검증 (0000-00-00 같은 잘못된 값 체크)
    if (dayjsResult.includes('0000-00-00') || dayjsResult.includes('Invalid')) {
      throw new Error('유효하지 않은 날짜 형식');
    }
    
    return dayjsResult;
  } catch (e) {
    console.log('❌ dayjs 변환 실패:', e);
  }
  
  // 3차: 네이티브 Date 객체로 변환 시도
  try {
    let dateObj: Date;
    
    if (dayjsObj._d) {
      // dayjs 객체에서 내부 Date 추출
      dateObj = new Date(dayjsObj._d);
    } else {
      // dayjs 객체를 Date로 변환
      dateObj = dayjsObj.toDate();
    }
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('유효하지 않은 Date 객체');
    }
    
    // 한국 시간대로 변환
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hour = String(dateObj.getHours()).padStart(2, '0');
    const minute = String(dateObj.getMinutes()).padStart(2, '0');
    
    const nativeResult = `${year}-${month}-${day} ${hour}:${minute}`;
    console.log('✅ 네이티브 Date 변환 성공:', nativeResult);
    
    return nativeResult;
  } catch (e) {
    console.log('❌ 네이티브 Date 변환 실패:', e);
  }
  
  // 4차: 최후의 기본값
  console.log('❌ 모든 변환 실패, 기본값 사용');
  const fallback = dayjs().add(1, 'day').hour(10).minute(0).second(0);
  const result = fallback.format('YYYY-MM-DD HH:mm');
  console.log('📅 최종 기본값:', result);
  return result;
};

const DEFAULT_START_TIME = '10:00';
const DEFAULT_VISIT_DATE = dayjs().add(1, 'day');
const DEFAULT_VISIT_TIME = '10:00';

// 기본 자동화 시작 시간 (내일 오전 10시)
const DEFAULT_START_DATETIME = () => dayjs().add(1, 'day').hour(10).minute(0).second(0);

console.log('📅 기본값 설정:', {
  DEFAULT_START_TIME,
  DEFAULT_VISIT_DATE: DEFAULT_VISIT_DATE.format('YYYY-MM-DD'),
  DEFAULT_VISIT_TIME,
  DEFAULT_START_DATETIME: DEFAULT_START_DATETIME().format('YYYY-MM-DD HH:mm:ss')
});

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
const AUTO_TIME_OPTIONS = generateTimeOptions(1);

// 시간 파싱을 위한 안전한 함수
const parseDateTime = (timeString: string, fallbackDate?: dayjs.Dayjs): dayjs.Dayjs => {
  console.log('🔍 parseDateTime 입력:', timeString);
  
  if (!timeString || timeString === '00:00:00' || timeString === '00:00' || timeString === '0000-00-00 00:00:00') {
    console.log('❌ 빈 값 또는 잘못된 값, 기본값 사용');
    const fallback = fallbackDate || dayjs().add(1, 'day').hour(10).minute(0).second(0);
    console.log('📅 기본값 반환:', fallback.format('YYYY-MM-DD HH:mm:ss'));
    return fallback;
  }

  // DB 형식 1순위: "YYYY-MM-DD HH:mm" (초 없음, 공백 구분) 
  if (timeString.includes(' ') && timeString.length === 16) {
    const parsed = dayjs(timeString, 'YYYY-MM-DD HH:mm');
    if (parsed.isValid()) {
      console.log('✅ DB 형식 파싱 성공 (분까지):', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
      return parsed;
    }
  }

  // DB 형식 2순위: "YYYY-MM-DD HH:mm:ss" (초 포함, 공백 구분)
  if (timeString.includes(' ') && timeString.length === 19) {
    const parsed = dayjs(timeString, 'YYYY-MM-DD HH:mm:ss');
    if (parsed.isValid()) {
      console.log('✅ DB 형식 파싱 성공 (초까지):', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
      return parsed;
    }
  }

  // ISO 형식이면 직접 파싱
  if (timeString.includes('T')) {
    const parsed = dayjs(timeString);
    if (parsed.isValid()) {
      console.log('✅ ISO 형식 파싱 성공:', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
      return parsed;
    }
  }

  // 시간만 있는 경우 (HH:mm:ss 또는 HH:mm)
  if (timeString.includes(':') && !timeString.includes(' ') && !timeString.includes('T')) {
    const today = dayjs().format('YYYY-MM-DD');
    const timeOnly = timeString.length > 5 ? timeString.substring(0, 5) : timeString;
    const combined = `${today}T${timeOnly}:00`;
    const parsed = dayjs(combined);
    if (parsed.isValid()) {
      console.log('✅ 시간만 파싱 성공:', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
      return parsed;
    }
  }

  // 네이티브 Date 객체로 시도
  try {
    const nativeDate = new Date(timeString);
    if (!isNaN(nativeDate.getTime())) {
      const parsed = dayjs(nativeDate);
      if (parsed.isValid()) {
        console.log('✅ 네이티브 Date 파싱 성공:', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
        return parsed;
      }
    }
  } catch (e) {
    console.log('❌ 네이티브 Date 파싱 실패:', e);
  }

  // 마지막 시도: dayjs에게 자동 파싱 맡기기
  const parsed = dayjs(timeString);
  if (parsed.isValid()) {
    console.log('✅ 자동 파싱 성공:', timeString, '→', parsed.format('YYYY-MM-DD HH:mm:ss'));
    return parsed;
  }

  // 모든 파싱이 실패하면 기본값 반환
  console.warn('⚠️ 시간 파싱 실패:', timeString, '기본값 사용');
  const fallback = fallbackDate || dayjs().add(1, 'day').hour(10).minute(0).second(0);
  console.log('📅 최종 기본값:', fallback.format('YYYY-MM-DD HH:mm:ss'));
  return fallback;
};

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
  
  console.log('📧 Settings에서 로드한 이메일:', email);
  console.log('📧 localStorage 확인:', typeof window !== 'undefined' ? localStorage : 'window 없음');

  useEffect(() => {
    console.log('🚀 Settings useEffect 시작');
    console.log('📧 현재 이메일:', email);
    console.log('📧 이메일 존재 여부:', !!email);
    
    if (!email) {
      console.log('❌ 이메일이 없어서 데이터 로드하지 않음');
      return;
    }
    
    console.log('✅ 이메일 존재, 데이터 로드 시작');
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
          
          console.log('🏪 Settings에서 서버 데이터 처리:', {
            storeId: storeId,
            원본_startTime: s.startTime,
            원본_startDateTime: s.startDateTime,
            원본_visitDate: s.visitDate,
            원본_visitTime: s.visitTime
          });
          
          // 시간 파싱 개선 - 더 안전한 방식으로 처리
          let startDateTime = null;
          
          // startTime 처리 (서버에서 받는 주 데이터)
          if (s.startTime) {
            console.log('✅ startTime 필드 발견:', s.startTime);
            startDateTime = parseDateTime(s.startTime);
            console.log('변환된 startDateTime:', startDateTime.format());
          }
          
          // startDateTime 직접 처리 (호환성)
          if (!startDateTime && s.startDateTime) {
            console.log('✅ startDateTime 필드 발견 (호환성):', s.startDateTime);
            startDateTime = parseDateTime(s.startDateTime);
            console.log('변환된 startDateTime (호환성):', startDateTime.format());
          }
          
          // visitDate + visitTime 조합으로 생성
          if (!startDateTime && s.visitDate && s.visitTime) {
            console.log('✅ visitDate + visitTime 조합 시도:', s.visitDate, s.visitTime);
            const visitTimeClean = s.visitTime.substring(0, 5); // HH:mm 형태로 정리
            const combinedDateTime = `${s.visitDate}T${visitTimeClean}:00`;
            startDateTime = parseDateTime(combinedDateTime);
            console.log('변환된 startDateTime (조합):', startDateTime.format());
          }
          
          // 기본값 설정 (모든 시도가 실패했거나 유효하지 않은 경우)
          if (!startDateTime || !startDateTime.isValid()) {
            console.log('❌ 모든 시도 실패, 기본값 사용');
            startDateTime = dayjs().add(1, 'day').hour(10).minute(0).second(0);
          }
          
          const cleanVisitTime = s.visitTime ? s.visitTime.substring(0, 5) : DEFAULT_VISIT_TIME;
          const finalSetting = {
            startDateTime,
            visitDate: s.visitDate ? dayjs(s.visitDate) : DEFAULT_VISIT_DATE,
            visitTime: cleanVisitTime,
          };
          
          console.log('📋 최종 설정:', {
            storeId: storeId,
            startDateTime: finalSetting.startDateTime.format(),
            visitDate: finalSetting.visitDate.format('YYYY-MM-DD'),
            visitTime: finalSetting.visitTime
          });
          
          settingsObj[storeId] = finalSetting;
        });
        
        setStoreSettings(settingsObj);
        setCarrier(userSettingsResp.carrier || 'SKT');
        setMessage(userSettingsResp.message || '문의드립니다');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [email]);

  const getStoreSetting = (id: string) => {
    const setting = storeSettings[id];
    console.log(`📖 ${id} 설정 조회:`, setting);
    
    if (!setting) {
      const defaultSetting = {
        startDateTime: DEFAULT_START_DATETIME(),
        visitDate: DEFAULT_VISIT_DATE,
        visitTime: DEFAULT_VISIT_TIME,
      };
      console.log(`📝 ${id} 기본 설정 반환:`, defaultSetting);
      return defaultSetting;
    }
    
    // startDateTime이 유효하지 않은 경우 기본값으로 설정
    if (!setting.startDateTime || !setting.startDateTime.isValid()) {
      console.log(`❌ ${id} startDateTime 유효하지 않음, 기본값 설정`);
      setting.startDateTime = DEFAULT_START_DATETIME();
      console.log(`📅 ${id} 기본값 설정:`, setting.startDateTime.format('YYYY-MM-DD HH:mm:ss'));
    }
    
    console.log(`✅ ${id} 최종 설정:`, {
      startDateTime: setting.startDateTime.format('YYYY-MM-DD HH:mm:ss'),
      visitDate: setting.visitDate.format('YYYY-MM-DD'),
      visitTime: setting.visitTime
    });
    
    return setting;
  };

  const handleStoreChange = (id: string, key: string, value: any) => {
    console.log(`🔄 ${id} 설정 변경:`, { key, value });
    console.log('value 타입:', typeof value);
    console.log('value 유효성:', value && value.isValid ? value.isValid() : 'dayjs 아님');
    
    if (key === 'startDateTime') {
      // startDateTime 변경 시 추가 검증
      if (!value || (value.isValid && !value.isValid())) {
        console.log('❌ 유효하지 않은 startDateTime, 기본값 사용');
        const defaultTime = dayjs().add(1, 'day').hour(10).minute(0).second(0);
        value = defaultTime;
        console.log('📅 기본값 설정:', value.format('YYYY-MM-DD HH:mm:ss'));
      }
    }
    
    setStoreSettings((prev: any) => {
      const currentSetting = getStoreSetting(id);
      const newSetting = { ...currentSetting, [key]: value };
      console.log(`📝 ${id} 최종 설정:`, newSetting);
      
      return {
        ...prev,
        [id]: newSetting,
      };
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      console.log('💾 저장 시작...');
      console.log('현재 storeList:', storeList);
      console.log('현재 storeSettings:', storeSettings);
      
      const settingsArr = storeList.map(store => {
        const setting = getStoreSetting(store.id);
        console.log(`🏪 ${store.name} 설정 준비:`, {
          storeId: store.id,
          원본_setting: setting,
          startDateTime_format: setting.startDateTime ? setting.startDateTime.format('YYYY-MM-DD HH:mm') : 'null'
        });
        
        const finalSetting = {
          email,
          storeId: store.id,
          // 안전한 변환 함수 사용
          startTime: safeFormatDateTime(setting.startDateTime),
          visitDate: setting.visitDate.format('YYYY-MM-DD'),
          visitTime: setting.visitTime,
          carrier,
          message,
        };
        
        console.log(`📤 ${store.name} 서버 전송 데이터:`, finalSetting);
        return finalSetting;
      });
      
      console.log('📡 전체 서버 전송 데이터:', settingsArr);
      
      const responses = await Promise.all(settingsArr.map(setting => {
        console.log('🚀 API 호출:', setting);
        return saveUserStoreSetting(setting);
      }));
      
      console.log('✅ 서버 응답:', responses);
      
      if (responses[0]?.carrier) setCarrier(responses[0].carrier);
      setToastMsg('설정이 저장되었습니다!');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (e: any) {
      console.error('❌ 저장 실패:', e);
      let msg = e?.message;
      if (e?.response) {
        try {
          msg = await e.response.text();
        } catch {}
      }
      console.error('에러 메시지:', msg);
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
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
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
                            onChange={date => {
                              console.log(`🕐 ${store.name} 시간 변경:`, date);
                              console.log('변경된 시간 타입:', typeof date);
                              console.log('변경된 시간 유효성:', date ? date.isValid() : 'null');
                              
                              // null 값이 오면 기본값으로 처리
                              if (!date) {
                                console.log('❌ null 값 받음, 기본값 설정');
                                const defaultDate = dayjs().add(1, 'day').hour(10).minute(0).second(0);
                                console.log('📅 기본값:', defaultDate.format('YYYY-MM-DD HH:mm:ss'));
                                handleStoreChange(store.id, 'startDateTime', defaultDate);
                                return;
                              }
                              
                              // 유효하지 않은 값이면 기본값 처리
                              if (!date.isValid()) {
                                console.log('❌ 유효하지 않은 값, 기본값 설정');
                                const defaultDate = dayjs().add(1, 'day').hour(10).minute(0).second(0);
                                console.log('📅 기본값:', defaultDate.format('YYYY-MM-DD HH:mm:ss'));
                                handleStoreChange(store.id, 'startDateTime', defaultDate);
                                return;
                              }
                              
                              // 유효한 값인 경우 그대로 저장
                              console.log('✅ 유효한 값, 저장:', date.format('YYYY-MM-DD HH:mm:ss'));
                              handleStoreChange(store.id, 'startDateTime', date);
                            }}
                            format="YYYY-MM-DD HH:mm"
                            ampm={false}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                sx: { 
                                  '& .MuiOutlinedInput-root': { 
                                    borderRadius: 1.5,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#30363d'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#c9b037'
                                    },
                                  }
                                }
                              },
                              actionBar: {
                                actions: ['clear', 'today', 'accept']
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
                            onChange={date => {
                              const newDate = date || DEFAULT_VISIT_DATE;
                              handleStoreChange(store.id, 'visitDate', newDate);
                            }}
                            format="YYYY-MM-DD"
                            slotProps={{ 
                              textField: { 
                                fullWidth: true,
                                sx: { 
                                  '& .MuiOutlinedInput-root': { 
                                    borderRadius: 1.5,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#30363d'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#c9b037'
                                    },
                                  } 
                                }
                              },
                              actionBar: {
                                actions: ['clear', 'today', 'accept']
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