import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './MainLayout.css';

const menu = [
  { label: "대시보드", path: "/dashboard" },
  { label: "예약", path: "/reservation" },
  { label: "설정", path: "/settings" },
];

const fontFamily = 'Pretendard, Noto Sans KR, Montserrat, Inter, sans-serif';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout?: () => void;
}

export default function MainLayout({ children, onLogout }: MainLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [clock, setClock] = useState<string>("");

  useEffect(() => {
    let baseTime: Date;
    const naverTimeStr = localStorage.getItem('naverTime');
    if (naverTimeStr && naverTimeStr.trim() !== '') {
      baseTime = new Date(naverTimeStr);
    } else {
      baseTime = new Date();
    }
    let current = baseTime.getTime();
    setClock(new Date(current).toLocaleString('ko-KR', { hour12: false }));
    const timer = setInterval(() => {
      current += 1000;
      setClock(new Date(current).toLocaleString('ko-KR', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#101315', fontFamily }}>
      {/* 상단 AppBar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: '#101315', borderBottom: '2px solid #FFD700', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.18)', position: 'fixed', width: '100%', zIndex: 100 }}>
        <button aria-label="메뉴" style={{ background: 'none', border: 'none', color: '#FFD700', fontSize: 28 }} onClick={() => setDrawerOpen(true)}>
          ☰
        </button>
        <span className="appbar-title">
          ROLEX 예약 시스템
        </span>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#FFD700', fontWeight: 700, marginRight: 24, fontSize: 18 }}>{clock}</span>
          <button type="button" className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </div>
      {/* Drawer 메뉴 */}
      {drawerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: 320, height: '100vh', background: '#181A20', color: '#f5f5f5', borderRight: '2px solid #FFD700', zIndex: 200, padding: 24 }}>
          <div style={{ fontWeight: 900, color: '#FFD700', fontSize: 24, marginBottom: 16 }}>메뉴</div>
          <div style={{ borderBottom: '2px solid #FFD700', marginBottom: 16 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {menu.map(item => (
              <button
                key={item.path}
                style={{
                  background: location.pathname === item.path ? '#FFD700' : 'transparent',
                  color: location.pathname === item.path ? '#181A20' : '#f5f5f5',
                  fontWeight: location.pathname === item.path ? 900 : 700,
                  fontSize: 18,
                  borderRadius: 8,
                  padding: '12px 16px',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onClick={() => { navigate(item.path); setDrawerOpen(false); }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#FFD700', fontSize: 28 }} onClick={() => setDrawerOpen(false)}>
            ×
          </button>
        </div>
      )}
      {/* 메인 컨텐츠 */}
      <div style={{ paddingTop: 96, paddingLeft: 32, paddingRight: 32, minHeight: '100vh', background: '#101315' }}>
        {children}
      </div>
    </div>
  );
} 