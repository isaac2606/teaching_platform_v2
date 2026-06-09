import { NavLink } from "react-router-dom";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const [role, setRole] = useState("Teacher");
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Groups", path: "/groups" },
    { name: "Schedule", path: "/schedule" },
    { name: "Messages", path: "/messages" },
    { name: "Materials", path: "/materials" },
  ];

  return (
    <aside className="w-64 h-screen bg-bg-surface/50 border-r border-white/10 flex flex-col font-sans backdrop-blur-xl">
      
      {/* 1. Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="text-brand-primary">teach</span>
          <span className="text-white">space</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-medium tracking-wide uppercase">Tutoring Platform</p>
      </div>

      {/* 2. Role Toggle */}
      <div className="p-4 border-b border-white/10">
        <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setRole("Teacher")}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              role === "Teacher" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:text-white"
            }`}
          >
            Teacher
          </button>
          <button 
            onClick={() => setRole("Student")}
            className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              role === "Student" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:text-white"
            }`}
          >
            Student
          </button>
        </div>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive 
                ? "bg-brand-primary/10 text-brand-primary shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]" 
                : "text-text-secondary hover:bg-white/5 hover:text-white"
              }
            `}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* 4. User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3 items-center p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors mb-2">
          <div className="bg-brand-primary text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-lg shadow-brand-primary/20">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "U"}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-white font-semibold text-sm truncate">{user?.username || "User"}</p>
             <p className="text-xs text-text-secondary truncate">{role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 font-medium rounded-lg transition-colors border border-red-500/20"
        >
          Log Out
        </button>
      </div>

    </aside>
  );
}