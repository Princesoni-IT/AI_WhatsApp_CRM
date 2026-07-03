import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Landing/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard/Dashboard';
//import ProtectedRoute from '../components/layout/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Koi bhi access kar sakta hai */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Route - abhi ProtectedRoute band hai */}
      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>
  );
};

export default AppRoutes;