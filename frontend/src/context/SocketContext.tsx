
import { useContext } from "react";
import { createContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import { useRevalidator } from "react-router-dom";



export const SocketContext = createContext();

// Create a custom hook to make it easier to use in other files
export const useSocket = () => {
    return useContext(SocketContext);
};

export function SocketProvider({ children }) {

    const {user} = useContext(AuthContext);
    const [socket,setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null);

    useEffect(()=>{
        if(user){
            const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");
            setSocket(newSocket);

            newSocket.emit("join_private_room",user._id)
            console.log("joined private chat")

            return () => newSocket.close();
            }else{
                if(socket){
                    socket.close();
                    setSocket(null)
                }
            }
        
  
    },[user]);

  
    useEffect(()=>{
      if (!socket) return;
        
        const handleGlobalReceive = async (message) => {
          if(!(window.location.pathname === "/messages")){
            setUnreadCount(prev=>prev+1)
            setToast({senderName: message.sender.username,text:message.text})
            setTimeout(()=>setToast(null), 4000)
          }
        };

        socket.on("receive_private_message", handleGlobalReceive);
    },[socket])

  return (
    <SocketContext.Provider value={{ socket,unreadCount,setUnreadCount }}>
      {children}
      {toast && (
        <div className="fixed top-6 right-6 z-[9999] bg-[var(--color-sidebar-bg)] border border-brand-primary shadow-2xl rounded-xl p-4 w-72 transition-all duration-300">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shrink-0">
                {toast.senderName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">New message from {toast.senderName}</p>
                <p className="text-xs text-slate-300 truncate mt-1">{toast.text}</p>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}