import { io } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api"

export default function ChatTab(){
    const hub  = useRouteLoaderData("hub-workspace");
    const {user} = useContext(AuthContext)
    const [socket,setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect( ()=>{

        const getPublickChatHistory = async ()=>{
            try{

                const savedMessages  = await api.get(`/message/public/${hub._id}`);
                setMessages(savedMessages.data)

            }catch(err){
                console.error("error fetching history", err)
            }
            
        }
        
        getPublickChatHistory()

    },[hub?._id])

    useEffect(()=>{

        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        if(hub?._id){
            newSocket.emit("join_Hub",hub._id)
            console.log("joined hub")
        }

        return () => newSocket.close();

    },[hub?._id])


    useEffect(()=>{
        if(!socket) return ;
        
        socket.on("receive_message", (message)=>{
            setMessages((prev)=> [...prev,message]);
            

        })
        
        return () => socket.off("receive_message");
    },[socket])


    const sendMessage =(e)=>{
        e.preventDefault();

        if(!newMessage.trim() || !socket) {
            
            return;
        };

        const messageData = {
            hubId: hub._id,
            text: newMessage,
            sender:user._id
        }

        socket.emit("send_message", messageData);
        
        setNewMessage("");
    }


        return (
        <div className="p-4">
            <div className="h-96 overflow-y-auto bg-bg-surface border border-border-subtle p-4 mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className="mb-2">
                        {msg.text}
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="border border-border-subtle p-2 flex-1 text-text-primary bg-bg-base"
                    placeholder="Type a message..."
                />
                <button type="submit" className="bg-brand-primary text-white p-2 rounded">
                    Send
                </button>
            </form>
        </div>
    );

}