import React from 'react';

const EnvironmentInfo: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const mode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;
  const isProd = import.meta.env.PROD;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999 
    }}>
      <div>🌐 API: {apiBaseUrl}</div>
      <div>🔧 Mode: {mode}</div>
      <div>📦 Dev: {isDev ? 'Yes' : 'No'}</div>
      <div>🚀 Prod: {isProd ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default EnvironmentInfo;