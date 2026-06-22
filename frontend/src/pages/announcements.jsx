

export default function Announcements({ feed = [] }) {
    return (
        <div>
            {feed.map((announcement, index) => (
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
                  
                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white mb-2">{announcement.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed mb-4">{announcement.description}</p>
    
                  {/* Render Uploaded File */}
                  {announcement.imageUrl && (
                    <div className="mt-4 border-t border-white/5 pt-4">
                      <a 
                        href={`http://localhost:3000/images/${announcement.imageUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-colors text-sm font-medium"
                      >
                        📎 View Attached File
                      </a>
                    </div>
                  )}
                  
                  {/* Teacher Info */}
                  <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
                    <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-xs text-brand-primary font-bold">
                      {announcement.teacher?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-xs text-text-secondary font-medium">
                      Posted by {announcement.teacher || "Unknown Teacher"}
                    </span>
                  </div>
                </div>
            ))}
        </div>
    );
}