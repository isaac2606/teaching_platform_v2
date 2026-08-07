// @ts-nocheck
import { AuthContext } from "../../context/AuthContext"
import { useContext , useState, useEffect } from "react"
import api from  "../../services/api"
import { useRouteLoaderData } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import StudentCard from "../../features/students/StudentCard";
export default function RosterTab(){
    const { user } = useContext(AuthContext);
    const hub = useRouteLoaderData("hub-workspace");
    const loaderData = useLoaderData();
    
    const [students, setStudents] = useState(loaderData || []);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [hubClasses, setHubClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [attendanceRecord, setAttendanceRecord] = useState({}); // studentId -> status ("present" | "absent")
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAttendanceModalOpen && user?.role === "teacher") {
            const fetchClasses = async () => {
                try {
                    const res = await api.get(`/class/getClasses/${hub._id}`);
                    setHubClasses(res.data);
                    if (res.data.length > 0) setSelectedClassId(res.data[0]._id);
                } catch (err) {
                    console.error("Failed to load classes for attendance", err);
                }
            };
            fetchClasses();

            // Initialize all as present
            const initialRecord = {};
            students.forEach(s => initialRecord[s._id] = "present");
            setAttendanceRecord(initialRecord);
        }
    }, [isAttendanceModalOpen, hub._id, user?.role, students]);

    const handleKickStudent = async (studentId)=>{
        if(!window.confirm("Are you sure you want to remove this student?")) return;
        try{
            await api.put(`/hub/${hub._id}/kick/${studentId}`)
            setStudents(prev => prev.filter(s => s._id !== studentId));
        }catch(err){
            console.error("Error with kicking the student ", err)
            alert(err.response?.data?.message || "Failed to remove student");
        }
    };

    const handleToggleAttendance = (studentId) => {
        setAttendanceRecord(prev => ({
            ...prev,
            [studentId]: prev[studentId] === "present" ? "absent" : "present"
        }));
    };

    const submitAttendance = async (e) => {
        e.preventDefault();
        if (!selectedClassId) return alert("Please select a class session first.");
        
        setIsSubmitting(true);
        try {
            await api.post(`/class/${selectedClassId}/attendance`, {
                records: attendanceRecord
            });
            setIsAttendanceModalOpen(false);
            alert("Attendance recorded successfully!");
        } catch (err) {
            console.error("Failed to record attendance", err);
            alert(err.response?.data?.message || "Failed to record attendance");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                    <span className="text-brand-primary">👥</span> Class Roster
                </h2>
                {user?.role === "teacher" && (
                    <button 
                        onClick={() => setIsAttendanceModalOpen(true)}
                        className="bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                    >
                        Take Attendance
                    </button>
                )}
            </div>

            <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-base border-b border-border-subtle text-text-secondary text-sm">
                                <th className="p-4 font-semibold">Student Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Enrolled</th>
                                {user?.role === "teacher" && <th className="p-4 font-semibold text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-text-secondary">No students enrolled yet.</td>
                                </tr>
                            ) : (
                                students.map(student => (
                                    <tr key={student._id} className="border-b border-border-subtle hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xs">
                                                {student.username?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <span className="font-semibold text-text-primary">{student.username}</span>
                                        </td>
                                        <td className="p-4 text-text-secondary text-sm">{student.email}</td>
                                        <td className="p-4 text-text-secondary text-sm">Active</td>
                                        {user?.role === "teacher" && (
                                            <td className="p-4 text-right">
                                                <button 
                                                    onClick={() => handleKickStudent(student._id)}
                                                    className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded-md text-xs font-bold transition-colors border border-red-500/30"
                                                >
                                                    Kick
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Modal */}
            {isAttendanceModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-surface p-8 rounded-3xl border border-border-subtle shadow-2xl w-full max-w-2xl relative">
                        <button 
                            onClick={() => setIsAttendanceModalOpen(false)}
                            className="absolute top-6 right-6 text-text-secondary hover:text-text-primary text-xl"
                        >✕</button>
                        
                        <h2 className="text-2xl font-bold text-text-primary mb-6">Record Attendance</h2>
                        
                        <form onSubmit={submitAttendance} className="flex flex-col gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-2">Select Class Session</label>
                                <select 
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="w-full bg-bg-base border border-border-subtle rounded-xl px-4 py-3 text-text-primary focus:border-brand-primary outline-none"
                                    required
                                >
                                    <option value="" disabled>Select a class...</option>
                                    {hubClasses.map(cls => (
                                        <option key={cls._id} value={cls._id}>{cls.title} ({cls.date || 'No Date'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="max-h-[40vh] overflow-y-auto border border-border-subtle rounded-xl">
                                <table className="w-full text-left">
                                    <thead className="bg-bg-base sticky top-0">
                                        <tr>
                                            <th className="p-3 text-sm font-semibold text-text-secondary">Student</th>
                                            <th className="p-3 text-sm font-semibold text-text-secondary text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map(student => (
                                            <tr key={student._id} className="border-t border-border-subtle">
                                                <td className="p-3 font-medium text-text-primary">{student.username}</td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAttendance(student._id)}
                                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                                            attendanceRecord[student._id] === 'present' 
                                                            ? 'bg-green-500/20 text-green-600 border border-green-500/30' 
                                                            : 'bg-red-500/20 text-red-600 border border-red-500/30'
                                                        }`}
                                                    >
                                                        {attendanceRecord[student._id] === 'present' ? '✓ Present' : '✕ Absent'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedClassId}
                                    className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Save Attendance"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}