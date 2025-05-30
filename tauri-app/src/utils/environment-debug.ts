// 환경변수 디버깅 유틸리티
export const debugEnvironment = () => {
  console.log('🔍 Environment Debug Information:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  MODE:', import.meta.env.MODE);
  console.log('  DEV:', import.meta.env.DEV);
  console.log('  PROD:', import.meta.env.PROD);
  console.log('  VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  All env vars:', import.meta.env);
  
  // Window에 디버그 정보 저장
  if (typeof window !== 'undefined') {
    (window as any).__ENV_DEBUG__ = {
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      ALL_ENV: import.meta.env
    };
    
    console.log('🌐 Environment info saved to window.__ENV_DEBUG__');
  }
};

// 실제 API 호출 감지
export const interceptApiCalls = () => {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      
      console.log('🔥 API Call Intercepted:', {
        url,
        method: config?.method || 'GET',
        timestamp: new Date().toISOString()
      });
      
      if (url.includes('rolex')) {
        console.log('🎯 Rolex API call detected:', url);
      }
      
      return originalFetch.apply(window, args);
    };
    
    console.log('📡 API call interceptor installed');
  }
};