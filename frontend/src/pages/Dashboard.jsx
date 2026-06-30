import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import HubCard from "../components/HubCard";

export default function Dashboard() {
  const data = useLoaderData();
  
  // React Router v7 Loader Data
  const hubs = data?.hubs || [];
  //const stats = data?.stats || { totalStudents: 0, activeHubs: 0, outstandingDues: 0, sessionsToday: 0 };
  const isTeacher = data?.role === "teacher";

  // Local state for fast UI updates (though we should eventually move to React 19 Actions)
  const [localHubs, setLocalHubs] = useState(hubs);
  const [newHubTitle, setNewHubTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateHub = async () => {
      if (!newHubTitle.trim()) return;
      setIsCreating(true);
      try {
          const response = await api.post("/hub", { title: newHubTitle });
          
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
          await api.delete(`/hub/${id}`);
          setLocalHubs(localHubs.filter(h => h._id !== id));
      } catch (err) {
          console.error("Failed to delete hub", err);
      }
  };

  return (
    <div className="p-8 min-h-screen text-text-primary font-sans flex-1 bg-bg-base transition-colors duration-300">
        
        

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 bg-bg-surface border border-border-subtle p-6 rounded-xl shadow-md transition-colors">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
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
                <HubCard 
                    key={hub._id} 
                    hub={hub} 
                    onDelete={handleDeleteHub}
                />
            ))}

            {localHubs.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-text-secondary py-16 bg-bg-surface border border-border-subtle rounded-xl shadow-sm">
                    <span className="text-4xl mb-4 opacity-50">🏢</span>
                    <p>No Hubs found. Create your first subject category!</p>
                </div>
            )}
        </div>
        
    </div>
  );
}