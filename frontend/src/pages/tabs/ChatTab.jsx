import { io } from "socket.io-client";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api"
import Button from "../../components/ui/Button";

export default function ChatTab(){
    const hub  = useRouteLoaderData("hub-workspace");
    const {user} = useContext(AuthContext)
    const [socket,setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect( ()=>{

        const getPublickChatHistory = async ()=>{
            try{

                const savedMessages  = await api.get(`/message/public/${hub._id}`);
                setMessages(savedMessages.data)
                setTimeout(scrollToBottom, 100);

            }catch(err){
                console.error("error fetching history", err)
            }
            
        }
        
        getPublickChatHistory()

    },[hub?._id])

    useEffect(()=>{

        const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");
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
            setTimeout(scrollToBottom, 50);
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
        <div className="flex flex-col h-[calc(100vh-16rem)] bg-bg-surface border border-border-subtle rounded-2xl shadow-md overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-border-subtle bg-bg-base flex justify-between items-center">
                <h3 className="font-bold text-text-primary text-lg">Public Hub Chat</h3>
                <span className="text-xs font-semibold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">
                    {messages.length} Messages
                </span>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <span className="text-4xl mb-3 opacity-50">💬</span>
                        <p>No messages yet. Be the first to say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Check if I sent the message
                        const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                        
                        return (
                            <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                                
                                {/* Avatar (Hide for 'Me', or show on left for 'Them') */}
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                        {msg.sender?.username?.[0]?.toUpperCase() || "?"}
                                    </div>
                                )}
                                
                                {/* Chat Bubble */}
                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                                    isMe 
                                        ? "bg-brand-primary text-white rounded-br-none" 
                                        : "bg-bg-base text-text-primary border border-border-subtle rounded-bl-none"
                                }`}>
                                    {!isMe && (
                                        <p className="text-xs font-bold text-brand-primary mb-1">
                                            {msg.sender?.username || "Unknown"}
                                        </p>
                                    )}
                                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                    <p className={`text-[10px] mt-2 ${isMe ? "text-right text-white/70" : "text-left text-text-secondary"}`}>
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input Area */}
            <div className="p-4 bg-bg-base border-t border-border-subtle">
                <form onSubmit={sendMessage} className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Type a message to the hub..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-5 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                    />
                    <Button type="submit" disabled={!newMessage.trim()} className="px-6 rounded-xl shrink-0">
                        Send <span className="ml-2">➤</span>
                    </Button>
                </form>
            </div>
        </div>
    );
}