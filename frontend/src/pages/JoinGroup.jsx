import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function JoinGroup() {
  
  const {inviteToken} = useParams();
  const navigate = useNavigate();

  const[status,setStatus] = useState("joining class....");

  useEffect(()=>{
    const joinClass = async ()=>{
        try{
            await api.post(`/group/join/${inviteToken}`);
            setStatus("Successfully joined! Redirecting to your Dashboard...");

            setTimeout(()=>{
                navigate("/dashboard");
            },2000)
        }catch(err){
            console.error(err.message)
            setStatus("Failed to join group. The link might be invalid or expired.");
        }

        };
    joinClass();
    }
  ,[inviteToken,navigate])

  return(
    <div className="flex items-center justify-center min-h-screen bg-bg-base text-white">
      <h1>{status}</h1>
    </div>
  )
}