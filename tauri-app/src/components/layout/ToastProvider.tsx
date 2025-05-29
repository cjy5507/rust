import { Toaster } from 'react-hot-toast';
import React from 'react';

interface IToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<IToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          // 스타일 커스터마이징
          style: {
            background: 'rgba(24,26,32,0.98)',
            color: '#FFD700',
            border: '1px solid #FFD700',
            fontWeight: 'bold',
          },
          // 성공 토스트 스타일
          success: {
            iconTheme: {
              primary: '#FFD700',
              secondary: '#181A20',
            },
          },
          // 에러 토스트 스타일
          error: {
            iconTheme: {
              primary: '#ff4b4b',
              secondary: '#181A20',
            },
          },
          // 토스트 지속 시간
          duration: 3000,
        }}
      />
    </>
  );
};

export default ToastProvider;
