import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Environment Variables Check\n');

// 1. Node.js 환경변수 확인
console.log('📦 Node.js Environment:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('  Current working directory:', process.cwd());
console.log('');

// 2. .env 파일들 확인
const envFiles = [
  '.env',
  '.env.local', 
  '.env.development',
  '.env.production'
];

console.log('📄 Environment Files:');
envFiles.forEach(envFile => {
  const filePath = path.join(__dirname, '..', envFile);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${envFile}:`);
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        console.log(`    ${line}`);
      }
    });
  } else {
    console.log(`❌ ${envFile}: Not found`);
  }
});

console.log('');

// 3. Vite 설정 확인
const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
  console.log('⚙️ Vite config exists: ✅');
} else {
  console.log('⚙️ Vite config: ❌ Not found');
}

// 4. 빌드 테스트를 위한 간단한 Vite 명령어 제안
console.log('');
console.log('🚀 To test environment loading:');
console.log('  Development: npm run dev');
console.log('  Production build: npm run build:prod');
console.log('  Check in browser console after running the app');

// 5. package.json 스크립트 확인
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('');
  console.log('📜 Available Scripts:');
  Object.entries(packageJson.scripts).forEach(([name, script]) => {
    if (name.includes('dev') || name.includes('build') || name.includes('prod')) {
      console.log(`  ${name}: ${script}`);
    }
  });
}