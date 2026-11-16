// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";

export default function JoinHub() {
  const { inviteToken } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Joining workspace...");
  const [isError, setIsError] = useState(false);

  const joinMutation = useMutation({
    mutationFn: async (token) => {
      // First try joining as a Hub token (from HubCard invite link)
      try {
        const res = await api.post(`/hub/join/${token}`);
        return res.data;
      } catch (err) {
        // If not a hub token, attempt joining as a cohort/class token
        const res = await api.post(`/class/join/${token}`);
        return res.data;
      }
    },
    onSuccess: () => {
      setStatus("Successfully joined! Redirecting to your Dashboard...");
      setIsError(false);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    },
    onError: (err) => {
      console.error("Join error:", err);
      setIsError(true);
      setStatus(err.response?.data?.message || err.message || "Failed to join. The link may be invalid or expired.");
    }
  });

  useEffect(() => {
    if (inviteToken) {
      joinMutation.mutate(inviteToken);
    }
  }, [inviteToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-base text-text-primary px-4 transition-colors">
      <div className="bg-bg-surface border border-border-subtle p-8 rounded-2xl shadow-xl max-w-md w-full text-center flex flex-col items-center gap-4">
        {!isError ? (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent mb-2"></div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-2xl mb-2">
            ✕
          </div>
        )}
        <h2 className="text-xl font-bold">{status}</h2>
        {isError && (
          <Link
            to="/dashboard"
            className="mt-4 px-6 py-2.5 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition-all shadow-md"
          >
            Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}