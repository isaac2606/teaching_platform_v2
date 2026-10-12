// @ts-nocheck
import { useState } from "react";
import HubCard from "../features/hubs/HubCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StudentDashboard() {
  const queryClient = useQueryClient();
  const [newHubTitle, setNewHubTitle] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: hubs = [], isLoading, error } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => {
      const response = await api.get("/hub/my-hubs");
      return response.data;
    }
  });

  const joinHubMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post(`/hub/join/${token}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubs"] });
      setNewHubTitle("");
    },
    onError: (err: any) => {
      console.error("Failed to join", err);
      alert(err.response?.data?.message || err.response?.data || err.message);
    }
  });

  // Filter hubs based on the active filter state
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
                    disabled={joinHubMutation.isPending}
                    onClick={() => {
                        const token = newHubTitle.trim();
                        if (token) {
                            joinHubMutation.mutate(token);
                        }
                    }}
                > 
                    {joinHubMutation.isPending ? "Joining..." : "Join"}
                </Button>
            </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
                Failed to load hubs: {error instanceof Error ? error.message : "Error loading hubs"}
            </div>
        )}

        {isLoading ? (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHubs.map((hub) => (
                    <HubCard key={hub._id} hub={hub} />   
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