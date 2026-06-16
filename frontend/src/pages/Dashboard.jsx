import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Dashboard() {
  const data = useLoaderData();
  
  // React Router v7 Loader Data
  const hubs = data?.hubs || [];
  const stats = data?.stats || { totalStudents: 0, activeHubs: 0, outstandingDues: 0, sessionsToday: 0 };
  const isTeacher = data?.role === "teacher";

  // Local state for fast UI updates (though we should eventually move to React 19 Actions)
  const [localHubs, setLocalHubs] = useState(hubs);
  const [newHubTitle, setNewHubTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateHub = async () => {
      if (!newHubTitle.trim()) return;
      setIsCreating(true);
      try {
          const response = await api.post("/group", { title: newHubTitle });
          setLocalHubs([...localHubs, response.data]);
          setNewHubTitle("");
      } catch (err) {
          console.error("Failed to create hub", err);
      } finally {
          setIsCreating(false);
      }
  };

  const handleDeleteHub = async (id) => {
      try {
          await api.delete(`/group/${id}`);
          setLocalHubs(localHubs.filter(h => h._id !== id));
      } catch (err) {
          console.error("Failed to delete hub", err);
      }
  };

  return (
    <div className="p-8 min-h-screen text-white font-sans flex-1 bg-bg-base">
        
        {/* STATS BANNER */}
        {isTeacher && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-bg-surface p-6 rounded-xl border border-white/10 flex flex-col justify-between">
                    <p className="text-text-secondary text-sm font-medium mb-2">Total Students</p>
                    <p className="text-3xl font-bold text-white">{stats.totalStudents}</p>
                </div>
                <div className="bg-bg-surface p-6 rounded-xl border border-white/10 flex flex-col justify-between">
                    <p className="text-text-secondary text-sm font-medium mb-2">Active Hubs</p>
                    <p className="text-3xl font-bold text-white">{localHubs.length}</p>
                </div>
                <div className="bg-bg-surface p-6 rounded-xl border border-white/10 flex flex-col justify-between">
                    <p className="text-text-secondary text-sm font-medium mb-2">Outstanding Dues</p>
                    <p className="text-3xl font-bold text-brand-primary">${stats.outstandingDues}</p>
                </div>
                <div className="bg-bg-surface p-6 rounded-xl border border-white/10 flex flex-col justify-between">
                    <p className="text-text-secondary text-sm font-medium mb-2">Sessions Today</p>
                    <p className="text-3xl font-bold text-white">{stats.sessionsToday}</p>
                </div>
            </div>
        )}

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 bg-bg-surface border border-white/5 p-6 rounded-xl shadow-lg backdrop-blur-xl">
            <h1 className="text-3xl font-bold tracking-tight text-white">
                {isTeacher ? "My Teaching Hubs" : "My Enrolled Hubs"}
            </h1>

            {isTeacher && (
                <div className="flex gap-2 w-full lg:w-auto">
                    <Input 
                        type="text"
                        placeholder="Enter new Hub title (e.g. 3ème Math)"
                        className="w-full lg:w-64"
                        value={newHubTitle}
                        onChange={(e) => setNewHubTitle(e.target.value)}
                    />
                    
                    <Button 
                        variant="primary"
                        onClick={handleCreateHub}
                        disabled={isCreating}
                    > 
                        {isCreating ? "Creating..." : "Create Hub"}
                    </Button>
                </div>
            )}
        </div>

        {/* HUB MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {localHubs.map((hub) => (
                <div key={hub._id} className="relative glass-panel group-hover-trigger overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/20 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/5 opacity-50"></div>
                    
                    <div className="relative p-6 flex flex-col h-48 justify-between">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-primary capitalize border border-brand-primary/20">
                                {hub.classes?.length || 0} Cohorts
                            </div>
                            {isTeacher && (
                                <button 
                                    className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                    onClick={() => handleDeleteHub(hub._id)}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            )}
                        </div>

                        <div className="text-center my-4">
                            <h3 className="text-2xl font-bold text-white capitalize truncate drop-shadow-md">
                                {hub.title}
                            </h3>
                        </div>

                        <div className="flex justify-center mt-auto w-full">
                            <Link to={`/groupFeed/${hub._id}`} className="w-full">
                                <Button className="w-full" variant="secondary">
                                    Open Workspace
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>    
            ))}

            {localHubs.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-text-secondary py-16 bg-bg-surface border border-white/5 rounded-xl">
                    <span className="text-4xl mb-4 opacity-50">🏢</span>
                    <p>No Hubs found. Create your first subject category!</p>
                </div>
            )}
        </div>
        
    </div>
  );
}