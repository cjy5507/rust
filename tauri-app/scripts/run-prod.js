const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build and run...');

// 1. 프로덕션 빌드
console.log('📦 Building for production...');
execSync('npm run build:prod', { stdio: 'inherit' });

// 2. Tauri 설정을 프로덕션 모드로 임시 변경
const configPath = path.join(__dirname, '../src-tauri/tauri.conf.json');
const originalConfig = fs.readFileSync(configPath, 'utf8');

const prodConfig = {
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "ROLEX Automation",
  "version": "0.1.0",
  "identifier": "com.tauri.rolex-automation",
  "build": {
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "ROLEX 자동화 시스템",
        "width": 1200,
        "height": 800,
        "minWidth": 1000,
        "minHeight": 700,
        "center": true,
        "resizable": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
};

// 설정 파일 임시 변경
fs.writeFileSync(configPath, JSON.stringify(prodConfig, null, 2));

console.log('⚙️ Running Tauri in production mode...');

try {
  // 3. Tauri 실행
  execSync('tauri dev', { stdio: 'inherit' });
} catch (error) {
  console.error('Error running Tauri:', error);
} finally {
  // 4. 원본 설정 복원
  console.log('🔄 Restoring original config...');
  fs.writeFileSync(configPath, originalConfig);
}
