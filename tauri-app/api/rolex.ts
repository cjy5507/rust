const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost/api/rolex'
    : 'http://bcra.store/api/rolex';

// 1. 로그인
export async function login(email: string, password: string, clientTime?: string) {
  const body: any = { email, password };
  if (clientTime) body.clientTime = clientTime;
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
  const res = await fetch(`${API_BASE}/stores`, { credentials: 'include' });
  if (!res.ok) throw new Error('매장 목록 조회 실패');
  return res.json(); // [{ id, name, authUrl, reserveUrl }]
}

// 3. 유저별 매장 설정 조회
export async function fetchUserStoreSettings(email: string) {
  const res = await fetch(`${API_BASE}/user-store-settings?email=${encodeURIComponent(email)}`, { credentials: 'include' });
  if (!res.ok) throw new Error('유저별 매장 설정 조회 실패');
  const data = await res.json();
  // data: { carrier, settings }
  return data;
}

// 4. 유저별 매장 설정 저장/수정
export async function saveUserStoreSetting(setting: any) {
  const res = await fetch(`${API_BASE}/user-store-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setting),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('유저별 매장 설정 저장 실패');
  return res.json();
} 