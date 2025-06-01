// 환경 변수를 통한 API 베이스 URL 설정
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bcra.store/api/rolex';

// 환경변수 디버깅 정보 출력
console.log('🌐 Environment Debug Info:');
console.log('  API_BASE:', API_BASE);
console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('  MODE:', import.meta.env.MODE);
console.log('  DEV:', import.meta.env.DEV);
console.log('  PROD:', import.meta.env.PROD);
console.log('  All env vars:', import.meta.env);

// Tauri 환경에서는 alert로도 확인
if (typeof window !== 'undefined' && window.__TAURI__) {
  console.log('🔍 Running in Tauri environment');
  console.log(`📡 Will use API: ${API_BASE}`);
}

// 1. 로그인
export async function login(email: string, password: string, clientTime?: string | null) {
  const body: any = { email, password };
  if (clientTime) body.clientTime = clientTime;
  
  console.log('🚀 Login request to:', `${API_BASE}/login`);
  
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { token, email, username, role, expiryDate, carrier }
}

// 2. 매장 목록 조회
export async function fetchStores() {
  console.log('🏪 Fetching stores from:', `${API_BASE}/stores`);
  
  const res = await fetch(`${API_BASE}/stores`, { credentials: 'include' });
  if (!res.ok) throw new Error('매장 목록 조회 실패');
  return res.json(); // [{ id, name, authUrl, reserveUrl }]
}

// 3. 유저별 매장 설정 조회
export async function fetchUserStoreSettings(email: string) {
  console.log('⚙️ Fetching user settings from:', `${API_BASE}/user-store-settings`);
  console.log('📧 요청할 이메일:', email);
  
  const url = `${API_BASE}/user-store-settings?email=${encodeURIComponent(email)}`;
  console.log('🔗 최종 요청 URL:', url);
  
  const res = await fetch(url, { credentials: 'include' });
  console.log('📡 응답 상태:', res.status, res.statusText);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ API 오류:', errorText);
    throw new Error('유저별 매장 설정 조회 실패: ' + errorText);
  }
  
  const data = await res.json();
  console.log('✅ API 응답 데이터:', data);
  // data: { carrier, settings }
  return data;
}

// 4. 유저별 매장 설정 저장/수정
export async function saveUserStoreSetting(setting: any) {
  console.log('💾 Saving user settings to:', `${API_BASE}/user-store-settings`);
  console.log('📤 저장할 설정 데이터:', setting);
  
  const requestBody = JSON.stringify(setting);
  console.log('📦 요청 본문:', requestBody);
  
  const res = await fetch(`${API_BASE}/user-store-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody,
    credentials: 'include',
  });
  
  console.log('📡 저장 응답 상태:', res.status, res.statusText);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ 저장 API 오류:', errorText);
    throw new Error('유저별 매장 설정 저장 실패: ' + errorText);
  }
  
  const result = await res.json();
  console.log('✅ 저장 API 응답:', result);
  return result;
}