import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import MainLayout from "./components/layout/MainLayout";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  // 로그인 성공 시 호출될 콜백
  const handleLogin = () => setIsAuthenticated(true);
  // 로그아웃 시 호출될 콜백
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout onLogout={handleLogout}>
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="reservation" element={<div>예약 페이지 준비중</div>} />
                  <Route path="settings" element={<Settings />} />
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
  );
}

export default App;
