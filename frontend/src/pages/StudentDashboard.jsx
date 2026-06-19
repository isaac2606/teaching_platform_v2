import { useState,useContext,useEffect } from "react";
import HubCard from "../components/HubCard";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../services/api";

import { AuthContext } from "../context/AuthContext";


export default function StudentDashboard() {
  //const { groups, addGroup, deleteGroup, editGroup, loading, error } = useGroups([]);
  const [newHubTitle, setNewHubTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false) 
  const [error, setError] = useState(null)

  const [hubs,setHubs]=useState([])

  const {user}= useContext(AuthContext);

 
  useEffect(()=>{
        const getStudentHubs = async () => {
            try{
                // Uses the new unified route. Backend knows we are a student from the token.
                const response = await api.get(`/hub/my-hubs`)
                setHubs(response.data);

            }catch(err){
                console.error(err.message)
            }
        }
        getStudentHubs();

    }
  ,[user])

  //Filter hubs based on the active filter state
  const filteredHubs = hubs?.filter((hub) => {
    if (filter === "all") return true;
    return hub.status === filter;
  }) || [];

  const filters = ["all", "done", "not done"];
    
  return (
    <div className="p-8 min-h-screen text-text-primary font-sans flex-1 bg-bg-base transition-colors duration-300">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 bg-bg-surface border border-border-subtle p-6 rounded-xl shadow-md transition-colors">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                My Hubs
            </h1>
            
            <div className="flex bg-black/5 dark:bg-black/20 p-1 rounded-lg border border-border-subtle">
                {filters.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                            filter === f 
                            ? "bg-brand-primary text-white shadow-sm" 
                            : "text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 w-full lg:w-auto">
                <Input 
                    type="text"
                    placeholder="Enter invite Link to join a new hub"
                    className="w-full lg:w-64"
                    value={newHubTitle}
                    onChange={(e) => setNewHubTitle(e.target.value)}
                />
                
                <Button 
                    variant="primary"
                    onClick={async () => {
                            try {
                                const token = newHubTitle.trim();
                                await api.post(`/hub/join/${token}`);
                                setNewHubTitle("");
                                window.location.reload();
                                
                            } catch (err) {
                                console.error("Failed to join ", err);
                                alert(err.response?.data || err.message);
                            }
                        }}
                > 
                    Join
                </Button>
            </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                Failed to load hubs: {error}
            </div>
        )}

        {loading ? (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHubs.map((hub) => (
                    
                    <HubCard key={hub._id} hub={hub}  />   

                ))}

                {filteredHubs.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-text-secondary py-16 bg-bg-surface border border-border-subtle rounded-xl shadow-sm">
                        <span className="text-4xl mb-4 opacity-50">📚</span>
                        <p>No hubs found for the selected filter.</p>
                    </div>
                )}
            </div>
        )}
        
    </div>
  );
}