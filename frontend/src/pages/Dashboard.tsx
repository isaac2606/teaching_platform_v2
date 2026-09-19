// @ts-nocheck
import { useState } from "react";

import { Link, useLoaderData } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import HubCard from "../features/hubs/HubCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const data = useLoaderData();
  const queryClient = useQueryClient();
  
  const isTeacher = data?.role === "teacher";

  const [newHubTitle, setNewHubTitle] = useState("");

  const { data: hubs = [], isLoading } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => {
        const res = await api.get("/hub/my-hubs");
        return res.data;
    }
  });
  
  const createHubMutation = useMutation({
    mutationFn: async (titleToCreate: string) => {
        const res = await api.post("/hub", { title: titleToCreate });
        return res.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['hubs'] });
        setNewHubTitle("");
    }
  });

  const deleteHubMutation = useMutation({
    mutationFn: async (id: string) => {
        await api.delete(`/hub/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['hubs'] });
    }
  });

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
                        onClick={() => createHubMutation.mutate(newHubTitle)}
                        disabled={createHubMutation.isPending}
                    > 
                        {createHubMutation.isPending ? "Creating..." : "Create Hub"}
                    </Button>
                </div>
            )}
        </div>

        {/* HUB MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {hubs.map((hub) => (
                <HubCard 
                    key={hub._id} 
                    hub={hub} 
                    onDelete={(id) => deleteHubMutation.mutate(id)}
                />
            ))}

            {hubs.length === 0 && !isLoading && (
                <div className="col-span-full flex flex-col items-center justify-center text-text-secondary py-16 bg-bg-surface border border-border-subtle rounded-xl shadow-sm">
                    <span className="text-4xl mb-4 opacity-50">🏢</span>
                    <p>No Hubs found. Create your first subject category!</p>
                </div>
            )}
            
            {isLoading && (
                <div className="col-span-full text-center">Loading hubs...</div>
            )}
        </div>
        
    </div>
  );
}