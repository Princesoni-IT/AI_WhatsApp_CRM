import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, Megaphone,
  Target, ShoppingBag, Settings, LogOut,
  MessageSquare, TrendingUp,
  Bell, Search, ChevronRight, MoreHorizontal,
  Wifi, WifiOff, Menu, X, Bot,
  ArrowUpRight, ArrowDownRight, Clock,
  AlertCircle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
type NavItem = {
  id:    string;
  label: string;
  icon:  React.ReactNode;
  badge?: number;
};

// ─── Mock data (replace with real API calls) ─────────────────
const STATS = [
  {
    label:   "Total Customers",
    value:   "1,284",
    change:  "+12%",
    up:      true,
    icon:    <Users size={20} />,
    color:   "stat--blue",
  },
  {
    label:   "Active Campaigns",
    value:   "7",
    change:  "+2 this week",
    up:      true,
    icon:    <Megaphone size={20} />,
    color:   "stat--green",
  },
  {
    label:   "Open Leads",
    value:   "34",
    change:  "-5 from last week",
    up:      false,
    icon:    <Target size={20} />,
    color:   "stat--purple",
  },
  {
    label:   "Revenue (MTD)",
    value:   "₹82,400",
    change:  "+18%",
    up:      true,
    icon:    <TrendingUp size={20} />,
    color:   "stat--amber",
  },
];

const RECENT_LEADS = [
  { name: "Riya Sharma",   phone: "+91 98765 43210", product: "Oud Al Haramain",   score: 87, status: "new" },
  { name: "Arjun Mehta",   phone: "+91 91234 56789", product: "Swiss Arabian",     score: 72, status: "reviewed" },
  { name: "Sneha Patel",   phone: "+91 88765 43100", product: "Ajmal Ameer",       score: 65, status: "approved" },
  { name: "Rohit Verma",   phone: "+91 99001 23456", product: "Lattafa Asad",      score: 61, status: "new" },
  { name: "Priya Kapoor",  phone: "+91 77889 01234", product: "Maison Alhambra",   score: 58, status: "rejected" },
];

const RECENT_ACTIVITY = [
  { type: "lead",     text: "New lead from Riya Sharma",         time: "2 min ago",  icon: <Target size={14} /> },
  { type: "message",  text: "AI replied to Arjun Mehta",         time: "8 min ago",  icon: <Bot size={14} /> },
  { type: "order",    text: "Order #ORD-091 marked Delivered",   time: "23 min ago", icon: <ShoppingBag size={14} /> },
  { type: "campaign", text: "Campaign 'Eid Sale' sent to 340",   time: "1 hr ago",   icon: <Megaphone size={14} /> },
  { type: "customer", text: "42 customers imported via Excel",   time: "3 hr ago",   icon: <Users size={14} /> },
];

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard size={18} /> },
  { id: "customers",  label: "Customers",  icon: <Users size={18} />,         badge: 1284 },
  { id: "products",   label: "Products",   icon: <Package size={18} /> },
  { id: "campaigns",  label: "Campaigns",  icon: <Megaphone size={18} />,     badge: 7 },
  { id: "leads",      label: "Leads",      icon: <Target size={18} />,        badge: 34 },
  { id: "orders",     label: "Orders",     icon: <ShoppingBag size={18} /> },
  { id: "chats",      label: "Chats",      icon: <MessageSquare size={18} />, badge: 5 },
  { id: "settings",   label: "Settings",   icon: <Settings size={18} /> },
];

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  new:       { label: "New",      cls: "badge--blue" },
  reviewed:  { label: "Reviewed", cls: "badge--amber" },
  approved:  { label: "Approved", cls: "badge--green" },
  rejected:  { label: "Rejected", cls: "badge--red" },
};

const ACTIVITY_COLORS: Record<string, string> = {
  lead:     "act--purple",
  message:  "act--green",
  order:    "act--blue",
  campaign: "act--amber",
  customer: "act--slate",
};

// ── Mini bar chart (campaign send % mock) ────────────────────
const BAR_DATA = [
  { day: "Mon", sent: 68 },
  { day: "Tue", sent: 82 },
  { day: "Wed", sent: 54 },
  { day: "Thu", sent: 91 },
  { day: "Fri", sent: 76 },
  { day: "Sat", sent: 88 },
  { day: "Sun", sent: 43 },
];

// ══════════════════════════════════════════════════════════════
export default function Dashboard({ user }: { user?: any }) {
  const [active, setActive]       = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(false);
  const [waConnected]             = useState(true); // mock
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  const authUser = user ?? {
    firstName: "Guest",
    lastName: "User",
    email: "guest@example.com",
  };

  const displayName = `${authUser.firstName ?? "Guest"} ${authUser.lastName ?? "User"}`.trim();
  const storeName = authUser.storeName ?? "Your Store";

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const response = await fetch("http://localhost:5000/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

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

        {/* ── SIDEBAR ── */}
        <aside className={`db-sidebar ${sidebarOpen ? "db-sidebar--open" : ""}`}>
          {/* Logo */}
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

          {/* WhatsApp status */}
          <div className={`db-wa-status ${waConnected ? "db-wa--on" : "db-wa--off"}`}>
            {waConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{waConnected ? "WhatsApp Connected" : "WhatsApp Disconnected"}</span>
          </div>

          {/* Nav */}
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

          {/* User card */}
          <div className="db-user-card">
            <div className="db-user-avatar">
              {(displayName || "GU")
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
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

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="db-overlay" onClick={() => setSidebar(false)} />
        )}

        {/* ── MAIN ── */}
        <div className="db-main">

          {/* Top bar */}
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
              {/* Search */}
              <div className="db-search">
                <Search size={15} className="db-search-icon" />
                <input
                  className="db-search-input"
                  type="text"
                  placeholder="Search customers, leads…"
                />
              </div>

              {/* Notifications */}
              <button className="db-notif-btn" aria-label="Notifications">
                <Bell size={18} />
                <span className="db-notif-dot" />
              </button>
            </div>
          </header>

          {/* ── PAGE CONTENT ── */}
          <div className="db-content">

            {/* WhatsApp disconnected banner */}
            {!waConnected && (
              <div className="db-alert db-alert--warn">
                <AlertCircle size={16} />
                WhatsApp is not connected. Go to{" "}
                <button className="db-alert-link"
                  onClick={() => setActive("settings")}>
                  Settings → WhatsApp
                </button>{" "}
                to connect.
              </div>
            )}

            {/* ── STAT CARDS ── */}
            <div className="db-stats-grid">
              {STATS.map((s, i) => (
                <div key={i} className={`db-stat-card ${s.color}`}>
                  <div className="db-stat-top">
                    <div className="db-stat-icon">{s.icon}</div>
                    <span className={`db-stat-change ${s.up ? "db-change--up" : "db-change--down"}`}>
                      {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {s.change}
                    </span>
                  </div>
                  <p className="db-stat-value">{s.value}</p>
                  <p className="db-stat-label">{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── MIDDLE ROW: Chart + Activity ── */}
            <div className="db-mid-grid">

              {/* Campaign activity bar chart */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <h2 className="db-card-title">Campaign Messages Sent</h2>
                    <p className="db-card-sub">This week — daily total</p>
                  </div>
                  <button className="db-card-action">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="db-bar-chart">
                  {BAR_DATA.map((b, i) => (
                    <div key={i} className="db-bar-col">
                      <div className="db-bar-track">
                        <div
                          className="db-bar-fill"
                          style={{ height: `${b.sent}%` }}
                          title={`${b.sent} messages`}
                        />
                      </div>
                      <span className="db-bar-label">{b.day}</span>
                    </div>
                  ))}
                </div>
                <div className="db-chart-legend">
                  <span className="db-legend-dot" />
                  <span>Messages sent per day</span>
                  <span className="db-legend-total">Total: 502</span>
                </div>
              </div>

              {/* Recent activity feed */}
              <div className="db-card">
                <div className="db-card-header">
                  <div>
                    <h2 className="db-card-title">Recent Activity</h2>
                    <p className="db-card-sub">Live updates from your CRM</p>
                  </div>
                </div>
                <ul className="db-activity-list">
                  {RECENT_ACTIVITY.map((a, i) => (
                    <li key={i} className="db-activity-item">
                      <div className={`db-activity-icon ${ACTIVITY_COLORS[a.type]}`}>
                        {a.icon}
                      </div>
                      <div className="db-activity-body">
                        <p className="db-activity-text">{a.text}</p>
                        <span className="db-activity-time">
                          <Clock size={11} /> {a.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* ── LEADS TABLE ── */}
            <div className="db-card">
              <div className="db-card-header">
                <div>
                  <h2 className="db-card-title">Recent Leads</h2>
                  <p className="db-card-sub">Auto-detected from WhatsApp conversations</p>
                </div>
                <button
                  className="db-card-action"
                  onClick={() => setActive("leads")}
                >
                  View all leads <ChevronRight size={14} />
                </button>
              </div>

              {/* Desktop table */}
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product Interest</th>
                      <th>Intent Score</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_LEADS.map((lead, i) => (
                      <tr key={i}>
                        <td>
                          <div className="db-customer-cell">
                            <div className="db-customer-avatar">
                              {lead.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="db-customer-name">{lead.name}</p>
                              <p className="db-customer-phone">{lead.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="db-product-name">{lead.product}</span>
                        </td>
                        <td>
                          <div className="db-score-cell">
                            <div className="db-score-bar">
                              <div
                                className={`db-score-fill ${
                                  lead.score >= 80 ? "db-score--high"
                                  : lead.score >= 65 ? "db-score--mid"
                                  : "db-score--low"
                                }`}
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className="db-score-num">{lead.score}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`db-badge ${STATUS_CONFIG[lead.status].cls}`}>
                            {STATUS_CONFIG[lead.status].label}
                          </span>
                        </td>
                        <td>
                          <button className="db-row-action">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (shown instead of table on small screens) */}
              <div className="db-lead-cards">
                {RECENT_LEADS.map((lead, i) => (
                  <div key={i} className="db-lead-card">
                    <div className="db-lead-card-top">
                      <div className="db-customer-cell">
                        <div className="db-customer-avatar db-avatar--sm">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="db-customer-name">{lead.name}</p>
                          <p className="db-customer-phone">{lead.phone}</p>
                        </div>
                      </div>
                      <span className={`db-badge ${STATUS_CONFIG[lead.status].cls}`}>
                        {STATUS_CONFIG[lead.status].label}
                      </span>
                    </div>
                    <div className="db-lead-card-bot">
                      <span className="db-product-name">{lead.product}</span>
                      <div className="db-score-cell">
                        <div className="db-score-bar">
                          <div
                            className={`db-score-fill ${
                              lead.score >= 80 ? "db-score--high"
                              : lead.score >= 65 ? "db-score--mid"
                              : "db-score--low"
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="db-score-num">{lead.score}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div className="db-quick-grid">
              {[
                { label: "Add Customer",    icon: <Users size={20} />,      id: "customers",  sub: "Manually add one customer" },
                { label: "New Campaign",    icon: <Megaphone size={20} />,  id: "campaigns",  sub: "Blast a WhatsApp campaign" },
                { label: "Import Excel",    icon: <Package size={20} />,    id: "customers",  sub: "Bulk upload from .xlsx" },
                { label: "View Orders",     icon: <ShoppingBag size={20} />,id: "orders",     sub: "Track all active orders" },
              ].map((q, i) => (
                <button
                  key={i}
                  className="db-quick-card"
                  onClick={() => setActive(q.id)}
                >
                  <div className="db-quick-icon">{q.icon}</div>
                  <div>
                    <p className="db-quick-label">{q.label}</p>
                    <p className="db-quick-sub">{q.sub}</p>
                  </div>
                  <ChevronRight size={16} className="db-quick-arrow" />
                </button>
              ))}
            </div>

          </div>{/* /db-content */}
        </div>{/* /db-main */}
      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-text-size-adjust: 100%; }

/* ── ROOT ── */
.db-root {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  display: flex;
  min-height: 100vh;
  background: #f1f5f9;
  color: #0f172a;
}

/* ═══════════════════════════
   SIDEBAR
═══════════════════════════ */
.db-sidebar {
  width: 248px;
  min-width: 248px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  z-index: 40;
}

.db-sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 20px 18px;
  border-bottom: 1px solid #1e293b;
}
.db-logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.4px;
  font-style: normal;
}
.db-logo-text em { color: #4ade80; font-style: normal; }
.db-sidebar-close {
  display: none;
  background: none; border: none;
  color: #64748b; cursor: pointer; padding: 4px;
}

/* WhatsApp status pill */
.db-wa-status {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 600;
  padding: 8px 16px;
  margin: 14px 16px 6px;
  border-radius: 8px;
}
.db-wa--on  { background: rgba(74,222,128,0.1); color: #4ade80; }
.db-wa--off { background: rgba(239,68,68,0.1);  color: #f87171; }

/* Nav */
.db-nav {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.db-nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  border: none;
  background: none;
  color: #94a3b8;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.db-nav-item:hover { background: #1e293b; color: #e2e8f0; }
.db-nav-item--active { background: #16a34a; color: #fff; }
.db-nav-item--active:hover { background: #15803d; }
.db-nav-icon { flex-shrink: 0; display: flex; }
.db-nav-label { flex: 1; }
.db-nav-badge {
  background: #334155;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 100px;
  min-width: 20px;
  text-align: center;
}
.db-nav-item--active .db-nav-badge { background: rgba(255,255,255,0.2); color: #fff; }

/* User card */
.db-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #1e293b;
  margin-top: auto;
}
.db-user-avatar {
  width: 34px; height: 34px;
  border-radius: 8px;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.db-user-info { flex: 1; min-width: 0; }
.db-user-name  { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.db-user-store { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.db-logout-btn {
  background: none; border: none;
  color: #64748b; cursor: pointer;
  padding: 6px; border-radius: 6px;
  display: flex;
  transition: color 0.15s, background 0.15s;
}
.db-logout-btn:hover { color: #f87171; background: rgba(239,68,68,0.1); }

/* Overlay */
.db-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 39;
}

/* ═══════════════════════════
   MAIN
═══════════════════════════ */
.db-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

/* Topbar */
.db-topbar {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 30;
}
.db-topbar-left { display: flex; align-items: center; gap: 14px; }
.db-burger {
  display: none;
  background: none; border: none;
  color: #475569; cursor: pointer;
  padding: 6px; border-radius: 6px;
}
.db-page-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.db-page-sub   { font-size: 12px; color: #94a3b8; margin-top: 1px; }

.db-topbar-right { display: flex; align-items: center; gap: 12px; }
.db-search {
  position: relative;
  display: flex;
  align-items: center;
}
.db-search-icon {
  position: absolute;
  left: 11px;
  color: #94a3b8;
  pointer-events: none;
}
.db-search-input {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px 8px 34px;
  font-size: 13px;
  color: #0f172a;
  font-family: inherit;
  outline: none;
  width: 220px;
  transition: border-color 0.18s, width 0.25s;
}
.db-search-input:focus { border-color: #16a34a; width: 260px; }
.db-search-input::placeholder { color: #94a3b8; }

.db-notif-btn {
  position: relative;
  background: none; border: none;
  color: #64748b; cursor: pointer;
  padding: 8px; border-radius: 8px;
  display: flex;
  transition: background 0.15s, color 0.15s;
}
.db-notif-btn:hover { background: #f1f5f9; color: #0f172a; }
.db-notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 8px; height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #fff;
}

/* Content area */
.db-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Alert banner */
.db-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
}
.db-alert--warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
.db-alert-link {
  background: none; border: none;
  color: #b45309; font-weight: 600;
  font-size: 13px; cursor: pointer;
  font-family: inherit; padding: 0;
  text-decoration: underline;
}

/* ═══════════════════════════
   STAT CARDS
═══════════════════════════ */
.db-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.db-stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}
.db-stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.db-stat-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.stat--blue   .db-stat-icon { background: #dbeafe; color: #2563eb; }
.stat--green  .db-stat-icon { background: #dcfce7; color: #16a34a; }
.stat--purple .db-stat-icon { background: #ede9fe; color: #7c3aed; }
.stat--amber  .db-stat-icon { background: #fef3c7; color: #d97706; }

.db-stat-change {
  display: flex; align-items: center;
  gap: 2px; font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 100px;
}
.db-change--up   { background: #dcfce7; color: #16a34a; }
.db-change--down { background: #fef2f2; color: #ef4444; }

.db-stat-value {
  font-size: 28px; font-weight: 800;
  color: #0f172a; letter-spacing: -0.5px;
  margin-bottom: 3px;
}
.db-stat-label { font-size: 12px; color: #94a3b8; }

/* ═══════════════════════════
   CARDS
═══════════════════════════ */
.db-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
}
.db-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}
.db-card-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.db-card-sub   { font-size: 12px; color: #94a3b8; }
.db-card-action {
  display: flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; color: #16a34a;
  background: none; border: none; cursor: pointer;
  font-family: inherit; white-space: nowrap;
  transition: color 0.15s;
}
.db-card-action:hover { color: #15803d; }

/* ═══════════════════════════
   MID GRID (Chart + Activity)
═══════════════════════════ */
.db-mid-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 14px;
}

/* Bar chart */
.db-bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 140px;
  padding-bottom: 4px;
}
.db-bar-col { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.db-bar-track {
  flex: 1; width: 100%;
  background: #f1f5f9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}
.db-bar-fill {
  background: #16a34a;
  border-radius: 6px 6px 0 0;
  transition: height 0.4s ease;
  min-height: 4px;
}
.db-bar-label { font-size: 11px; color: #94a3b8; }
.db-chart-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  font-size: 12px;
  color: #64748b;
}
.db-legend-dot { width: 8px; height: 8px; background: #16a34a; border-radius: 2px; }
.db-legend-total { margin-left: auto; font-weight: 600; color: #0f172a; }

/* Activity feed */
.db-activity-list { list-style: none; display: flex; flex-direction: column; gap: 0; }
.db-activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #f1f5f9;
}
.db-activity-item:last-child { border-bottom: none; padding-bottom: 0; }
.db-activity-icon {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.act--purple { background: #ede9fe; color: #7c3aed; }
.act--green  { background: #dcfce7; color: #16a34a; }
.act--blue   { background: #dbeafe; color: #2563eb; }
.act--amber  { background: #fef3c7; color: #d97706; }
.act--slate  { background: #f1f5f9; color: #475569; }
.db-activity-body { flex: 1; min-width: 0; }
.db-activity-text { font-size: 13px; color: #0f172a; line-height: 1.4; margin-bottom: 3px; }
.db-activity-time {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: #94a3b8;
}

/* ═══════════════════════════
   LEADS TABLE
═══════════════════════════ */
.db-table-wrap { overflow-x: auto; }
.db-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.db-table th {
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0 12px 12px;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}
.db-table th:first-child, .db-table td:first-child { padding-left: 0; }
.db-table th:last-child,  .db-table td:last-child  { padding-right: 0; }
.db-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f8fafc;
  vertical-align: middle;
}
.db-table tr:last-child td { border-bottom: none; }

.db-customer-cell { display: flex; align-items: center; gap: 10px; }
.db-customer-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0284c7;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.db-avatar--sm { width: 30px; height: 30px; border-radius: 7px; font-size: 11px; }
.db-customer-name  { font-size: 13px; font-weight: 600; color: #0f172a; }
.db-customer-phone { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.db-product-name   { font-size: 13px; color: #334155; }

.db-score-cell { display: flex; align-items: center; gap: 8px; min-width: 120px; }
.db-score-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.db-score-fill   { height: 100%; border-radius: 3px; transition: width 0.4s; }
.db-score--high  { background: #16a34a; }
.db-score--mid   { background: #eab308; }
.db-score--low   { background: #f97316; }
.db-score-num    { font-size: 12px; font-weight: 700; color: #475569; min-width: 22px; text-align: right; }

.db-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 100px;
}
.badge--blue  { background: #dbeafe; color: #1d4ed8; }
.badge--amber { background: #fef3c7; color: #92400e; }
.badge--green { background: #dcfce7; color: #15803d; }
.badge--red   { background: #fef2f2; color: #dc2626; }

.db-row-action {
  background: none; border: none;
  color: #94a3b8; cursor: pointer;
  padding: 4px; border-radius: 6px;
  display: flex;
  transition: background 0.15s, color 0.15s;
}
.db-row-action:hover { background: #f1f5f9; color: #475569; }

/* Mobile lead cards (hidden on desktop) */
.db-lead-cards { display: none; flex-direction: column; gap: 10px; }
.db-lead-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}
.db-lead-card-top {
  display: flex; align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.db-lead-card-bot {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
}

/* ═══════════════════════════
   QUICK ACTIONS
═══════════════════════════ */
.db-quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.db-quick-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}
.db-quick-card:hover {
  border-color: #bbf7d0;
  box-shadow: 0 4px 16px rgba(22,163,74,0.08);
  transform: translateY(-1px);
}
.db-quick-icon {
  width: 40px; height: 40px;
  background: #f1f5f9;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #475569;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.db-quick-card:hover .db-quick-icon { background: #dcfce7; color: #16a34a; }
.db-quick-label { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.db-quick-sub   { font-size: 11px; color: #94a3b8; }
.db-quick-arrow { color: #cbd5e1; margin-left: auto; flex-shrink: 0; }

/* ═══════════════════════════
   RESPONSIVE
═══════════════════════════ */
@media (max-width: 1200px) {
  .db-stats-grid  { grid-template-columns: repeat(2, 1fr); }
  .db-quick-grid  { grid-template-columns: repeat(2, 1fr); }
  .db-mid-grid    { grid-template-columns: 1fr; }
  .db-search-input { width: 160px; }
  .db-search-input:focus { width: 200px; }
}

@media (max-width: 900px) {
  .db-sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }
  .db-sidebar--open { transform: translateX(0); }
  .db-sidebar-close { display: flex; }
  .db-burger  { display: flex; }
  .db-content { padding: 16px; gap: 14px; }
  .db-topbar  { padding: 0 16px; }
  .db-search  { display: none; }
}

@media (max-width: 600px) {
  .db-stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .db-quick-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .db-stat-value { font-size: 22px; }
  .db-quick-sub  { display: none; }
  /* Hide table, show mobile cards */
  .db-table-wrap  { display: none; }
  .db-lead-cards  { display: flex; }
}

@media (max-width: 380px) {
  .db-stats-grid { grid-template-columns: 1fr; }
  .db-quick-grid { grid-template-columns: 1fr; }
}
`;