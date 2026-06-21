import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import api from "../services/api";
import Button from "../components/ui/Button";

export default function Messages() {
    const { socket } = useContext(SocketContext);
    const { user } = useContext(AuthContext);
    
    const [activeReceiver, setActiveReceiver] = useState(null);
    const [recentContacts, setRecentContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [newReceiver, setNewReceiver] = useState("");
    const [searchError, setSearchError] = useState("");
    
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch Recent Contacts on mount
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/message/contacts');
                setRecentContacts(res.data);
            } catch (err) {
                console.error("Failed to fetch recent contacts", err);
            }
        };
        fetchContacts();
    }, []);

    // Fetch messages when activeReceiver changes
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
            
            // Optionally, we could refresh recentContacts here to bump the user to the top,
            // but for simplicity, we'll leave it as is.
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
            
            // Add to recent contacts if not already there
            setRecentContacts(prev => {
                if (!prev.find(c => c._id === response.data._id)) {
                    return [response.data, ...prev];
                }
                return prev;
            });
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
        <div className="flex h-screen bg-bg-surface overflow-hidden p-4 gap-4">
            
            {/* Left Sidebar: Recent Contacts & Search */}
            <div className="w-80 flex flex-col bg-bg-base border border-border-subtle rounded-xl shadow-sm shrink-0">
                <div className="p-4 border-b border-border-subtle">
                    <h2 className="text-lg font-bold text-text-primary mb-3">Messages</h2>
                    
                    <form onSubmit={handleSearchUser} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input 
                                placeholder="Search User ID..."
                                value={newReceiver}
                                onChange={(e) => setNewReceiver(e.target.value)}
                                className="flex-1 bg-bg-surface border border-border-subtle rounded px-3 py-2 text-sm text-text-primary focus:outline-none"
                            />
                            <Button type="submit" variant="secondary" className="px-3 py-2 text-sm">Find</Button>
                        </div>
                        {searchError && <span className="text-red-400 text-xs">{searchError}</span>}
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <p className="text-xs font-bold text-text-secondary uppercase px-2 mb-2 mt-2">Recent Contacts</p>
                    {recentContacts.length === 0 ? (
                        <p className="text-sm text-text-secondary px-2">No recent chats.</p>
                    ) : (
                        recentContacts.map(contact => (
                            <div 
                                key={contact._id} 
                                onClick={() => setActiveReceiver(contact)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${activeReceiver?._id === contact._id ? 'bg-brand-primary/10 border border-brand-primary/30' : 'hover:bg-bg-surface border border-transparent'}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shrink-0">
                                    {contact.username?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-text-primary text-sm truncate">{contact.username}</h4>
                                    <p className="text-xs text-text-secondary truncate capitalize">{contact.role || "Member"}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Area: Chat Window */}
            <div className="flex-1 flex flex-col bg-bg-base border border-border-subtle rounded-xl shadow-sm overflow-hidden">
                
                {!activeReceiver ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <p className="text-lg">Select a contact to start chatting.</p>
                    </div>
                ) : (
                    <>
                        {/* Top Header: User Info */}
                        <div className="p-4 border-b border-border-subtle bg-bg-surface flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-primary flex items-center justify-center text-white text-lg font-bold shrink-0">
                                {activeReceiver.username?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-lg">{activeReceiver.username}</h3>
                                <p className="text-sm text-text-secondary capitalize">{activeReceiver.role || "Member"} • ID: {activeReceiver._id}</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                                    <p>Say hello to {activeReceiver.username}!</p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.sender?._id === user._id || msg.sender === user._id;
                                    
                                    return (
                                        <div key={msg._id || index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] rounded-lg px-4 py-2 ${isMe ? "bg-brand-primary text-white" : "bg-bg-surface text-text-primary border border-border-subtle"}`}>
                                                {!isMe && <p className="text-xs font-bold mb-1 opacity-70">{msg.sender?.username}</p>}
                                                <p className="text-sm">{msg.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 bg-bg-surface border-t border-border-subtle">
                            <form onSubmit={sendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-bg-base border border-border-subtle rounded-lg px-4 py-2 text-sm text-text-primary focus:outline-none"
                                />
                                <Button type="submit" disabled={!newMessage.trim()} className="px-6">
                                    Send
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
            
        </div>
    );
}