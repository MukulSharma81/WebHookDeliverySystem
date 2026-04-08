// src/components/Sidebar.jsx

import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Webhook,
  ScrollText,
  LogOut,
  Zap,
  Settings,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/webhooks", icon: Webhook, label: "Webhooks" },
  { to: "/logs", icon: ScrollText, label: "Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{ background: "linear-gradient(180deg, #0d1117 0%, #111827 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", boxShadow: "0 0 18px rgba(16,185,129,0.4)" }}>
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">WebHook</p>
          <p className="text-emerald-400 text-xs font-medium mt-0.5">Delivery System</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom — User + Logout */}
      <div className="px-3 pb-6 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* User avatar */}
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
            A
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-none">Admin</p>
            <p className="text-gray-500 text-xs mt-0.5">admin@webhook.dev</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300"
          style={{ hover: { background: "rgba(239,68,68,0.08)" } }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
