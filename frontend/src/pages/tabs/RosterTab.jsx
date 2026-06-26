import { AuthContext } from "../../context/AuthContext"
import { useContext , useState, useEffect } from "react"
import api from  "../../services/api"
import { useRouteLoaderData } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import StudentCard from "../../components/StudentCard";
export default function RosterTab(){

    const { user } = useContext(AuthContext);
    const hub = useRouteLoaderData("hub-workspace");
    const loaderData = useLoaderData();
    
    // Fallback to empty array if loader data is undefined
    const [students, setStudents] = useState(loaderData || []);

    const handleKickStudent = async (studentId)=>{
        try{
            await api.put(`/hub/${hub._id}/kick/${studentId}`)
            setStudents(prev => prev.filter(s => s._id !== studentId));
        }catch(err){
            console.error("Error with kicking the student ", err)
            alert(err.response?.data?.message || "Failed to remove student");
        }
    }
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.length === 0 ? (
            <p className="text-text-secondary p-4 col-span-full text-center">No students enrolled yet.</p>
        ) : (
            students.map(student => (
                <StudentCard 
                    key={student._id} 
                    student={student} 
                    onKick={handleKickStudent} 
                />
            ))
        )}
    </div>
);
} 