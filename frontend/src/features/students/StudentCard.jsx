import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function StudentCard({ student, onKick }) {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [showKickConfirm, setShowKickConfirm] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);

    const handleMessage = () => {
        // Pass the student ID via React Router state so the Messages page can auto-select them!
        navigate("/messages", { state: { autoSelectUserId: student._id } });
    };

    return (
        <div className="relative bg-bg-surface border border-border-subtle rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden flex items-center p-4 group">
            
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-white/20 blur-sm pointer-events-none"></div>
                <span className="relative z-10">{student?.username?.[0]?.toUpperCase() || "?"}</span>
            </div>

            {/* Info */}
            <div className="ml-4 flex-1 min-w-0">
                <h4 className="font-bold text-text-primary text-base truncate">{student?.username}</h4>
                <p className="text-xs text-text-secondary truncate">{student?.email}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
                
                {/* Stats Icon */}
                <button 
                    onClick={() => setShowStatsModal(true)}
                    className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-xl transition-colors"
                    title="View Analytics"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>

                {/* Message Icon */}
                <button 
                    onClick={handleMessage}
                    className="p-2 text-brand-primary hover:text-white hover:bg-brand-primary rounded-xl transition-colors"
                    title="Direct Message"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </button>

                {/* Kick Icon */}
                {user?.role === "teacher" && (
                    <button 
                        onClick={() => setShowKickConfirm(true)}
                        className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors ml-1"
                        title="Remove Student"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" /></svg>
                    </button>
                )}
            </div>

            {/* Kick Confirmation Modal Overlay directly on the card */}
            {showKickConfirm && (
                <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4">
                    <p className="text-sm font-bold text-text-primary text-center mb-3">
                        Remove {student?.username}?
                    </p>
                    <div className="flex gap-2 w-full">
                        <button 
                            className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-1.5 rounded-lg font-bold text-xs transition-colors border border-red-500/20 hover:border-transparent"
                            onClick={() => {
                                onKick(student._id);
                                setShowKickConfirm(false);
                            }}
                        >
                            Confirm
                        </button>
                        <button 
                            className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary py-1.5 rounded-lg font-bold text-xs transition-colors"
                            onClick={() => setShowKickConfirm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Temporary Stats Modal (Placeholder for Phase 2) */}
            {showStatsModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                        <button 
                            onClick={() => setShowStatsModal(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-bold text-text-primary mb-4">{student?.username}'s Stats</h2>
                        <div className="bg-bg-base rounded-xl p-4 border border-border-subtle text-center text-text-secondary">
                            <span className="text-4xl mb-2 block">📊</span>
                            <p className="text-sm font-medium">Attendance & Payment stats will be calculated here once the MongoDB Aggregation Pipeline (Phase 2) is complete!</p>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
}
