import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Landing/Home";
import Register from "./pages/Auth/Register";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/Forgot-password";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import ContactsPage from "./pages/Dashboard/Contacts";
import CampaignPage from "./components/campaign/CampaignPage";
import ProtectedRoute from "./components/layout/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="customers" element={<ContactsPage />} />
          <Route path="campaigns" element={<CampaignPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;