Write-Host "🚀 Starting ROLEX Automation in Production Mode" -ForegroundColor Green

# 1. 프로덕션 빌드
Write-Host "📦 Building for production..." -ForegroundColor Yellow
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# 2. Tauri 설정을 프로덕션 모드로 임시 변경
$configPath = "src-tauri/tauri.conf.json"
$backupPath = "src-tauri/tauri.conf.json.backup"

# 원본 설정 백업
Copy-Item $configPath $backupPath

# 프로덕션 설정 적용
$prodConfig = @"
{
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
}
"@

$prodConfig | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "⚙️ Running Tauri in production mode..." -ForegroundColor Yellow

try {
    # 3. Tauri 실행
    tauri dev
} finally {
    # 4. 원본 설정 복원
    Write-Host "🔄 Restoring original config..." -ForegroundColor Cyan
    Move-Item $backupPath $configPath -Force
}

Write-Host "✅ Done!" -ForegroundColor Green
