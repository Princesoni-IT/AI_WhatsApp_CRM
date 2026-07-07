import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { authApi } from "../../services/api";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./dashboard.css";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="db-layout">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="db-main-area">
        <Topbar user={user} onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="db-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
