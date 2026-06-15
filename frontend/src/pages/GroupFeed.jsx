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

  const [newTitle,setNewTitle]= useState("");
  const [newDesc,setNewDesc] = useState("");
  const [date,setDate]= useState("Mon");
  const [time,setTime]= useState("");
  const [file,setFile]= useState(null);
  
  const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    <div className="flex-1 min-h-screen bg-bg-base p-8 relative">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8 bg-bg-surface p-6 rounded-xl border border-white/5 shadow-lg flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand-primary uppercase mb-1">
            Announcements
          </p>
          <h1 className="text-3xl font-bold text-white">{group.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user.role === "teacher" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              + Post
            </button>
          )}
          {user.role === "teacher" && (
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg"
            >
              + Class
            </button>
          )}
        </div>
      </div>

      {/* anouncement Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center ">
          <div className="bg-bg-surface p-6 rounded-xl border border-white/10 shadow-2xl w-full max-w-lg relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Create Announcement</h2>
            <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Announcement Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                required
              />
              <textarea
                placeholder="Type your announcement description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[100px] focus:outline-none focus:border-brand-primary"
              />
              <div className="flex justify-between items-center mt-2">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center ">
          <div className="bg-bg-surface p-6 rounded-xl border border-white/10 shadow-2xl w-full max-w-lg relative">
            <button 
              onClick={() => setIsClassModalOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Create a new Class</h2>
            <form onSubmit={handleClass} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Class Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-primary"
                required
              />
              <div className="flex flex-col gap-3 my-2">
                <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Select Day</label>
                <div className="grid grid-cols-7 gap-1 bg-black/20 p-1.5 rounded-xl border border-white/10">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => setDate(day)}
                      className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        date === day 
                          ? "bg-brand-primary text-white shadow-md" 
                          : "text-text-secondary hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-2">
                <label className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Select Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors cursor-pointer appearance-none"
                  style={{ colorScheme: 'dark' }} 
                  required
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Classes List */}
      {classes.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Classes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((c, index) => (
              <div key={c._id || index} className="bg-bg-surface p-4 rounded-xl border border-white/5 hover:border-brand-primary/50 transition-colors cursor-pointer shadow-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                  {c.date && <span className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-full">{c.date}</span>}
                </div>
                <p className="text-xs text-text-secondary">Students assigned: {c.students?.length || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Annoucement Feed */}
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
                  Posted by {announcement.teacher?.email || "Unknown Teacher"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
