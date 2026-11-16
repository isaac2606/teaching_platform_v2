// @ts-nocheck
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function MaterialsPage() {
  const { user } = useContext(AuthContext);

  const { data: hubs = [], isLoading } = useQuery({
    queryKey: ["hubs"],
    queryFn: async () => {
      const res = await api.get("/hub/my-hubs");
      return res.data;
    }
  });

  return (
    <div className="p-6 lg:p-8 min-h-screen text-text-primary font-sans flex-1 bg-bg-base transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-bg-surface border border-border-subtle p-6 rounded-2xl shadow-sm transition-colors">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Learning Materials & Resources
          </h1>
          <p className="text-text-secondary mt-1 text-sm">
            Access course documents, slides, assignments, and study attachments across all your hubs.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-md shadow-brand-primary/20 text-sm shrink-0"
        >
          View All Hubs →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-primary border-t-transparent"></div>
        </div>
      ) : hubs.length === 0 ? (
        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            📚
          </div>
          <h3 className="text-xl font-bold mb-2">No Learning Hubs Yet</h3>
          <p className="text-text-secondary text-sm mb-6">
            Join or create a hub to start downloading or uploading course materials.
          </p>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-md inline-block text-sm"
          >
            Go to Hubs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => (
            <div
              key={hub._id}
              className="bg-bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider">
                    {hub.subject || "Resource Repository"}
                  </span>
                  <span className="text-xs text-text-secondary font-medium">
                    {hub.announcements?.length || 0} announcements
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2 truncate">
                  {hub.title}
                </h3>
                <p className="text-text-secondary text-sm line-clamp-2 mb-4">
                  Shared study guides, assignments, and file uploads for this hub.
                </p>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between gap-2">
                <Link
                  to={`/hubs/${hub._id}/feed`}
                  className="px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-brand-primary hover:text-white text-text-primary rounded-xl text-xs font-bold transition-all flex-1 text-center"
                >
                  Announcements
                </Link>
                <Link
                  to={`/hubs/${hub._id}/assignments`}
                  className="px-3 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl text-xs font-bold transition-all flex-1 text-center shadow-sm"
                >
                  Assignments
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
