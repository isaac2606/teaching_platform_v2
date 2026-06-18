import { Outlet, NavLink, useRouteLoaderData, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function HubWorkspaceLayout() {
    const hub = useRouteLoaderData("hub-workspace");
    const { user } = useContext(AuthContext);

    const navLinks = [
        { name: "Announcements Feed", path: "feed", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" },
        { name: "Live Chat", path: "chat", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        { name: "Schedule & Live", path: "schedule", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
        { name: "Roster & Attendance", path: "roster", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
    ];

    return (
        <div className="flex-1 min-h-screen bg-bg-base text-text-primary p-4 sm:p-8 flex flex-col gap-6 transition-colors duration-300">
            
            {/* Header Area */}
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden transition-colors duration-300">
                
                {/* Decorative background glow for dark mode, subtle for light mode */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Top: Breadcrumbs & Title */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
                    <div className="flex flex-col gap-2">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <Link to="/dashboard" className="hover:text-brand-primary transition-colors">My Hubs</Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            <span className="text-text-primary font-semibold">{hub.title}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-1 text-text-primary">
                            {hub.title}
                        </h1>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <div className="flex items-center gap-2 text-text-secondary font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                {hub.students?.length || 0} Students
                            </div>
                            
                            {/* Invite Link Pill */}
                            {user?.role === "teacher" && (
                                <button 
                                    onClick={() => navigator.clipboard.writeText(`http://localhost:5173/join/${hub.inviteToken}`)}
                                    className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-md text-sm font-bold transition-colors"
                                    title="Copy Invite Link"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                    Invite Link
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Create Sub-Class Button */}
                    {user?.role === "teacher" && (
                        <button className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Create Sub-Class
                        </button>
                    )}
                </div>

                {/* Tabs Navigation */}
                <div className="flex border-b border-border-subtle mt-2 overflow-x-auto hide-scrollbar relative z-10">
                    {navLinks.map((tab) => (
                        <NavLink
                            key={tab.name}
                            to={tab.path}
                            className={({ isActive }) => `
                                flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2
                                ${isActive 
                                    ? "border-brand-primary text-brand-primary" 
                                    : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle"
                                }
                            `}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                            </svg>
                            {tab.name}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full max-w-[1600px] mx-auto">
                <Outlet />
            </div>

        </div>
    );
}