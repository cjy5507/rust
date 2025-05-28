import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';

const menuItems = [
  { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '예약', icon: <EventIcon />, path: '/reservation' },
  { text: '로그', icon: <ListAltIcon />, path: '/logs' },
  { text: '설정', icon: <SettingsIcon />, path: '/settings' },
]; 