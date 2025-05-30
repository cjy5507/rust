import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import theme from "./theme";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import MainLayout from "./components/layout/MainLayout";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // 환경 정보 로깅
  console.log('🚀 App Environment Info:');
  console.log('- Mode:', import.meta.env.MODE);
  console.log('- DEV:', import.meta.env.DEV);
  console.log('- PROD:', import.meta.env.PROD);
  console.log('- Base URL:', import.meta.env.BASE_URL);

  // 로그인 성공 시 호출될 콜백
  const handleLogin = () => setIsAuthenticated(true);
  // 로그아웃 시 호출될 콜백
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <MainLayout onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/reservation" element={<div>예약 페이지 준비중</div>} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
