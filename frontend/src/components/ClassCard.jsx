import { useState, memo,useContext } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Toast from "./ui/Toast";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api"

const ClassCard = memo(function ClassCard({ group, onDelete, onEdit, onUpdate }) {
    const {user} = useContext(AuthContext);
    const [addValue,setAddValue] = useState("")
    const [show,setShow]= useState(false)
    const [errorMsg, setErrorMsg] = useState("");
    const [toastMsg, setToastMsg] = useState("");

    const handleCopy = () => {
        navigator.clipboard.writeText(`http://localhost:5173/join/${group.inviteToken}`)
        setToastMsg("Invite link copied to clipboard!");
    }

    const handleAddStudent = async (e)=>{
        e.preventDefault();
        setErrorMsg("");
        try{
            const response = await api.post(`/class/${group._id}/assign`,{
                studentId:addValue
            })
            setAddValue("");
            setShow(false);
            setToastMsg("Student successfully added to the group!");
            if (onUpdate && response.data.class) {
                onUpdate(response.data.class);
            }
        }catch(err){
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setErrorMsg(err.response.data.message);
            } else {
                setErrorMsg("Invalid ID or unexpected error.");
            }
        }
        
    }
    
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
                        {user.role === "teacher" && <button 
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center justify-center"
                            onClick={() => {
                                setShow(true);
                                setErrorMsg("");
                            }}
                            title="Assign Student to Group"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        </button>}
                        {user.role === "teacher" && <button 
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center justify-center"
                            onClick={handleCopy}
                            title="Copy Invite Link"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        </button>}
                        {user.role === "teacher" && <button 
                            className="p-1.5 text-text-secondary hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            onClick={() => onEdit(group)}
                        >
                            {/* Simple SVG Edit Icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </button>}
                        {user.role === "teacher" && <button 
                            className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            onClick={() => onDelete(group._id)}
                        >
                            {/* Simple SVG Delete Icon */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button> }
                        
                    </div>
                </div>

                <div className="text-center my-4">
                    <h3 className="text-2xl font-bold text-white capitalize truncate drop-shadow-md">
                        {group.title || "test"}
                    </h3>
                    
                    {/* Optional Schedule Details for Cohort View */}
                    {group.date && (
                        <div className="flex flex-col gap-1 mt-3 items-center text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {group.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {group.duration || "1h 00m"}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {group.students ? group.students.length : 0} Enrolled
                            </span>
                        </div>
                    )}
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
            {show && (
                <div className="absolute inset-0 bg-bg-surface/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-5">
                    {errorMsg && (
                        <div className="w-full mb-3 text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/30 p-2 rounded-lg text-center">
                            {errorMsg}
                        </div>
                    )}
                    <input 
                        placeholder="Enter Student Id..."
                        value={addValue}
                        onChange={(e) => setAddValue(e.target.value)}
                        className={`w-full mb-4 px-4 py-2 border rounded-xl bg-bg-base text-text-primary focus:outline-none transition-colors ${errorMsg ? 'border-red-500 focus:border-red-500' : 'border-border-subtle focus:border-brand-primary'}`}
                        autoFocus
                    />
                    <div className="flex gap-2 w-full">
                        <button 
                            className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-2 rounded-xl font-bold transition-colors"
                            onClick={handleAddStudent}
                        >
                            Add Student
                        </button>
                        <button 
                            className="flex-1 bg-white/5 border border-border-subtle hover:bg-white/10 text-text-primary py-2 rounded-xl font-bold transition-colors"
                            onClick={() => setShow(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            
            <Toast 
                open={!!toastMsg} 
                message={toastMsg} 
                type="success" 
                onClose={() => setToastMsg("")} 
            />
        </div>
    );
});

export default ClassCard;