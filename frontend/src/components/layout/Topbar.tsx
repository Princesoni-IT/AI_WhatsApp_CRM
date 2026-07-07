import { Menu, Search, Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

interface TopbarProps {
  onOpenSidebar: () => void;
  user: any;
}

export default function Topbar({ onOpenSidebar, user }: TopbarProps) {
  const location = useLocation();
  const displayName = user?.firstName ? `${user.firstName}` : "Guest";

  let title = "Dashboard";
  let sub = `Welcome back, ${displayName} 👋`;

  if (location.pathname.includes("/customers")) {
    title = "Customers";
    sub = "Manage your WhatsApp contacts";
  } else if (location.pathname.includes("/campaigns")) {
    title = "Campaigns";
    sub = "Create and track your messaging campaigns";
  }

  return (
    <header className="db-topbar">
      <div className="db-topbar-left">
        <button className="db-mobile-toggle" onClick={onOpenSidebar} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div>
          <h1 className="db-page-title">{title}</h1>
          <p className="db-page-sub">{sub}</p>
        </div>
      </div>

      <div className="db-topbar-right">
        <div className="db-search hidden md:flex">
          <Search size={16} />
          <input type="text" placeholder="Search customers, campaigns..." />
        </div>
        <button className="db-action-btn" aria-label="Notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid #fff' }} />
        </button>
      </div>
    </header>
  );
}
