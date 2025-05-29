// 환경 변수를 통한 API 베이스 URL 설정
//const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://bcra.store/api/rolex';
const API_BASE = 'http://bcra.store/api/rolex'
console.log('🌐 API Base URL:', API_BASE);
console.log('🔧 Environment:', import.meta.env.MODE);

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
  
  const res = await fetch(`${API_BASE}/user-store-settings?email=${encodeURIComponent(email)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('유저별 매장 설정 조회 실패');
  const data = await res.json();
  // data: { carrier, settings }
  return data;
}

// 4. 유저별 매장 설정 저장/수정
export async function saveUserStoreSetting(setting: any) {
  console.log('💾 Saving user settings to:', `${API_BASE}/user-store-settings`);
  
  const res = await fetch(`${API_BASE}/user-store-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setting),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('유저별 매장 설정 저장 실패');
  return res.json();
}