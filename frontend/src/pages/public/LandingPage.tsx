import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-base text-white p-8">
      <h1 className="text-5xl font-bold text-brand-primary mb-4">Welcome to EduSpace</h1>
      <p className="text-lg text-text-secondary mb-8">The Hybrid Moodle + Upwork EdTech Platform</p>
      
      <div className="flex gap-4">
        <Link to="/auth/register" className="px-6 py-3 bg-brand-primary rounded-xl font-bold hover:bg-brand-hover transition-colors">
          I am a Teacher
        </Link>
        <Link to="/search" className="px-6 py-3 bg-[#1E293B] hover:bg-[#334155] rounded-xl font-bold transition-colors">
          Find a Tutor
        </Link>
      </div>
    </div>
  );
}
