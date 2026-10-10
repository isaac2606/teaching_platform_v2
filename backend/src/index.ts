import express from "express";
import "dotenv/config";
import cors from "cors";
const app = express();

import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials:true, // Allows your React app to connect
    methods: ["GET", "POST"]
  }
});
import Message from "./models/Message";
import User from "./models/User";
import Hub from "./models/Hub";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import jwt from "jsonwebtoken";
import authRoute from "./routes/auth";
import userRoute from "./routes/user";
import hubRoute from "./routes/hub";
import announcementRoute from "./routes/announcement";
import classRoute from "./routes/class";
import messageRoute from "./routes/message";
import uploadRoute from "./routes/upload";
import assignmentRoute from "./routes/assignment";
import { addConnection, removeConnection, getOnlineUsers } from "./services/redis";

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(process.env.MONGO_URL!)
    .then(() => console.log("connected to mongo"))
    .catch((err) => console.log(err));
}


app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan("common"));

app.use("/api/auth",authRoute);app.use("/api/user",userRoute);
app.use("/api/hub", hubRoute);
app.use("/api/announcement",announcementRoute);
app.use("/api/class",classRoute)
app.use("/api/message",messageRoute)
app.use("/api/upload",uploadRoute)
app.use("/api/assignment",assignmentRoute)

io.use((socket, next) => {
    // 1. Grab the raw cookie string from the handshake headers
    const cookieString = socket.handshake.headers.cookie;
    if (!cookieString) return next(new Error("Authentication error: No cookies"));

    // 2. Parse out the "accessToken" manually
    const token = cookieString
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

    if (!token) return next(new Error("Authentication error: No token provided"));

    // 3. Verify it just like before
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
        if (err) return next(new Error("Authentication error: Invalid token"));
        socket.data.user = decoded; 
        next();
    });
});

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.data?.user?.userId;

  if (userId) {
    // 1. Join user's private room securely using authenticated ID
    socket.join(userId);

    // 2. Track connection in Redis. If newly online, broadcast to all clients
    try {
      const isNewlyOnline = await addConnection(userId, socket.id);
      if (isNewlyOnline) {
        io.emit("user_status", { userId, status: "online" });
      }

      // 3. Send current list of online users to the newly connected client
      const currentOnline = await getOnlineUsers();
      socket.emit("online_users_list", currentOnline);
    } catch (err) {
      console.error("Redis presence error on connection:", err);
    }
  }

  socket.on("join_Hub", (hubId) => {
    socket.join(hubId);
  });

  socket.on("send_message", async (data) => {
    try {
      const hub = await Hub.findById(data.hubId);
      const senderUser = await User.findById(data.sender);
      const channel = data.channel || "general";
      
      if (hub && hub.lockedChannels && hub.lockedChannels.includes(channel) && senderUser?.role === "student") {
        return socket.emit("chat_error", "This channel is currently locked by the teacher.");
      }

      const newMessage = await Message.create({
        sender: data.sender,
        hubId: data.hubId,
        text: data.text,
        imageUrl: data.imageUrl || "",
        channel: channel
      });

      await newMessage.populate("sender", "username");
      io.to(data.hubId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    if (userId) {
      try {
        const isNowOffline = await removeConnection(userId, socket.id);
        if (isNowOffline) {
          io.emit("user_status", { userId, status: "offline" });
        }
      } catch (err) {
        console.error("Redis presence error on disconnect:", err);
      }
    }
  });
    
  socket.on("send_private_message",async (data)=>{
      try{
        const senderUser = await User.findById(data.sender);
        const receiverUser = await User.findById(data.receiver);
        if (!senderUser || !receiverUser) {
            return socket.emit("private_message_error", "User not found.");
        }

        if (senderUser.role === "student" && receiverUser.role === "student") {
            return socket.emit("private_message_error", "Students cannot message other students privately.");
        }

        const newMessage = await Message.create({
          receiver:data.receiver,
          sender:data.sender,
          text:data.text,
          imageUrl:data.imageUrl || ""
        })
        await newMessage.populate("sender","username");
        await newMessage.populate("receiver","username");

        io.to(data.receiver).emit("receive_private_message",newMessage);
        io.to(data.sender).emit("receive_private_message",newMessage)

      }catch(err){
        console.error("Error saving message:", err)
      }
  })
})
if (process.env.NODE_ENV !== "test") {
  server.listen(3000, () => {
      console.log("backend server is running")
  });
}

export { app };

