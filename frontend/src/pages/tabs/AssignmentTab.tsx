// @ts-nocheck
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function AssignmentTab() {
  const { hubId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [type, setType] = useState("assignment");
  const [totalPoints, setTotalPoints] = useState(100);
  const [file, setFile] = useState(null);

  const isTeacher = user?.role === "teacher";

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/assignment/hub/${hubId}`);
        setAssignments(res.data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (hubId) {
      fetchAssignments();
    }
  }, [hubId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("type", type);
    formData.append("totalPoints", totalPoints);
    formData.append("hubId", hubId);
    
    if (file) {
      formData.append("image", file);
    }

    try {
      const response = await api.post("/assignment/create", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setAssignments([response.data.assignment, ...assignments]);
      setIsModalOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setType("assignment");
      setTotalPoints(100);
      setFile(null);
    } catch (err) {
      console.error("Failed to create assignment", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-text-secondary">Loading assignments...</div>;
  }

  return (
    <div className="p-4 sm:p-8 relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Assignments & Homework</h2>
          <p className="text-text-secondary mt-1">Track and manage student coursework.</p>
        </div>
        
        {isTeacher && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Create Task
          </button>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-bg-surface/50 rounded-2xl border border-white/5 shadow-inner">
          <span className="text-5xl block mb-4 opacity-40">📝</span>
          <h3 className="text-xl font-bold text-text-primary mb-2">No assignments yet</h3>
          <p className="text-text-secondary">
            {isTeacher 
              ? "Create the first assignment or homework for this class." 
              : "When your teacher posts an assignment, it will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map(assignment => (
            <div key={assignment._id} className="bg-bg-surface p-6 rounded-2xl border border-white/10 hover:border-brand-primary/50 transition-all shadow-lg flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  assignment.type === 'exam' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  assignment.type === 'homework' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {assignment.type}
                </span>
                <span className="text-text-secondary text-sm font-medium">
                  {assignment.totalPoints} pts
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-text-primary mb-2 line-clamp-2">{assignment.title}</h3>
              <p className="text-text-secondary text-sm mb-6 line-clamp-3 flex-1">{assignment.description}</p>
              
              <div className="mt-auto border-t border-white/10 pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </div>
                <button className="text-brand-primary font-bold hover:text-white transition-colors text-sm">
                  View →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-bg-surface p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-xl relative transform transition-all scale-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Create New Task</h2>
            
            <form onSubmit={handleCreateAssignment} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all"
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Description / Instructions</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[100px] focus:outline-none focus:border-brand-primary transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
                    style={{ colorScheme: 'dark' }}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Task Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="homework">Homework</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Total Points</label>
                  <input
                    type="number"
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(parseInt(e.target.value))}
                    min="1"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 block">Attachment (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-sm text-text-secondary file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer transition-colors pt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
                >
                  Post Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
