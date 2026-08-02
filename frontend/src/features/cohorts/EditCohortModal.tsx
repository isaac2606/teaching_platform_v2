import { useState } from "react";
import api from "../../services/api";

export default function EditCohortModal({  onClose, group, onEdit}) {
  
    const parseScheduleString = (combinedSchedule) => {
        // If the schedule is empty or invalid, return safe defaults
        if (!combinedSchedule || !combinedSchedule.includes(" at ")) {
            return { dayOfWeek: "Monday", time: "14:00" }; 
        }
        
        // Split the string into ["Mondays", "14:00"]
        const parts = combinedSchedule.split(" at ");
        
        // Get the day and remove the trailing "s" (e.g. "Mondays" -> "Monday")
        let day = parts[0].trim();
        if (day.endsWith("s")) {
            day = day.slice(0, -1);
        }
        
        return {
            dayOfWeek: day,
            time: parts[1].trim()
        };
    };

    const {dayOfWeek,time} =parseScheduleString(group.combinedSchedule)
  
  
    const [formData, setFormData] = useState({
        title: group.title,
        dayOfWeek: dayOfWeek,
        time: time,
        duration: group.duration,
        type: group.type
    });
    
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const combinedSchedule = `${formData.dayOfWeek}s at ${formData.time}`;

      const data = {
        title: formData.title,
        date: combinedSchedule,
        duration: formData.duration,
        type: formData.type
      };

      const response = await api.put(`/class/editClass/${group._id}`, data, {
        headers: { "Content-Type": "application/json" },
      });

      onEdit(response.data);
      onClose();
      // Reset form
      setFormData({
        title: "",
        dayOfWeek: "Monday",
        time: "14:00",
        duration: "2 hours",
        type: "In Person",
        
      });
      setErrorMessage("")
    } catch (err) {
      console.error("Failed to edit cohort/group", err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface p-8 rounded-3xl border border-border-subtle shadow-2xl w-full max-w-xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Edit Group (Cohort)</h2>
        
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-text-secondary font-semibold mb-1 block">Group Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-text-secondary font-semibold mb-1 block">Day of the Week</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-text-secondary font-semibold mb-1 block">Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                required
              />
            </div>
            
            <div>
              <label className="text-sm text-text-secondary font-semibold mb-1 block">Duration</label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none"
              >
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
                <option value="2.5 hours">2.5 hours</option>
                <option value="3 hours">3 hours</option>
                <option value="4 hours">4 hours</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary font-semibold mb-1 block">Location Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-bg-base border border-border-subtle rounded-xl px-5 py-3 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all appearance-none"
              >
                <option value="In Person">In Person</option>
                <option value="Live Video">Live Video</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-brand-primary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(var(--brand-primary),0.3)] ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-brand-secondary hover:shadow-[0_0_25px_rgba(var(--brand-primary),0.5)] hover:-translate-y-0.5"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}