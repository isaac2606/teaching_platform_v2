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
            setNewReceiver(""); 
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
        <div className="flex h-screen bg-bg-base overflow-hidden p-2 gap-2 pb-2">
            
            {/* Left Pane: Contacts & Search */}
            <div className="w-80 flex flex-col bg-bg-surface border border-border-subtle rounded-l-2xl shadow-sm overflow-hidden shrink-0">
                <div className="p-4 border-b border-border-subtle">
                    <h2 className="text-lg font-bold text-text-primary mb-4">Direct Messages</h2>
                    
                    <form onSubmit={handleSearchUser} className="relative">
                        <div className="flex items-center bg-bg-base border border-border-subtle rounded-lg overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
                            <span className="pl-3 text-text-secondary text-sm">🔍</span>
                            <input 
                                placeholder="Search by User ID..."
                                value={newReceiver}
                                onChange={(e) => setNewReceiver(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-sm text-text-primary focus:outline-none"
                            />
                        </div>
                        {searchError && <p className="text-red-400 text-xs mt-2 ml-1">{searchError}</p>}
                        <button type="submit" className="hidden">Search</button>
                    </form>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {activeReceiver ? (
                        <div className="p-3 bg-brand-primary/10 border border-brand-primary/30 rounded-lg cursor-pointer transition-all hover:bg-brand-primary/20 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shadow-sm">
                                {activeReceiver.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-text-primary text-sm truncate">{activeReceiver.username}</h4>
                                <p className="text-xs text-brand-primary font-medium truncate">Active Chat</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center opacity-60">
                            <span className="text-2xl mb-2">👥</span>
                            <p className="text-xs">Search for a user<br/>to start a conversation.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Pane: Chat Window */}
            <div className="flex-1 flex flex-col bg-bg-surface border-y border-r border-border-subtle shadow-sm overflow-hidden relative">
                
                {!activeReceiver ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <div className="w-20 h-20 mb-4 rounded-full bg-bg-base flex items-center justify-center border border-border-subtle shadow-inner">
                            <span className="text-3xl">💬</span>
                        </div>
                        <h3 className="text-lg font-bold text-text-primary mb-1">Your Messages</h3>
                        <p className="text-sm">Select a conversation to start chatting.</p>
                    </div>
                ) : (
                    // Active Chat State
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-border-subtle bg-bg-base/50 flex items-center gap-3 z-10">
                            <h3 className="font-bold text-text-primary">{activeReceiver.username}</h3>
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                    <p className="text-sm">This is the beginning of your chat history with {activeReceiver.username}.</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                                    
                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
                                            <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className={`px-4 py-2.5 rounded-2xl ${isMe ? "bg-brand-primary text-white rounded-br-sm shadow-md" : "bg-bg-base text-text-primary border border-border-subtle rounded-bl-sm shadow-sm"}`}>
                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                                <span className="text-[10px] text-text-secondary mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input Area */}
                        <div className="p-4 bg-bg-base border-t border-border-subtle">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Message @${activeReceiver.username}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-bg-surface border border-border-subtle rounded-lg px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-inner"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="px-5 rounded-lg shrink-0">
                                    Send
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Right Pane: User Profile Details (Only visible when chatting) */}
            {activeReceiver && (
                <div className="w-72 flex flex-col bg-bg-surface border border-border-subtle rounded-r-2xl shadow-sm overflow-hidden shrink-0">
                    <div className="p-6 flex flex-col items-center border-b border-border-subtle">
                        <div className="w-24 h-24 rounded-full bg-brand-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 ring-4 ring-bg-base">
                            {activeReceiver.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <h3 className="font-bold text-text-primary text-xl">{activeReceiver.username}</h3>
                        <p className="text-sm text-text-secondary capitalize mt-1">{activeReceiver.role || "Member"}</p>
                    </div>

                    <div className="p-6 flex-1 bg-bg-base/30">
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">User Details</h4>
                        
                        <div className="space-y-4">
                            <div className="bg-bg-surface p-3 rounded-lg border border-border-subtle">
                                <p className="text-xs text-text-secondary mb-1">User ID</p>
                                <p className="text-xs font-mono text-text-primary break-all">{activeReceiver._id}</p>
                            </div>
                            
                            <div className="bg-bg-surface p-3 rounded-lg border border-border-subtle">
                                <p className="text-xs text-text-secondary mb-1">Email</p>
                                <p className="text-sm text-text-primary truncate">{activeReceiver.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}