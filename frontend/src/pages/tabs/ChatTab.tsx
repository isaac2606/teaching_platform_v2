import { io } from "socket.io-client";
import { useContext, useEffect, useState, useRef } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Button from "../../components/ui/Button";

export default function ChatTab() {
    const hub = useRouteLoaderData("hub-workspace");
    const { user } = useContext(AuthContext);
    
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    
    const [activeTab, setActiveTab] = useState({ type: "channel", id: "general", name: "general" });
    const [students, setStudents] = useState([]);
    const [lockedChannels, setLockedChannels] = useState(hub?.lockedChannels || []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Load DM list (Roster for teacher, Teacher for student)
    useEffect(() => {
        if (user.role === "teacher") {
            const fetchStudents = async () => {
                try {
                    const res = await api.get(`/hub/${hub._id}/students`);
                    setStudents(res.data);
                } catch (err) {
                    console.error("Failed to load students for DMs", err);
                }
            };
            fetchStudents();
        }
    }, [hub._id, user.role]);

    // Load Chat History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                if (activeTab.type === "channel") {
                    const res = await api.get(`/message/public/${hub._id}?channel=${activeTab.id}`);
                    setMessages(res.data);
                } else if (activeTab.type === "dm") {
                    const res = await api.get(`/message/private/${activeTab.id}`);
                    setMessages(res.data);
                }
                setTimeout(scrollToBottom, 100);
            } catch (err) {
                console.error("error fetching history", err);
            }
        };
        fetchHistory();
    }, [hub._id, activeTab]);

    // Setup Socket
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:3000");
        setSocket(newSocket);

        if (hub?._id) {
            newSocket.emit("join_Hub", hub._id);
        }
        if (user?._id) {
            newSocket.emit("join_private_room", user._id);
        }

        return () => newSocket.close();
    }, [hub?._id, user?._id]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;
        
        socket.on("receive_message", (message) => {
            if (activeTab.type === "channel" && message.channel === activeTab.id) {
                setMessages((prev) => [...prev, message]);
                setTimeout(scrollToBottom, 50);
            }
        });

        socket.on("receive_private_message", (message) => {
            if (activeTab.type === "dm" && (message.sender._id === activeTab.id || message.receiver._id === activeTab.id || message.sender === activeTab.id || message.receiver === activeTab.id)) {
                setMessages((prev) => [...prev, message]);
                setTimeout(scrollToBottom, 50);
            }
        });

        socket.on("chat_error", (msg) => {
            alert(msg);
        });
        
        return () => {
            socket.off("receive_message");
            socket.off("receive_private_message");
            socket.off("chat_error");
        };
    }, [socket, activeTab]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        if (activeTab.type === "channel") {
            socket.emit("send_message", {
                hubId: hub._id,
                text: newMessage,
                sender: user._id,
                channel: activeTab.id
            });
        } else if (activeTab.type === "dm") {
            socket.emit("send_private_message", {
                text: newMessage,
                sender: user._id,
                receiver: activeTab.id
            });
        }
        setNewMessage("");
    };

    const toggleChannelLock = async (channelName) => {
        try {
            const res = await api.put(`/hub/${hub._id}/lock-channel`, { channel: channelName });
            setLockedChannels(res.data.lockedChannels);
        } catch (err) {
            console.error("Failed to toggle channel lock", err);
        }
    };

    const isCurrentChannelLocked = activeTab.type === "channel" && lockedChannels.includes(activeTab.id);

    return (
        <div className="flex h-[calc(100vh-16rem)] bg-bg-surface border border-border-subtle rounded-2xl shadow-md overflow-hidden">
            
            {/* Sidebar Component */}
            <div className="w-64 border-r border-border-subtle bg-bg-base flex flex-col shrink-0">
                <div className="p-4 border-b border-border-subtle font-bold text-text-primary text-lg">Hub Chat</div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-6">
                    {/* Public Channels */}
                    <div>
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-2">Public Channels</h4>
                        {["general", "homework"].map(ch => (
                            <div key={ch} className="flex justify-between items-center group">
                                <button 
                                    onClick={() => setActiveTab({ type: "channel", id: ch, name: ch })}
                                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab.type === "channel" && activeTab.id === ch ? "bg-brand-primary/10 text-brand-primary" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"}`}
                                >
                                    # {ch} {lockedChannels.includes(ch) && "🔒"}
                                </button>
                                {user.role === "teacher" && (
                                    <button 
                                        onClick={() => toggleChannelLock(ch)}
                                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                                        title={lockedChannels.includes(ch) ? "Unlock Channel" : "Lock Channel"}
                                    >
                                        {lockedChannels.includes(ch) ? "Unlock" : "Lock"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Direct Messages */}
                    <div>
                        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-2">Direct Messages</h4>
                        {user.role === "student" ? (
                            <button 
                                onClick={() => setActiveTab({ type: "dm", id: hub.teacher._id, name: hub.teacher.username || "Teacher" })}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab.type === "dm" && activeTab.id === hub.teacher._id ? "bg-brand-primary/10 text-brand-primary" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"}`}
                            >
                                <div className="w-5 h-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px]">T</div>
                                {hub.teacher.username || "Teacher"}
                            </button>
                        ) : (
                            students.length === 0 ? <p className="text-xs text-text-secondary px-2">No students yet.</p> :
                            students.map(student => (
                                <button 
                                    key={student._id}
                                    onClick={() => setActiveTab({ type: "dm", id: student._id, name: student.username })}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${activeTab.type === "dm" && activeTab.id === student._id ? "bg-brand-primary/10 text-brand-primary" : "text-text-secondary hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-primary"}`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">{student.username?.[0]?.toUpperCase()}</div>
                                    {student.username}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Area Component */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-border-subtle bg-bg-base flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-text-primary text-lg flex items-center gap-2">
                        {activeTab.type === "channel" ? `# ${activeTab.name}` : `@ ${activeTab.name}`}
                        {isCurrentChannelLocked && <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full border border-red-500/20">Read Only</span>}
                    </h3>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                            <span className="text-4xl mb-3 opacity-50">💬</span>
                            <p>No messages yet.</p>
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
                                    <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? "bg-brand-primary text-white" : "bg-bg-base border border-border-subtle text-text-primary"}`}>
                                        {!isMe && (
                                            <p className="text-xs font-bold text-brand-primary mb-1">
                                                {msg.sender?.username || "Unknown"}
                                            </p>
                                        )}
                                        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 bg-bg-base border-t border-border-subtle shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-3">
                        <input
                            type="text"
                            placeholder={isCurrentChannelLocked && user.role === "student" ? "This channel is locked..." : "Type a message..."}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isCurrentChannelLocked && user.role === "student"}
                            className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-5 py-3 text-sm text-text-primary focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all disabled:opacity-50"
                        />
                        <Button type="submit" disabled={!newMessage.trim() || (isCurrentChannelLocked && user.role === "student")} className="px-6 rounded-xl shrink-0">
                            Send <span className="ml-2">?</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
