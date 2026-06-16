import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";


export default function GroupFeed() {
  const { id } = useParams();
  const {user}=useContext(AuthContext)
  // 1. FIXED: Added [] so it defaults to an empty array before the data loads
  const [feed, setFeed] = useState([]);
  const [classes, setClasses] = useState([]);
  const [group, setGroup] = useState({});
  const [teacher, setTeacher] = useState({});

  const [newTitle,setNewTitle]= useState("");
  const [newDesc,setNewDesc] = useState("");
  const [date,setDate]= useState("Mon");
  const [time,setTime]= useState("");
  const [file,setFile]= useState(null);
  
  

  useEffect(() => {
    const getFeed = async () => {
      try {
        const response = await api.get(`/announcement/group/${id}`);
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
    };

    const getClasses = async () => {
      try {
        const response = await api.get(`/class/getClasses/${id}`);
        setClasses(response.data);
      } catch (err) {
        console.error(err.message);
      }
    };

    
    getFeed();
    getGroup();
    getClasses();
    
  }, [id]); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

 
  

  const handlePostAnnouncement = async (e)=>{
    e.preventDefault();
    if(!newTitle){
      return;
    }
    const formData = new FormData();

    formData.append("title",newTitle)
    formData.append("description",newDesc)
    formData.append("groupsIds",id)

    
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

      // FIXED: Backend returns "announcement" (one 'n')
      setFeed([response.data.announcement, ...feed])
    }catch(err){
      console.error(err.message)
    }

    
  }
  

  /*/ //////////////////////   CLASS        ///////////////////////*/

  
  const handleClass = async (e)=>{
    e.preventDefault();
    if(!newTitle){
      return;
    }
    const formData = new FormData();

    formData.append("title",newTitle)
    formData.append("groupId",id)


    if(date || time){
      let formattedDateTime = date;
      if (date && time) {
          // Convert 24h to 12h AM/PM
          const [hourStr, minuteStr] = time.split(":");
          let hour = parseInt(hourStr, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          hour = hour % 12;
          hour = hour ? hour : 12; // the hour '0' should be '12'
          formattedDateTime = `${date} at ${hour}:${minuteStr} ${ampm}`;
      } else if (time) {
          formattedDateTime = time;
      }
      formData.append("date", formattedDateTime);
    }
    if(file){
      formData.append("imageUrl",file);

    }
    try{
      const response = await api.post("/class/createClass",formData,{
        headers:{
          "Content-Type":"multipart/form-data"
        }
      });

      setNewTitle("");
      setDate("")
      setFile(null);
      setIsClassModalOpen(false); // FIXED: Close the correct modal

      // FIXED: The backend directly returns the saved object, so it's just response.data
      setClasses([...classes, response.data])
    }catch(err){
      console.error(err.message)
    }
  }



  return (
    <div className="flex-1 min-h-screen bg-bg-base p-4 sm:p-8 relative">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-bg-surface to-bg-base border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        {/* decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider rounded-full border border-brand-primary/30">
              Group Workspace
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
            {group.title || "Loading..."}
          </h1>
          <p className="text-text-secondary mt-2 font-medium">
            Taught by: <span className="text-white">{group.teacher?.username || "Unknown"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          {user.role === "teacher" && (
            <>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 md:flex-none bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
              >
                + Announcement
              </button>
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2.5 rounded-xl font-bold transition-all backdrop-blur-md hover:-translate-y-0.5"
              >
                + Class
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Announcements Feed */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-brand-primary">📢</span> Latest Announcements
            </h2>
            <span className="text-sm text-text-secondary font-medium">{feed.length} updates</span>
          </div>

          {feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-text-secondary py-20 bg-bg-surface/50 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
              <span className="text-5xl mb-4 opacity-40 hover:scale-110 transition-transform cursor-default">📭</span>
              <p className="text-lg font-medium text-white/70">No announcements yet.</p>
              {user.role === "teacher" && <p className="text-sm mt-2 opacity-50">Click "+ Announcement" to share an update with your students.</p>}
            </div>
          ) : (
            feed.map((announcement, index) => (
              <div
                key={announcement._id || index}
                className="group bg-bg-surface rounded-2xl p-6 md:p-8 border border-white/5 hover:border-brand-primary/40 transition-all duration-300 shadow-xl hover:shadow-brand-primary/5 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {group.teacher?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-wide">{group.teacher?.username || "Teacher"}</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {new Date(announcement.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-brand-primary/60 bg-brand-primary/10 px-2.5 py-1 rounded-md border border-brand-primary/20">
                    #{String(feed.length - index).padStart(2, "0")}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 relative z-10 leading-tight">{announcement.title}</h3>
                <p className="text-text-secondary text-base leading-relaxed mb-6 relative z-10 whitespace-pre-wrap">{announcement.description}</p>

                {announcement.imageUrl && (
                  <div className="mt-4 relative z-10 border-t border-white/5 pt-5">
                    <a 
                      href={`http://localhost:3000/images/${announcement.imageUrl}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/40 text-white hover:text-brand-primary rounded-xl transition-all duration-300 text-sm font-semibold group/btn"
                    >
                      <span className="text-brand-primary group-hover/btn:scale-125 group-hover/btn:-rotate-12 transition-all duration-300">📎</span> 
                      View Attached Resource
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Column: Classes & Info */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-brand-primary">📅</span> Upcoming Classes
            </h2>
          </div>

          {classes.length === 0 ? (
             <div className="text-center text-text-secondary py-12 bg-bg-surface/50 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner">
               <span className="text-4xl mb-3 opacity-30 block">🗓️</span>
               <p className="text-sm">No classes scheduled yet.</p>
             </div>
          ) : (
            <div className="flex flex-col gap-4">
              {classes.map((c, index) => (
                <div key={c._id || index} className="group bg-bg-surface p-5 rounded-2xl border border-white/5 hover:border-brand-primary/40 transition-all duration-300 shadow-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{c.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-sm">
                      <span className="text-brand-primary">🕒</span> {c.date || "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                    <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                      <span className="text-brand-primary">👥</span> {c.students?.length || 0} enrolled
                    </p>
                    <button className="text-xs font-bold text-brand-primary hover:text-white transition-colors">
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enrolled Students Widget */}
          <div className="flex items-center justify-between mt-4 mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-brand-primary">👥</span> Enrolled Students
            </h2>
            <span className="text-sm text-text-secondary font-medium">{group.students?.length || 0} total</span>
          </div>

          <div className="bg-bg-surface/50 rounded-2xl border border-white/5 shadow-inner p-2 max-h-[350px] overflow-y-auto">
            {!group.students || group.students.length === 0 ? (
              <div className="text-center text-text-secondary py-8">
                <span className="text-3xl mb-2 opacity-30 block">🧑‍🎓</span>
                <p className="text-sm">No students joined yet.</p>
                {user.role === "teacher" && <p className="text-xs mt-1">Share the invite link!</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {group.students.map((student) => (
                  <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                      {student.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{student.username}</p>
                      <p className="text-xs text-text-secondary truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Announcement Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg relative transform transition-all scale-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create Announcement</h2>
            <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-5">
              <input
                type="text"
                placeholder="Announcement Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                required
              />
              <textarea
                placeholder="Type your announcement description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white min-h-[120px] focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none"
              />
              <div className="flex justify-between items-center mt-4">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer transition-colors"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS Modal Overlay */}
      {isClassModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg relative transform transition-all scale-100">
            <button 
              onClick={() => setIsClassModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Create a new Class</h2>
            <form onSubmit={handleClass} className="flex flex-col gap-5">
              <input
                type="text"
                placeholder="Class Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                required
              />
              
              <div className="flex flex-col gap-3 mt-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Select Day</label>
                <div className="grid grid-cols-7 gap-1.5 bg-black/20 p-2 rounded-2xl border border-white/10">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setDate(day)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                        date === day 
                          ? "bg-brand-primary text-white shadow-md scale-105" 
                          : "text-text-secondary hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Select Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors cursor-pointer appearance-none"
                  style={{ colorScheme: 'dark' }} 
                  required
                />
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer transition-colors"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
