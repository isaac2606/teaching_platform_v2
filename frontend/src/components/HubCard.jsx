import { useState, memo, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const HubCard = memo(function HubCard({ hub, onDelete, onEdit }) {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");

    const handleCopy = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(hub.inviteToken);
        alert("Invite Link Copied!");
    };
    
    return(
        <div className="relative bg-bg-surface border border-border-subtle rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full group">
            
            {/* TOP HALF: Brand Color Area */}
            <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-5 relative overflow-hidden h-40 flex flex-col justify-between">
                {/* Decorative circle glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

                {/* Pill & Actions */}
                <div className="flex justify-between items-start relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/10">
                        {hub.subject || "Biology & Geology"}
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user?.role === "teacher" && (
                            <button 
                                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-md transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsEditing(true);
                                    setEditValue(hub.title);
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                        )}
                        {user?.role === "teacher" && (
                            <button 
                                className="p-1.5 text-white/70 hover:text-red-300 hover:bg-red-500/30 rounded-md transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onDelete(hub._id);
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Title and Subtitle */}
                <div className="relative z-10 mt-auto">
                    <h3 className="text-2xl font-extrabold text-white truncate drop-shadow-sm">
                        {hub.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-blue-100 text-sm font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        {hub.students?.length || 0} Enrolled Students
                    </div>
                </div>
            </div>

            {/* BOTTOM HALF: White Area */}
            <div className="p-5 flex flex-col flex-1 gap-5">
                
                {/* Next Scheduled Class Info */}
                <div>
                    <p className="text-text-secondary text-sm font-medium">Next Scheduled Class:</p>
                    <div className="flex items-center gap-1.5 mt-1 text-text-primary font-bold">
                        <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Tomorrow, 10:00 AM
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-auto pt-2">
                    <Link to={`/workspace/${hub._id}`} className="flex-1">
                        <button className="w-full bg-[#0F172A] hover:bg-[#1E293B] text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm">
                            Open Workspace
                        </button>
                    </Link>
                    
                    {user?.role === "teacher" && (
                        <button 
                            onClick={handleCopy}
                            className="p-2.5 border border-border-subtle hover:border-brand-primary text-text-secondary hover:text-brand-primary rounded-xl transition-colors bg-bg-surface shadow-sm"
                            title="Copy Invite Link"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    )}
                </div>

            </div>

            {/* Edit Modal Overlay */}
            {isEditing && (
                <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-5">
                    <input 
                        placeholder="Hub Title"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full mb-4 px-4 py-2 border border-border-subtle rounded-xl bg-bg-base text-text-primary focus:outline-none focus:border-brand-primary"
                        autoFocus
                    />
                    <div className="flex gap-2 w-full">
                        <button 
                            className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-2 rounded-xl font-bold transition-colors"
                            onClick={() => {
                                onEdit(hub._id, editValue);
                                setIsEditing(false);
                            }}
                        >
                            Save
                        </button>
                        <button 
                            className="flex-1 bg-white/5 border border-border-subtle hover:bg-white/10 text-text-primary py-2 rounded-xl font-bold transition-colors"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default HubCard;
