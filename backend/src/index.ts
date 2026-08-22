import express from "express";
import cors from "cors";
const app = express();

import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your React app to connect
    methods: ["GET", "POST"]
  }
});
import Message from "./models/Message";
import User from "./models/User";
import Hub from "./models/Hub";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
dotenv.config();

import authRoute from "./routes/auth";
import userRoute from "./routes/user";
import hubRoute from "./routes/hub";
import announcementRoute from "./routes/announcement";
import classRoute from "./routes/class";
import messageRoute from "./routes/message";
import uploadRoute from "./routes/upload";
import assignmentRoute from "./routes/assignment";

mongoose
    .connect(process.env.MONGO_URL!)
    .then(()=>{
        console.log("connected to mongo");
    })
    .catch((err)=>{
        console.log(err);
    });

app.use(cors());
app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan("common"));

app.use("/api/auth",authRoute);
app.use("/images", express.static(path.join(__dirname, "uploads")));
app.use("/api/user",userRoute);
app.use("/api/hub", hubRoute);
app.use("/api/announcement",announcementRoute);
app.use("/api/class",classRoute)
app.use("/api/message",messageRoute)
app.use("/api/upload",uploadRoute)
app.use("/api/assignment",assignmentRoute)

io.on("connection", (socket)=>{
  console.log("A user connected:" , socket.id)

  socket.on("join_Hub", (hubId) => {
      socket.join(hubId);
  });

  socket.on("join_private_room",(userId)=>{
    socket.join(userId);
    console.log("user joined private room :",userId)
  })

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
              imageUrl:data.imageUrl || "",
              channel: channel
          });

          await newMessage.populate("sender", "username");
          
          io.to(data.hubId).emit("receive_message", newMessage);
          
      } catch (err) {
          console.error("Error saving message:", err);
      }
  });

  socket.on("disconnect",()=>{
      console.log("User disconnected ")
  })
    
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

server.listen(3000,()=>{
    console.log("backend server is running")
})
