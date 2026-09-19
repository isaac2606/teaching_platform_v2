// @ts-nocheck
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useMutation } from "@tanstack/react-query";

export default function JoinHub() {
  
  const {inviteToken} = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("joining class....");

  const joinMutation = useMutation({
    mutationFn: async (token) => {
      await api.post(`/class/join/${token}`);
    },
    onSuccess: () => {
      setStatus("Successfully joined! Redirecting to your Dashboard...");
      setTimeout(() => {
          navigate("/dashboard");
      }, 2000);
    },
    onError: (err) => {
      console.error(err.message);
      setStatus("Failed to join class. The link might be invalid or expired.");
    }
  });

  useEffect(() => {
    if (inviteToken) {
      joinMutation.mutate(inviteToken);
    }
  }, [inviteToken]);

  return(
    <div className="flex items-center justify-center min-h-screen bg-bg-base text-white">
      <h1>{status}</h1>
    </div>
  )
}