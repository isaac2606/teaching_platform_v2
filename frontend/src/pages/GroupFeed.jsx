import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function GroupFeed() {
  const { id } = useParams();
  
  // 1. FIXED: Added [] so it defaults to an empty array before the data loads
  const [feed, setFeed] = useState([]);
  const [group, setGroup] = useState({});

  useEffect(() => {
    const getFeed = async () => {
      try {
        const response = await api.get(`/anouncement/group/${id}`);
        setFeed(response.data);
      } catch (err) {
        console.error(err.message);
      }
    };

  
    const getGroup = async () =>{
      try{
        const response = await api.get(`/group/${id}`);
        setGroup(response.data);
      } catch (err) {
        console.error(err.message);
      }
      }
      getFeed();
      getGroup();
    
  
    
  }, [id]); 

  return (
    <div className="flex-1 min-h-screen bg-bg-base p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 bg-bg-surface p-6 rounded-xl border border-white/5 shadow-lg">
        <p className="text-xs font-semibold tracking-widest text-brand-primary uppercase mb-1">
          Announcements
        </p>
        <h1 className="text-3xl font-bold text-white">{group.title}</h1>
        <div className="mt-4 h-px bg-white/10" />
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        {feed.length === 0 ? (
           <div className="text-center text-text-secondary py-12 bg-bg-surface rounded-xl border border-white/5">
             No announcements yet!
           </div>
        ) : (
          feed.map((announcement, index) => (
            <div
              key={announcement._id || index}
              className="bg-bg-surface rounded-xl px-6 py-5 border border-white/5 hover:border-brand-primary/50 transition-colors shadow-lg"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-brand-primary">
                  #{String(index + 1).padStart(2, "0")}
                </p>
                <p className="text-xs text-text-secondary">
                   {new Date(announcement.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* 3. FIXED: Using announcement.title and announcement.description instead of just rendering the object */}
              <h3 className="text-lg font-bold text-white mb-2">{announcement.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{announcement.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
