import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, Button, Divider, ListItemIcon } from "@mui/material";
import { Menu as MenuIcon, Close as CloseIcon, Dashboard as DashboardIcon, Settings as SettingsIcon, Logout as LogoutIcon, Watch as WatchIcon } from "@mui/icons-material";

const menu = [
  { label: "대시보드", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "설정", path: "/settings", icon: <SettingsIcon /> },
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
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      {/* 상단 AppBar 개선 */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          zIndex: 1300
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              onClick={() => setDrawerOpen(true)}
              sx={{ 
                color: '#e2e8f0', 
                mr: 2,
                p: 1.5,
                borderRadius: 2,
                '&:hover': {
                  background: 'rgba(201, 176, 55, 0.1)',
                  color: '#c9b037'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0f172a'
              }}>
                <WatchIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  color: '#e2e8f0',
                  fontSize: '1.25rem',
                  fontFamily: 'Playfair Display, serif'
                }}
              >
                ROLEX 자동화
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              variant="outlined" 
              size="small"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontWeight: 600,
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)'
                }
              }}
            >
              로그아웃
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer 메뉴 개선 */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: 'none',
            borderRight: '1px solid rgba(71, 85, 105, 0.3)'
          }
        }}
      >
        {/* 드로어 헤더 */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                color: '#0f172a'
              }}>
                <WatchIcon sx={{ fontSize: 24 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#e2e8f0', fontFamily: 'Playfair Display, serif' }}>
                ROLEX
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setDrawerOpen(false)}
              sx={{ 
                color: '#94a3b8',
                '&:hover': {
                  color: '#ef4444',
                  background: 'rgba(239, 68, 68, 0.1)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" color="#94a3b8" sx={{ fontWeight: 500 }}>
            자동화 시스템 메뉴
          </Typography>
        </Box>
        
        {/* 메뉴 리스트 */}
        <List sx={{ p: 2, flex: 1 }}>
          {menu.map((item, index) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => { 
                  navigate(item.path); 
                  setDrawerOpen(false); 
                }}
                sx={{
                  borderRadius: 2,
                  mx: 0.5,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(201, 176, 55, 0.15) 0%, rgba(244, 208, 63, 0.1) 100%)',
                    color: '#c9b037',
                    border: '1px solid rgba(201, 176, 55, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(201, 176, 55, 0.2) 0%, rgba(244, 208, 63, 0.15) 100%)',
                    }
                  },
                  '&:hover': {
                    background: 'rgba(71, 85, 105, 0.2)',
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? '#c9b037' : '#94a3b8',
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '1rem',
                    color: location.pathname === item.path ? '#c9b037' : '#e2e8f0'
                  }}
                />
                {location.pathname === item.path && (
                  <Box sx={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #c9b037 0%, #f4d03f 100%)',
                    ml: 1
                  }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(71, 85, 105, 0.3)' }} />

        {/* 드로어 푸터 */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            background: 'rgba(15, 23, 42, 0.3)',
            border: '1px solid rgba(71, 85, 105, 0.3)',
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="#94a3b8" fontWeight={500}>
              Premium Automation
            </Typography>
            <Typography variant="caption" color="#64748b">
              v1.0.0
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* 메인 컨텐츠 */}
      <Box 
        component="main" 
        sx={{ 
          pt: '80px', // AppBar 높이만큼 패딩
          minHeight: '100vh',
          background: 'transparent'
        }}
      >
        {children}
      </Box>
    </Box>
  );
}