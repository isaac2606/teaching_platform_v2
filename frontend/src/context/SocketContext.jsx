
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

    useEffect(()=>{
        if(user){
            const newSocket = io("http://localhost:3000");
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
        
  
    },[user])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}