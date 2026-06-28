import { useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import api from  "../../services/api"
import { useContext , useEffect } from "react";
import { AuthContext  } from "../../context/AuthContext";

export default function FeedTab(){

    
    const hub = useRouteLoaderData("hub-workspace");
    
    const [feed, setFeed] = useState([]);
    const [newTitle,setNewTitle]= useState("");
    const [newDesc,setNewDesc] = useState("");
    const [file,setFile]= useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {user} = useContext(AuthContext)
    
    useEffect(() => {
        const getFeed = async () => {
            try {
                const response = await api.get(`/announcement/hub/${hub._id}`);
                setFeed(response.data);
            } catch (err) {
                console.error(err.message);
            }
        };
        getFeed();
    }, [hub._id]);

    const [isUploading, setIsUploading] = useState(false);

    const handlePostAnnouncement = async (e)=>{
        e.preventDefault();
        if(!newTitle){
        return;
        }
        
        setIsUploading(true);
        const formData = new FormData();

        formData.append("title",newTitle)
        formData.append("description",newDesc)
        formData.append("hubIds", hub._id);

        if(file){
        formData.append("image",file);

        }
        try{
        const response = await api.post("/announcement/add",formData,{
            headers:{
            "Content-Type":"multipart/form-data"
            }
        });

        setNewTitle("");
        setNewDesc("");
        setFile(null);
        setIsModalOpen(false);

        
        setFeed([response.data.announcement, ...feed])
        }catch(err){
        console.error(err.message)
        } finally {
        setIsUploading(false);
        }
    }
    return (
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          { user.role ==="teacher" && (
            
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
              >
                + Announcement
              </button> 
            
          )}
        </div>
            {/* Left Column: Announcements Feed */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <span className="text-brand-primary">📢</span> Latest Announcements
                </h2>
                <span className="text-sm text-text-secondary font-medium">{feed.length} updates</span>
            </div>

            {feed.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-text-secondary py-20 bg-bg-surface/50 rounded-2xl border border-border-subtle backdrop-blur-sm shadow-inner transition-colors">
                    <span className="text-5xl mb-4 opacity-40 hover:scale-110 transition-transform cursor-default">📭</span>
                    <p className="text-lg font-medium text-text-primary/70">No announcements yet.</p>
                    {user.role === "teacher" && <p className="text-sm mt-2 opacity-50 text-text-secondary">Click "+ Announcement" to share an update with your students.</p>}
                </div>
            ) : (
                feed.map((announcement, index) => (
                    <div
                        key={announcement._id || index}
                        className="group bg-bg-surface rounded-2xl p-6 md:p-8 border border-border-subtle hover:border-brand-primary/40 transition-all duration-300 shadow-lg hover:shadow-brand-primary/5 hover:-translate-y-1 relative overflow-hidden"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-5 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {hub.teacher?.username?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-text-primary tracking-wide">{hub.teacher?.username || "Teacher"}</p>
                                    <p className="text-xs text-text-secondary mt-0.5">
                                        {new Date(announcement.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-brand-primary/60 bg-brand-primary/10 px-2.5 py-1 rounded-md border border-brand-primary/20">
                                #{String(feed.length - index).padStart(2, "0")}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-text-primary mb-3 relative z-10 leading-tight">{announcement.title}</h3>
                        <p className="text-text-secondary text-base leading-relaxed mb-6 relative z-10 whitespace-pre-wrap">{announcement.description}</p>

                        {announcement.imageUrl && (
                            <div className="mt-4 relative z-10 border-t border-border-subtle pt-5">
                                <a 
                                    href={announcement.imageUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-3 px-5 py-3 bg-black/5 dark:bg-white/5 hover:bg-brand-primary/10 border border-border-subtle hover:border-brand-primary/40 text-text-primary hover:text-brand-primary rounded-xl transition-all duration-300 text-sm font-semibold group/btn"
                                >
                                    <span className="text-brand-primary group-hover/btn:scale-125 group-hover/btn:-rotate-12 transition-all duration-300">📎</span> 
                                    View Attached Resource
                                </a>
                            </div>
                        )}
                    </div>
                ))
            )}

                        {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface p-8 rounded-3xl border border-border-subtle shadow-2xl w-full max-w-lg relative transform transition-all scale-100">
                        <button 
                        onClick={() => setIsModalOpen(false)}
                        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
                        >
                        ✕
                        </button>
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Create Announcement</h2>
                        <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-5">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                            required
                        />
                        <textarea
                            placeholder="Type your announcement description..."
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary min-h-[120px] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
                        />
                        <div className="flex justify-between items-center mt-4">
                            <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer transition-colors"
                            />
                            <button
                            type="submit"
                            disabled={isUploading}
                            className={`bg-brand-primary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-brand-secondary hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5'}`}
                            >
                            {isUploading ? "Uploading..." : "Post"}
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                )}
        </div>
    )

}