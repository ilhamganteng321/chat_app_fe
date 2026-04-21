import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import LoginPage from "./page/LoginPage";
import DashboardPage from "./page/DashboardPage";
import RegisterPage from "./page/RegisterPage.jsx";
import ToastProvider from "./provider/ToastProvider.jsx";
import { listenForegroundMessage } from "./utiils/firebase.js";
import { useThemeStore } from "./store/themeStore.js";
import { useSocketStore } from "./store/socketStore.js";

function App() {
  const { user, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const { connectSocket, disconnectSocket, onlineUsers } = useSocketStore();

  useEffect(() => {
    checkAuth();
    listenForegroundMessage(); // Jalankan pengecekan setiap kali app di-refresh
  }, [checkAuth]);

  useEffect(() => {
    console.log("ONLINE USERS:", [...onlineUsers.entries()]);
    if (user?.data?._id) {
      connectSocket(user.data._id);
    }
    return () => {
      disconnectSocket();
    };
  }, [user?.data?._id]);

  // Sangat Penting: Tampilkan loading screen saat sedang verifikasi cookie
  // Agar tidak terjadi "flicker" atau salah redirect sebelum data user didapat
  if (isCheckingAuth && !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p> {/* Kamu bisa ganti dengan Spinner component */}
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={!user ? <LoginPage /> : <Navigate to="/dashboard" />}
            />

            <Route
              path="/register"
              element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />}
            />

            <Route
              path="/dashboard"
              element={user ? <DashboardPage /> : <Navigate to="/login" />}
            />

            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </div>
  );
}

export default App;
