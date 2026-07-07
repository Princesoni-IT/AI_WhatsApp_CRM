import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import ContactsPage from "./Contacts";
import CampaignPage from "../../components/campaign/CampaignPage";
import { useContacts } from "../../hooks/useContacts";
import {
  LayoutDashboard, Users, Package, Megaphone,
  Target, ShoppingBag, Settings, LogOut,
  MessageSquare,
  Bell, Search,
  Wifi, WifiOff, Menu, X,
  AlertCircle, UploadCloud
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "customers", label: "Customers", icon: <Users size={18} /> },
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "campaigns", label: "Campaigns", icon: <Megaphone size={18} /> },
  { id: "leads", label: "Leads", icon: <Target size={18} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={18} /> },
  { id: "chats", label: "Chats", icon: <MessageSquare size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

export default function Dashboard({ user }: { user?: any }) {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(false);
  const [waConnected] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [authUser, setAuthUser] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const fetchUser = async () => {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success && response.data) {
            setAuthUser(response.data);
          }
        } catch {
          console.error("Failed to fetch user data");
        }
      };
      fetchUser();
    }
  }, [user]);

  const contactsQuery = useContacts();
  const totalContacts = contactsQuery.data?.length ?? 0;

  const userData = authUser ?? {
    firstName: "Guest",
    lastName: "User",
    email: "guest@example.com",
  };

  const displayName = `${userData.firstName ?? "Guest"} ${userData.lastName ?? "User"}`.trim();
  const storeName = userData.storeName ?? "Your Store";

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
      <style>{STYLES}</style>
      <div className="db-root">
        <aside className={`db-sidebar ${sidebarOpen ? "db-sidebar--open" : ""}`}>
          <div className="db-sidebar-logo">
            <span className="db-logo-text">Brand<em>AI</em></span>
            <button
              className="db-sidebar-close"
              onClick={() => setSidebar(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className={`db-wa-status ${waConnected ? "db-wa--on" : "db-wa--off"}`}>
            {waConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{waConnected ? "WhatsApp Connected" : "WhatsApp Disconnected"}</span>
          </div>

          <nav className="db-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`db-nav-item ${active === item.id ? "db-nav-item--active" : ""}`}
                onClick={() => { setActive(item.id); setSidebar(false); }}
              >
                <span className="db-nav-icon">{item.icon}</span>
                <span className="db-nav-label">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="db-nav-badge">
                    {item.badge > 999 ? "999+" : item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="db-user-card">
            <div className="db-user-avatar">
              {(displayName || "GU").split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="db-user-info">
              <p className="db-user-name">{displayName}</p>
              <p className="db-user-store">{storeName}</p>
            </div>
            <button
              className="db-logout-btn"
              title="Logout"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              <LogOut size={15} />
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="db-overlay" onClick={() => setSidebar(false)} />
        )}

        <div className="db-main">
          <header className="db-topbar">
            <div className="db-topbar-left">
              <button
                className="db-burger"
                onClick={() => setSidebar(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="db-page-title">Dashboard</h1>
                <p className="db-page-sub">Welcome back, {displayName.split(" ")[0]} 👋</p>
              </div>
            </div>

            <div className="db-topbar-right">
              <div className="db-search">
                <Search size={15} className="db-search-icon" />
                <input
                  className="db-search-input"
                  type="text"
                  placeholder="Search customers, leads…"
                />
              </div>

              <button className="db-notif-btn" aria-label="Notifications">
                <Bell size={18} />
                <span className="db-notif-dot" />
              </button>
            </div>
          </header>

          <div className="db-content">
            {active === "customers" ? (
              <ContactsPage />
            ) : active === "campaigns" ? (
              <CampaignPage />
            ) : (
              <>
                {!waConnected && (
                  <div className="db-alert db-alert--warn">
                    <AlertCircle size={16} />
                    WhatsApp is not connected. Go to{" "}
                    <button className="db-alert-link" onClick={() => setActive("settings")}>
                      Settings → WhatsApp
                    </button>{" "}
                    to connect.
                  </div>
                )}

                <div className="db-stats-grid">
                  <div className="db-stat-card stat--blue">
                    <div className="db-stat-top">
                      <div className="db-stat-icon"><Users size={20} /></div>
                    </div>
                    <p className="db-stat-value">{contactsQuery.isPending ? "..." : totalContacts}</p>
                    <p className="db-stat-label">Total contacts</p>
                  </div>

                  <div className="db-stat-card stat--green">
                    <div className="db-stat-top">
                      <div className="db-stat-icon"><UploadCloud size={20} /></div>
                    </div>
                    <p className="db-stat-value">{contactsQuery.isPending ? "Loading" : contactsQuery.isError ? "Error" : "Synced"}</p>
                    <p className="db-stat-label">Contact data status</p>
                  </div>
                </div>

                <div className="db-mid-grid">
                  <div className="db-card">
                    <div className="db-card-header">
                      <div>
                        <h2 className="db-card-title">Recent contacts</h2>
                        <p className="db-card-sub">Latest contacts imported into your CRM.</p>
                      </div>
                    </div>
                    {contactsQuery.isPending ? (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        Loading contacts...
                      </div>
                    ) : contactsQuery.isError ? (
                      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                        {contactsQuery.error?.message || "Failed to load contacts."}
                      </div>
                    ) : (
                      <div className="premium-table-wrap">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Phone</th>
                              <th>Added</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contactsQuery.data?.slice(0, 5).map((contact) => (
                              <tr key={contact._id}>
                                <td style={{ fontWeight: 600 }}>{contact.name}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{contact.phoneNumber}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{formatDate(contact.createdAt)}</td>
                              </tr>
                            ))}
                            {!contactsQuery.data?.length && (
                              <tr>
                                <td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                  No contacts found. Add or import contacts to populate this dashboard.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="db-card">
                    <div className="db-card-header">
                      <div>
                        <h2 className="db-card-title">Quick actions</h2>
                        <p className="db-card-sub">Jump to contact management or campaign setup.</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <button className="db-quick-card" onClick={() => setActive("customers")}>View contacts</button>
                      <button className="db-quick-card" onClick={() => setActive("campaigns")}>Create campaign</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }
.db-root { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; display: flex; min-height: 100vh; background: #f1f5f9; color: #0f172a; }
.db-sidebar { width: 248px; min-width: 248px; background: #0f172a; display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; overflow-y: auto; z-index: 40; }
.db-sidebar-logo { display: flex; align-items: center; justify-content: space-between; padding: 22px 20px 18px; border-bottom: 1px solid #1e293b; }
.db-logo-text { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.4px; font-style: normal; }
.db-logo-text em { color: #4ade80; font-style: normal; }
.db-wa-status { display: flex; align-items: center; gap: 6px; padding: 12px 20px; border-bottom: 1px solid #1e293b; font-size: 12px; }
.db-wa--on { color: #86efac; }
.db-wa--off { color: #f87171; }
.db-nav { padding: 16px 0; }
.db-nav-item { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 20px; border: none; background: none; color: #94a3b8; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.2s; }
.db-nav-item:hover { background: #1e293b; color: #fff; }
.db-nav-item--active { background: #1e293b; color: #fff; }
.db-nav-icon { display: flex; align-items: center; }
.db-nav-badge { margin-left: auto; background: #64748b; color: #fff; border-radius: 9999px; padding: 2px 10px; font-size: 12px; }
.db-user-card { padding: 16px 20px; border-top: 1px solid #1e293b; margin-top: auto; display: flex; gap: 12px; align-items: center; }
.db-user-avatar { width: 40px; height: 40px; border-radius: 9999px; background: #334155; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.db-user-info { flex: 1; }
.db-user-name { font-size: 14px; font-weight: 600; color: #fff; }
.db-user-store { font-size: 12px; color: #94a3b8; }
.db-logout-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; }
.db-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 30; }
.db-main { flex: 1; display: flex; flex-direction: column; }
.db-topbar { display: flex; align-items: center; justify-content: space-between; padding: 20px; background: #fff; border-bottom: 1px solid #e2e8f0; }
.db-topbar-left { display: flex; align-items: center; gap: 16px; }
.db-page-title { font-size: 24px; font-weight: 700; color: #0f172a; }
.db-page-sub { font-size: 14px; color: #64748b; margin-top: 2px; }
.db-topbar-right { display: flex; align-items: center; gap: 16px; }
.db-search { display: flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 4px 12px; }
.db-search-icon { color: #64748b; }
.db-search-input { border: none; outline: none; font-size: 14px; width: 180px; }
.db-notif-btn { background: none; border: none; cursor: pointer; position: relative; }
.db-notif-dot { position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; background: #22c55e; border-radius: 9999px; }
.db-content { flex: 1; padding: 24px; overflow-y: auto; }
.db-alert { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; }
.db-alert--warn { background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; }
.db-alert-link { background: none; border: none; color: #1e40af; text-decoration: underline; cursor: pointer; }
.db-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
.db-stat-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
.db-stat-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.db-stat-icon { color: #64748b; }
.db-stat-value { font-size: 24px; font-weight: 700; color: #0f172a; }
.db-stat-label { font-size: 12px; color: #64748b; }
.stat--blue { border-left: 4px solid #3b82f6; }
.stat--green { border-left: 4px solid #10b981; }
.db-mid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.db-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
.db-card-header { margin-bottom: 16px; }
.db-card-title { font-size: 18px; font-weight: 600; color: #0f172a; }
.db-card-sub { font-size: 13px; color: #64748b; }
.db-table-wrap { overflow-x: auto; }
.premium-table { width: 100%; border-collapse: collapse; }
.premium-table th, .premium-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; }
.premium-table th { background: #f8fafc; font-weight: 600; color: #475569; font-size: 13px; }
.premium-table tbody tr:hover { background: #f8fafc; }
.db-quick-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; transition: all 0.2s; }
.db-quick-card:hover { background: #f1f5f9; }
.db-quick-icon { display: flex; align-items: center; color: #64748b; }
.db-quick-label { font-size: 14px; font-weight: 500; color: #0f172a; }
.db-quick-sub { font-size: 12px; color: #64748b; }
@media (max-width: 768px) {
  .db-stats-grid { grid-template-columns: 1fr; }
  .db-mid-grid { grid-template-columns: 1fr; }
}
`;