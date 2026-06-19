import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import api from "../services/api";
import Button from "../components/ui/Button";

export default function Messages() {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    
    const [activeReceiver, setActiveReceiver] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newReceiver, setNewReceiver] = useState("");
    const [searchError, setSearchError] = useState("");
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { 
        const getPrivateMessages = async () => {
            if (!activeReceiver?._id) return;
            
            try {
                const savedMessages = await api.get(`/message/private/${activeReceiver._id}`);
                setMessages(savedMessages.data);
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error("Failed to load messages", err);
            }
        };
        
        getPrivateMessages();
    }, [activeReceiver?._id, user]);

    useEffect(() => {
        if (!socket) return;
        
        const handleReceive = (message) => {
            // Only add the message to the screen if it belongs to the current chat
            const belongsToCurrentChat = 
                message.sender._id === activeReceiver?._id || 
                message.receiver._id === activeReceiver?._id ||
                message.sender === activeReceiver?._id ||
                message.receiver === activeReceiver?._id;

            if (belongsToCurrentChat || message.sender._id === user._id) {
                setMessages((prev) => [...prev, message]);
                setTimeout(scrollToBottom, 50);
            }
        };

        socket.on("receive_private_message", handleReceive);
        
        return () => socket.off("receive_private_message", handleReceive);
    }, [socket, activeReceiver?._id, user._id]);

    const handleSearchUser = async (e) => {
        e.preventDefault();
        setSearchError("");
        if(!newReceiver.trim()) return;

        try {
            const response = await api.get(`/user/${newReceiver}`);
            setActiveReceiver(response.data);
            setNewReceiver(""); // Clear search box on success
        } catch (err) {
            console.error("User not found!", err);
            setSearchError("User not found. Please check the ID.");
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket || !activeReceiver) return;

        const messageData = {
            receiver: activeReceiver._id,
            text: newMessage,
            sender: user._id
        };

        socket.emit("send_private_message", messageData);
        setNewMessage("");
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-bg-base overflow-hidden p-4 gap-6">
            
            {/* Left Sidebar: Contacts & Search */}
            <div className="w-80 flex flex-col bg-bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden shrink-0">
                <div className="p-5 border-b border-border-subtle bg-bg-base/50">
                    <h2 className="text-xl font-bold text-text-primary mb-4">Direct Messages</h2>
                    
                    <form onSubmit={handleSearchUser} className="relative">
                        <div className="flex items-center bg-bg-base border border-border-subtle rounded-xl overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                            <span className="pl-3 text-text-secondary">🔍</span>
                            <input 
                                placeholder="Search User by ID..."
                                value={newReceiver}
                                onChange={(e) => setNewReceiver(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-sm text-text-primary focus:outline-none"
                            />
                        </div>
                        {searchError && <p className="text-red-400 text-xs mt-2 ml-1">{searchError}</p>}
                        {/* Hidden submit button to allow Enter key submission */}
                        <button type="submit" className="hidden">Search</button>
                    </form>
                </div>

                {/* Active Chat Card */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeReceiver ? (
                        <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-xl cursor-pointer transition-all hover:bg-brand-primary/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shadow-sm">
                                {activeReceiver.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-text-primary truncate">{activeReceiver.username}</h4>
                                <p className="text-xs text-text-secondary truncate text-brand-primary/80">Active Chat</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center opacity-70">
                            <span className="text-3xl mb-2">👋</span>
                            <p className="text-sm">Search for a user ID<br/>above to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Right Main Area: Chat Window */}
            <div className="flex-1 flex flex-col bg-bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden relative">
                
                {!activeReceiver ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="w-24 h-24 mb-6 rounded-full bg-bg-base flex items-center justify-center border border-border-subtle shadow-inner">
                            <span className="text-4xl">💭</span>
                        </div>
                        <h3 className="text-xl font-bold text-text-primary mb-2">Your Messages</h3>
                        <p className="text-sm max-w-xs text-center">Select a conversation or find someone to start chatting privately.</p>
                    </div>
                ) : (
                    // Active Chat State
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center gap-4 z-10">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shadow-sm">
                                {activeReceiver.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-lg">{activeReceiver.username}</h3>
                                <p className="text-xs text-brand-primary font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                    Online
                                </p>
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                    <p>No messages yet. Say hello to {activeReceiver.username}!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                                    
                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                                            {!isMe && (
                                                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                                                    {msg.sender?.username?.[0]?.toUpperCase() || "?"}
                                                </div>
                                            )}
                                            
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${isMe ? "bg-brand-primary text-white rounded-br-none shadow-md" : "bg-bg-base text-text-primary border border-border-subtle rounded-bl-none shadow-sm"}`}>
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
                                    placeholder={`Message @${activeReceiver.username}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-5 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="px-6 rounded-xl shrink-0 shadow-md">
                                    Send <span className="ml-2">➤</span>
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}