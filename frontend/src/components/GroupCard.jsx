import { useState, memo } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";

const GroupCard = memo(function GroupCard({ group, onDelete, onEdit }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState("");

    return(
        <div className="relative glass-panel group-hover-trigger overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-brand-primary/20 hover:-translate-y-1">
            {/* Dynamic Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/5 opacity-50"></div>
            
            <div className="relative p-6 flex flex-col h-48 justify-between">
                
                {/* Header / Actions */}
                <div className="flex justify-between items-start">
                    <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-semibold text-brand-primary capitalize border border-brand-primary/20">
                        {group.status || "active"}
                    </div>
                    <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                        <button 
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            onClick={() => {
                                setIsEditing(true);
                                setEditValue(group.title);
                            }}
                        >
                            {/* Simple SVG Edit Icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>
                        <button 
                            className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            onClick={() => onDelete(group._id)}
                        >
                            {/* Simple SVG Delete Icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center my-4">
                    <h3 className="text-2xl font-bold text-white capitalize truncate drop-shadow-md">
                        {group.title}
                    </h3>
                </div>

                {/* Footer Action */}
                <div className="flex justify-center mt-auto w-full">
                    <Link to={`/groupFeed/${group._id}`} className="w-full">
                        <Button className="w-full" variant="secondary">
                            View Feed
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Edit Modal Overlay */}
            {isEditing && (
                <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4">
                    <Input 
                        placeholder="Group Title"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full mb-3"
                        autoFocus
                    />
                    <div className="flex gap-2 w-full">
                        <Button 
                            variant="primary" 
                            className="flex-1"
                            onClick={() => {
                                onEdit(group._id, editValue);
                                setIsEditing(false);
                            }}
                        >
                            Save
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="flex-1"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default GroupCard;
