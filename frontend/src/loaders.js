import api from "./services/api";

export async function dashboardLoader() {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return { role: null, hubs: [] };
        const user = JSON.parse(userStr);
        
        if (user.role === "teacher") {
            // Fetch stats and hubs simultaneously for teacher
            const [ hubsResponse] = await Promise.all([
                api.get('/hub/my-hubs')
            ]);
            
            return {
                role: "teacher",
                hubs: hubsResponse.data
            };
        } else {
            // Student just gets their enrolled hubs
            const hubsResponse = await api.get('/hub/my-hubs');
            return {
                role: "student",
                hubs: hubsResponse.data
            };
        }
    } catch (err) {
        console.error("Dashboard loader error:", err);
        return { role: null, stats: {}, hubs: [] }; // Return empty data on failure
    }
}


export async function HubLoader({params}){
    try{
        const response = await api.get(`/hub/${params.hubId}`)
        return response.data
    }catch(err){
        console.error("Hub loader error : ", err); 
    }
}

export async function StudentsLoader({params}){
    try{
        const response = await api.get(`/hub/getStudents/${params.hubId}`);
        return response.data
    }catch(err){
        console.error("Student Loader Error ", err)
    }

}

export async function AllStudentsLoader(){
    const userStr = localStorage.getItem("user");
    if (!userStr) return { role: null, hubs: [] };
    const user = JSON.parse(userStr);
    try{
        const response = await api.get(`/user/getAllStudents/${user._id}`);
        return response.data
    }catch(err){
        console.error("All Student Loader Error ", err)
    }

}