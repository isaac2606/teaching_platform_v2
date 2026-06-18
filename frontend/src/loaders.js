import api from "./services/api";

export async function dashboardLoader() {
    try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return { role: null, hubs: [] };
        const user = JSON.parse(userStr);
        
        if (user.role === "teacher") {
            // Fetch stats and hubs simultaneously for teacher
            const [statsResponse, hubsResponse] = await Promise.all([
                api.get('/hub/stats'),
                api.get('/hub/my-hubs')
            ]);
            
            return {
                role: "teacher",
                stats: statsResponse.data,
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
        const response = await api.get(`/hub/${params.id}`)
        return response.data
    }catch(err){
        console.error("Hub loader error : ", err); 
    }
}
