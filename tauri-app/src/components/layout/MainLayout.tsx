import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Button } from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";

const menu = [
  { label: "대시보드", path: "/dashboard" },
  { label: "설정", path: "/settings" },
];

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
    <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* 상단 AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: '#ffffff',
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              onClick={() => setDrawerOpen(true)}
              sx={{ color: '#64748b', mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '1.25rem'
              }}
            >
              ROLEX 예약 시스템
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              {clock}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={onLogout}
              sx={{
                borderColor: '#e2e8f0',
                color: '#475569',
                '&:hover': {
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  background: '#fef2f2'
                }
              }}
            >
              로그아웃
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer 메뉴 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: '#ffffff',
            borderRight: '1px solid #e2e8f0'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
              메뉴
            </Typography>
            <IconButton 
              onClick={() => setDrawerOpen(false)}
              sx={{ color: '#64748b' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        <List sx={{ p: 1 }}>
          {menu.map(item => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => { 
                  navigate(item.path); 
                  setDrawerOpen(false); 
                }}
                sx={{
                  borderRadius: 1.5,
                  mx: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    background: '#eff6ff',
                    color: '#3b82f6',
                    '&:hover': {
                      background: '#dbeafe',
                    }
                  },
                  '&:hover': {
                    background: '#f8fafc',
                  }
                }}
              >
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* 메인 컨텐츠 */}
      <Box 
        component="main" 
        sx={{ 
          pt: '64px', // AppBar 높이만큼 패딩
          minHeight: '100vh',
          background: '#f8fafc'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
