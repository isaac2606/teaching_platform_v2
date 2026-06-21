import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { name: "Hubs", path: "/hubs", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { name: "Schedule", path: "/schedule", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { name: "Messages", path: "/messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { name: "Materials", path: "/materials", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  ];

  return (
    <aside className="w-20 lg:w-64 h-screen bg-[var(--color-sidebar-bg)] border-r border-white/10 flex flex-col font-sans transition-all duration-300 shadow-2xl relative z-50">
      
      {/* 1. Header */}
      <div className="p-4 lg:p-6 border-b border-white/10 flex justify-center lg:justify-start items-center">
        <h1 className="text-2xl font-bold tracking-tight hidden lg:block">
          <span className="text-brand-primary">teach</span>
          <span className="text-white">space</span>
        </h1>
        {/* Mobile Icon */}
        <div className="lg:hidden text-brand-primary font-bold text-2xl">
          ts
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 flex flex-col gap-2 p-3 lg:p-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-center lg:justify-start gap-3 px-3 py-3 lg:px-4 lg:py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? "bg-brand-primary/15 text-brand-primary shadow-[inset_4px_0_0_0_rgba(59,130,246,1)] lg:shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              }
            `}
            title={item.name}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            <span className="hidden lg:block">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. Theme Toggle & User Profile */}
      <div className="p-3 lg:p-4 border-t border-white/10 flex flex-col gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center lg:justify-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
          <span className="hidden lg:block">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>

        {/* User Card */}
        <div className="flex justify-center lg:justify-start gap-3 items-center p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
          <div className="bg-brand-primary shrink-0 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
             <p className="text-white font-semibold text-sm truncate">{user?.username || "User"}</p>
             <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
             <p className="text-xs text-slate-400"> {user?._id}</p>
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout}
          className="w-full flex justify-center lg:justify-start gap-3 px-3 py-2 lg:py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 font-medium rounded-lg transition-colors border border-transparent lg:border-red-500/20"
          title="Log Out"
        >
          <svg className="w-5 h-5 shrink-0 lg:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="hidden lg:block">Log Out</span>
        </button>
      </div>

    </aside>
  );
}