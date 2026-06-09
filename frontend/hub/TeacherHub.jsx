import { useState, useMemo } from "react";
import CourseCard from "./courseCard";
import { useHubs } from "../src/hooks/useHubs";
import Button from "../src/components/ui/Button";
import Input from "../src/components/ui/Input";

const INITIAL_HUBS = [
    { id: "1", title: "math", status: "not done", messages:["hello","hi","test"] },
    { id: "2", title: "svt", status: "done" },
    { id: "3", title: "eco", status: "not done" }
];

export default function TeacherHub() {
    const { hubs, addHub, editHub, deleteHub } = useHubs(INITIAL_HUBS);
    const [newHub, setNewHub] = useState("");
    const [filter, setFilter] = useState("all");
    
    const filteredHubs = useMemo(() => {
        if (filter === "all") return hubs;
        return hubs.filter(hub => hub.status === filter);
    }, [hubs, filter]);

    const filters = ["all", "done", "not done"];

    return (
        <div className="p-8 min-h-screen text-text-primary font-sans flex-1 bg-bg-base">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 glass-panel p-6">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    My Hubs
                </h1>
                
                <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                    {filters.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all duration-200 ${
                                filter === f ? "bg-white/10 text-white shadow-sm" : "text-text-secondary hover:text-white"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 w-full lg:w-auto">
                    <Input 
                        placeholder="Enter new hub name"
                        value={newHub}
                        onChange={(e) => setNewHub(e.target.value)}
                        className="w-full lg:w-64"
                    />
                    <Button 
                        onClick={() => {
                            addHub(newHub);
                            setNewHub("");
                        }}
                    > 
                        Create
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredHubs.map((hub) => (
                    <CourseCard 
                        key={hub.id} 
                        hub={hub} 
                        onDelete={deleteHub} 
                        onEdit={editHub} 
                    />    
                ))}
                {filteredHubs.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center text-text-secondary py-16 glass-panel">
                        <span className="text-4xl mb-2">📚</span>
                        <p>No hubs found for the selected filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}