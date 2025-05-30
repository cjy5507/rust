export interface IStoreSettings {
  id?: string;
  store: string;
  startTime: string;  // 자동화 시작 시간 (예: "10:00")
  visitDate: string;  // 방문 날짜 (예: "2025-05-30")
  visitTime: string;  // 방문 시간 (예: "14:00")
}

export interface IUserStoreSetting {
  email: string;
  password?: string;
  carrier: string;
  storeSettings: IStoreSettings[];
}

export interface IStoreConfig {
  storeName: string;
  authUrl: string;
  reserveUrl: string;
  startTime?: string;  // 자동화 시작 시간 (선택적)
  visitDate?: string;  // 방문 날짜 (선택적)
  visitTime?: string;  // 방문 시간 (선택적)
  carrier: string;     // 통신사 (SKT, KT, LGU+)
  email: string;       // 이메일
}

export interface IAutomationResult {
  success: boolean;
  message: string;
  timestamp: string;
  store_name: string;
}

export interface IAutomationStatus {
  storeId: string;
  storeName: string;
  status: '대기중' | '실행중' | '진행중' | '성공' | '실패';
  startTime?: string;
  message?: string;
  timestamp?: string;
}

// Rust에서 사용되는 AutomationConfig 타입과 매칭
export interface IAutomationConfig {
  store_name: string;
  start_time?: string;
  visit_date?: string;
  visit_time?: string;
  carrier: string;
  email: string;
}