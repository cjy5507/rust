import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Environment Variable Loading\n');

// 임시 테스트 파일 생성
const testFilePath = path.join(__dirname, '..', 'src', 'test-env.tsx');
const testFileContent = `
import React from 'react';

const TestEnv: React.FC = () => {
  console.log('🔍 Environment Test Results:');
  console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  MODE:', import.meta.env.MODE);
  console.log('  DEV:', import.meta.env.DEV);
  console.log('  PROD:', import.meta.env.PROD);
  console.log('  All env variables:', import.meta.env);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h3>Environment Test</h3>
      <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'UNDEFINED'}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>Is Dev:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
      <p><strong>Is Prod:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default TestEnv;
`;

try {
  // 1. 테스트 파일 생성
  fs.writeFileSync(testFilePath, testFileContent);
  console.log('✅ Test component created');

  // 2. Development 빌드 테스트
  console.log('\n🔧 Testing Development Build...');
  try {
    execSync('npm run build:dev', { stdio: 'pipe' });
    console.log('✅ Development build successful');
  } catch (error) {
    console.log('❌ Development build failed:', error.message);
  }

  // 3. Production 빌드 테스트
  console.log('\n🚀 Testing Production Build...');
  try {
    execSync('npm run build:prod', { stdio: 'pipe' });
    console.log('✅ Production build successful');
  } catch (error) {
    console.log('❌ Production build failed:', error.message);
  }

  // 4. 빌드된 파일에서 환경변수 확인
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('\n📦 Build output exists');
    
    // index.html에서 환경변수 확인
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      if (indexContent.includes('bcra.store')) {
        console.log('✅ Production API URL found in build');
      } else {
        console.log('❌ Production API URL NOT found in build');
      }
    }
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
} finally {
  // 5. 테스트 파일 정리
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Test file cleaned up');
  }
}

console.log('\n📝 Next Steps:');
console.log('1. Run: npm run check-env');
console.log('2. Run: npm run dev (check browser console)');
console.log('3. Run: npm run build:prod && npm run start:prod');