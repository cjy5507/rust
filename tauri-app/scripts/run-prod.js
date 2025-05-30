import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting production build and run...');
console.log('📍 Working directory:', process.cwd());

// 환경 변수 설정
process.env.NODE_ENV = 'production';

console.log('🔧 Environment variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL || 'from .env.production');

try {
  // 1. 프로덕션 빌드
  console.log('\n📦 Building for production...');
  execSync('npm run build:prod', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // 2. 빌드 결과 확인
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Build successful! Dist folder created.');
  } else {
    throw new Error('❌ Build failed! Dist folder not found.');
  }

  // 3. Tauri 빌드 및 실행
  console.log('\n⚙️ Building and running Tauri application...');
  
  // 디버그 빌드로 빠르게 테스트
  execSync('tauri build --debug', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '../'),
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // 4. 실행 파일 경로 확인 및 실행
  const executablePath = path.join(__dirname, '../src-tauri/target/debug/tauri-app');
  
  if (fs.existsSync(executablePath)) {
    console.log('\n🎉 Starting application...');
    console.log('📂 Executable path:', executablePath);
    
    // 새 프로세스로 애플리케이션 실행
    const child = spawn(executablePath, [], {
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    console.log('✅ Application started successfully!');
    process.exit(0);
  } else {
    throw new Error(`❌ Executable not found at: ${executablePath}`);
  }

} catch (error) {
  console.error('\n❌ Error during production build:', error.message);
  console.error('\n🔍 Troubleshooting steps:');
  console.error('  1. Check if all dependencies are installed: npm install');
  console.error('  2. Verify environment variables in .env.production');
  console.error('  3. Check Tauri configuration in src-tauri/tauri.conf.json');
  console.error('  4. Ensure Rust and Tauri CLI are properly installed');
  process.exit(1);
}