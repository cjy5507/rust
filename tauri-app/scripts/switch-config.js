const fs = require('fs');
const path = require('path');

const mode = process.argv[2]; // 'dev' or 'prod'
const configPath = path.join(__dirname, '../src-tauri/tauri.conf.json');

// 개발 모드 설정
const devConfig = {
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "ROLEX Automation",
  "version": "0.1.0",
  "identifier": "com.tauri.rolex-automation",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1421",
    "beforeBuildCommand": "npm run build:prod",
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

// 프로덕션 모드 설정
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

const config = mode === 'prod' ? prodConfig : devConfig;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`✅ Tauri config switched to ${mode} mode`);
