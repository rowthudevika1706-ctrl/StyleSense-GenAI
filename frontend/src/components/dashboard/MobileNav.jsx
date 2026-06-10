import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sparkles, Bookmark, MessageCircle, User } from "lucide-react";

const MOBILE_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/style", icon: Sparkles, label: "Style" },
  { to: "/saved", icon: Bookmark, label: "Saved" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-links">
        {MOBILE_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}