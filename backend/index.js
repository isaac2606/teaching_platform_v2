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