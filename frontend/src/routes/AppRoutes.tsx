import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Landing/Home";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/Forgot-password";
import VerifyEmail from "../pages/Auth/VerifyEmail";
import Dashboard from "../pages/Dashboard/Dashboard";
import ProtectedRoute from "../components/layout/ProtectedRoute";

/**
 * Application Routes Configuration
 * Defines all routes with proper authentication guards
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Routes - Require authentication */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;