import { useParams } from "react-router-dom";

export default function TeacherProfile() {
  const { username } = useParams();
  
  return (
    <div className="min-h-screen p-8 text-white bg-bg-base">
      <h1 className="text-3xl font-bold mb-4">Teacher Profile: {username}</h1>
      <p className="text-text-secondary">View ratings, bio, and subscribe to hubs (Coming Soon in Phase 3).</p>
    </div>
  );
}
