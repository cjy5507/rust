import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from 'path';

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 환경 변수 로드
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔧 Build mode:', mode);
  console.log('🌐 API Base URL:', env.VITE_API_BASE_URL || 'default');

  return {
    plugins: [react()],
    
    // 경로 alias 설정
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './api'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@components': path.resolve(__dirname, './src/components'),
      },
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1421,  // 포트 변경
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: "ws",
            host,
            port: 1422,  // HMR 포트도 변경
          }
        : undefined,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
    
    // 환경 변수 설정
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || 'http://bcra.store/api/rolex'),
    },
    
    // 빌드 설정
    build: {
      // 프로덕션 빌드에서 console.log 제거하지 않음 (디버깅을 위해)
      minify: mode === 'production' ? 'esbuild' : false,
      sourcemap: mode !== 'production',
    },
  };
});
