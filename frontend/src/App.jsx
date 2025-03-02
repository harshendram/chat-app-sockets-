import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import React from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  // const authUser = useAuthStore((state) => state.authUser);
  // const checkAuth = useAuthStore((state) => state.checkAuth);
  //unlike useState zustand returns an obj not an array and synchronous func
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  console.log({ onlineUsers });
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-black">
        <div className="relative flex justify-center items-center">
          {/* Glowing Outer Ring */}
          <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-xl animate-pulse"></div>

          {/* Spinning Glassy Ring */}
          <div className="absolute w-24 h-24 border-[5px] border-transparent border-t-blue-500 border-b-purple-500 rounded-full animate-spin"></div>

          {/* Central Loader Icon */}
          <Loader className="w-16 h-16 text-white animate-spin-slow drop-shadow-lg" />

          {/* Floating Glowing Dots */}
          <div className="absolute top-0 w-3 h-3 bg-blue-400 rounded-full shadow-lg animate-bounce"></div>
          <div className="absolute bottom-0 w-3 h-3 bg-purple-400 rounded-full shadow-lg animate-bounce delay-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
