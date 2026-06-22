const express = require("express");
const cors = require("cors");
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your React app to connect
    methods: ["GET", "POST"]
  }
});
const Message = require("./models/Message");
const User = require("./models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan"); 
const path = require("path"); 
dotenv.config();

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const hubRoute = require("./routes/hub");
const announcementRoute = require("./routes/announcement");
const classRoute = require("./routes/class");
const messageRoute = require("./routes/message");



io.on("connection", (socket)=>{
  console.log("A user connected:" , socket.id)

  socket.on("join_Hub", (hubId) => {
      socket.join(hubId);
      
    });

  socket.on("join_private_room",(userId)=>{
    socket.join(userId);
    console.log("user joined private room :",userId)
  })



  // Add 'async' here!
  socket.on("send_message", async (data) => {
      try {
          // 1. Save it to MongoDB
          const newMessage = await Message.create({
              sender: data.sender,
              hubId: data.hubId,
              text: data.text
          });

          // 2. We populate the sender so the frontend gets the username!
          await newMessage.populate("sender", "username");
          
          
          // 3. Now broadcast the permanently saved message!
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
        // Enforce role-based safety: Students cannot message other students
        const senderUser = await User.findById(data.sender);
        const receiverUser = await User.findById(data.receiver);

        if (senderUser.role === "student" && receiverUser.role === "student") {
            return socket.emit("private_message_error", "Students cannot message other students privately.");
        }

        const newMessage = await Message.create({

          receiver:data.receiver,
          sender:data.sender,
          text:data.text

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




mongoose
    .connect(process.env.MONGO_URL)
    .then(()=>{
        console.log("connected to mongo");
    })
    .catch((err)=>{
        console.log(err);

    });


app.use(cors());
/*app.use(
  cors({
    origin: "http://127.0.0.1:5500", // your frontend's exact origin
    credentials: true, // include if you're sending cookies/auth headers
  }),
);*/
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/auth",authRoute);
app.use("/images", express.static(path.join(__dirname, "uploads")));
app.use("/api/user",userRoute);
app.use("/api/hub", hubRoute);
app.use("/api/announcement",announcementRoute);
app.use("/api/class",classRoute)
app.use("/api/message",messageRoute)









server.listen(3000,()=>{
    console.log("backend server is running")
})