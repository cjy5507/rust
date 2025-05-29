# 🔧 Tauri App 빌드 가이드

## 환경 설정

### 개발 환경 (Development)
```bash
# 개발 서버 실행 (localhost API 사용)
npm run dev
# 또는
npm run tauri:dev
```

### 프로덕션 빌드 (Production)
```bash
# 1단계: 웹 앱 프로덕션 빌드
npm run build:prod

# 2단계: Tauri 앱 빌드 (실행 파일 생성)
npm run tauri:build
```

## 올바른 빌드 순서

### 🚀 권장 빌드 프로세스
```bash
# 1. 프로덕션 환경으로 웹 앱 빌드
npm run build:prod

# 2. Tauri 앱 빌드 (위에서 생성된 dist 폴더 사용)
npm run tauri:build

# 결과: src-tauri/target/release/ 에 실행 파일 생성
```

## API 엔드포인트 설정

### 환경별 설정 파일

1. **개발 환경**: `.env.development`
   ```
   VITE_API_BASE_URL=http://localhost/api/rolex
   ```

2. **프로덕션 환경**: `.env.production`
   ```
   VITE_API_BASE_URL=http://bcra.store/api/rolex
   ```

3. **기본 설정**: `.env`
   ```
   VITE_TEST_MODE=true
   VITE_API_BASE_URL=http://bcra.store/api/rolex
   ```

## 빌드 확인 방법

### 1. 브라우저 콘솔 확인
앱 실행 후 개발자 도구 콘솔에서 다음 정보를 확인:
```
🚀 App Environment Info:
- Mode: production
- DEV: false
- PROD: true
- API Base URL: http://bcra.store/api/rolex
```

### 2. API 요청 확인
로그인이나 데이터 요청 시 콘솔에서 다음과 같은 로그 확인:
```
🌐 API Base URL: http://bcra.store/api/rolex
🚀 Login request to: http://bcra.store/api/rolex/login
🏪 Fetching stores from: http://bcra.store/api/rolex/stores
```

## 실행 파일 위치

### 빌드 결과물
- **웹 빌드**: `dist/` 폴더
- **Windows**: `src-tauri/target/release/ROLEX Automation.exe`
- **macOS**: `src-tauri/target/release/ROLEX Automation.app`
- **Linux**: `src-tauri/target/release/rolex-automation`

## 문제 해결

### ❌ 흔한 오류들

1. **API URL이 localhost를 가리키는 경우**
   ```bash
   # 해결: 올바른 순서로 빌드
   npm run build:prod  # 먼저 프로덕션 웹 빌드
   npm run tauri:build # 그 다음 Tauri 빌드
   ```

2. **tauri build 오류**
   ```bash
   # 기본 명령어 사용
   npm run tauri:build
   
   # 또는 직접 실행
   npx tauri build
   ```

### ✅ 정상 빌드 확인

1. 빌드 완료 후 실행 파일 실행
2. F12 → Console 탭에서 환경 정보 확인
3. 로그인 시도하여 API 요청 URL 확인

## 배포 시 주의사항

1. **CORS 설정**: 서버에서 도메인 허용 확인
2. **방화벽**: `http://bcra.store` 접근 가능한지 확인  
3. **실행 권한**: Windows에서 실행 시 보안 경고 가능

## 디버깅 팁

### 환경 변수 디버깅
```bash
# 현재 환경 확인
npm run build:prod -- --debug

# Tauri 상세 로그
npm run tauri:build -- --verbose
```

### 네트워크 요청 확인
1. F12 → Network 탭
2. 로그인 시도
3. 요청 URL이 `bcra.store`인지 확인
