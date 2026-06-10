import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Sparkles, Bookmark, Clock,
  User, MessageCircle, LogOut
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/style", icon: Sparkles, label: "Get Styled" },
  { to: "/saved", icon: Bookmark, label: "Saved Outfits" },
  { to: "/history", icon: Clock, label: "History" },
  { to: "/chat", icon: MessageCircle, label: "Style Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>StyleSense</h1>
        <span>AI Fashion Stylist</span>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 12 }}>
          {user?.name}
        </div>
        <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout} style={{ justifyContent: "flex-start", gap: 8 }}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}