import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Megaphone, LogOut, X, Wifi } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "customers", label: "Customers", path: "/dashboard/customers", icon: <Users size={18} /> },
  { id: "campaigns", label: "Campaigns", path: "/dashboard/campaigns", icon: <Megaphone size={18} /> },
];

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const displayName = `${user?.firstName ?? "Guest"} ${user?.lastName ?? "User"}`.trim();
  const storeName = user?.storeName ?? "Your Store";
  const initials = (displayName || "GU").split(" ").map((n: string) => n[0]).join("");

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <>
      <aside className={`db-sidebar ${isOpen ? "open" : ""}`}>
        <div className="db-sidebar-header">
          <NavLink to="/dashboard" className="db-brand">
            Brand<span>AI</span>
          </NavLink>
          <button className="db-sidebar-close db-mobile-toggle" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="db-wa-status">
          <Wifi size={14} />
          <span>WhatsApp Connected</span>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) => `db-nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="db-user-card">
          <div className="db-avatar">{initials}</div>
          <div className="db-user-info">
            <p className="db-user-name">{displayName}</p>
            <p className="db-user-role">{storeName}</p>
          </div>
          <button className="db-logout" onClick={handleLogout} disabled={logoutLoading} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      
      {isOpen && <div className="db-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 39 }} />}
    </>
  );
}
