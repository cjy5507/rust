# 🚀 Tauri 롤렉스 자동화 앱

## 📋 필수 요구사항 (사용자용)

**사용자는 다음만 설치하면 됩니다:**
- ✅ **Node.js** (v16 이상) - https://nodejs.org/

## 🎯 사용 방법

### 1. 앱 실행
```bash
# 개발 모드 (개발자용)
npm run tauri:dev

# 배포용 실행 파일 빌드 (개발자용)
npm run tauri:build
```

### 2. 최초 설정 (앱에서)
1. **"환경 설정"** 버튼 클릭 → Playwright 브라우저 자동 설치
2. 완료 메시지 확인

### 3. 자동화 실행
1. **매장 선택**: 체크박스로 원하는 매장들 선택
2. **개별 실행**: 각 매장의 "시작" 버튼 클릭
3. **일괄 실행**: "선택된 매장 자동화 시작" 버튼 클릭

### 4. 자동화 진행
1. 🌐 **브라우저 자동 실행** (headless: false)
2. 🔐 **인증 페이지 자동 접속**
3. ⏱️ **30초 대기** (사용자가 수동 인증 완료)
4. 📝 **예약 페이지 자동 진행**
5. ✅ **완료 후 5분 뒤 브라우저 자동 종료**

## 🏗️ 개발자 정보

### 프로젝트 구조
```
tauri-app/
├── src/                     # React 프론트엔드
├── src-tauri/               # Rust 백엔드
├── automation/              # Node.js 자동화 스크립트
│   ├── rolex-automation.js  # Playwright 자동화
│   └── package.json         # Node.js 의존성
└── package.json             # 프론트엔드 의존성
```

### 주요 기능
- 🎯 **백엔드 데이터 기반**: API에서 받은 매장 정보로 동적 실행
- 🔄 **개별/일괄 실행**: 선택된 매장들을 개별 또는 동시 실행
- 🚫 **headless: false**: 브라우저 창 표시로 사용자 개입 가능
- ⚡ **Tauri 통합**: Rust 백엔드에서 Node.js 스크립트 실행
- 📦 **단일 배포**: exe 파일 하나로 배포 가능

### 기술 스택
- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Rust + Tauri
- **Automation**: Node.js + Playwright
- **Build**: Vite + Tauri CLI

## ⚠️ 주의사항

1. **Node.js 필수**: 사용자 PC에 Node.js가 설치되어 있어야 함
2. **automation 폴더**: Tauri 앱과 같은 위치에 automation 폴더 필요
3. **인증 개입**: 30초 동안 사용자가 수동으로 인증 처리 필요
4. **포트 충돌**: 여러 브라우저 동시 실행 시 잠시 대기 시간 있음

## 🐛 트러블슈팅

### "automation 디렉터리를 찾을 수 없습니다"
- automation 폴더가 실행 파일과 같은 위치에 있는지 확인
- Node.js가 설치되어 있는지 확인

### "npm 실행 실패"
- automation 폴더에서 `npm install` 실행
- automation 폴더 권한 확인

### "playwright install 실패"
- 인터넷 연결 확인
- 방화벽 설정 확인
- `npx playwright install chromium` 수동 실행

## 📦 배포 가이드

```bash
# 1. 의존성 설치
npm install

# 2. automation 폴더 의존성 설치
cd automation && npm install && cd ..

# 3. 배포용 빌드
npm run tauri:build

# 4. 결과물: src-tauri/target/release/tauri-app.exe
```

배포 시 automation 폴더도 함께 복사해야 합니다.