// @ts-nocheck
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ui/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="w-full border-b border-border-subtle bg-bg-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center select-none">
          <span className="text-2xl font-black tracking-tight text-brand-primary">Edu</span><span className="text-2xl font-black tracking-tight text-text-primary">Space</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/auth/login"
            className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/auth/register"
            className="px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-xl hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6">
          ✨ Next-Gen Education Platform
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Welcome to <span className="text-brand-primary">EduSpace</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary mb-10 max-w-2xl">
          The collaborative learning environment for teachers and students. Interactive classrooms, real-time discussions, and assignments all in one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/auth/register"
            className="px-8 py-3.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/25 hover:-translate-y-0.5"
          >
            Get Started Free
          </Link>
          <Link
            to="/auth/login"
            className="px-8 py-3.5 bg-bg-surface border border-border-subtle text-text-primary rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-text-secondary border-t border-border-subtle">
        © {new Date().getFullYear()} EduSpace Platform. All rights reserved.
      </footer>
    </div>
  );
}
