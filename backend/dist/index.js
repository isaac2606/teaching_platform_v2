"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Allows your React app to connect
        methods: ["GET", "POST"]
    }
});
const Message_1 = __importDefault(require("./models/Message"));
const User_1 = __importDefault(require("./models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const hub_1 = __importDefault(require("./routes/hub"));
const announcement_1 = __importDefault(require("./routes/announcement"));
const class_1 = __importDefault(require("./routes/class"));
const message_1 = __importDefault(require("./routes/message"));
const upload_1 = __importDefault(require("./routes/upload"));
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => {
    console.log("connected to mongo");
})
    .catch((err) => {
    console.log(err);
});
app.use((0, cors_1.default)());
/*app.use(
  cors({
    origin: "http://127.0.0.1:5500", // your frontend's exact origin
    credentials: true, // include if you're sending cookies/auth headers
  }),
);*/
app.use(express_1.default.json());
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, morgan_1.default)("common"));
app.use("/api/auth", auth_1.default);
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use("/api/user", user_1.default);
app.use("/api/hub", hub_1.default);
app.use("/api/announcement", announcement_1.default);
app.use("/api/class", class_1.default);
app.use("/api/message", message_1.default);
app.use("/api/upload", upload_1.default);
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    socket.on("join_Hub", (hubId) => {
        socket.join(hubId);
    });
    socket.on("join_private_room", (userId) => {
        socket.join(userId);
        console.log("user joined private room :", userId);
    });
    // Add 'async' here!
    socket.on("send_message", async (data) => {
        try {
            // 1. Save it to MongoDB
            const newMessage = await Message_1.default.create({
                sender: data.sender,
                hubId: data.hubId,
                text: data.text,
                imageUrl: data.imageUrl || ""
            });
            // 2. We populate the sender so the frontend gets the username!
            await newMessage.populate("sender", "username");
            // 3. Now broadcast the permanently saved message!
            io.to(data.hubId).emit("receive_message", newMessage);
        }
        catch (err) {
            console.error("Error saving message:", err);
        }
    });
    socket.on("disconnect", () => {
        console.log("User disconnected ");
    });
    socket.on("send_private_message", async (data) => {
        try {
            // Enforce role-based safety: Students cannot message other students
            const senderUser = await User_1.default.findById(data.sender);
            const receiverUser = await User_1.default.findById(data.receiver);
            if (senderUser.role === "student" && receiverUser.role === "student") {
                return socket.emit("private_message_error", "Students cannot message other students privately.");
            }
            const newMessage = await Message_1.default.create({
                receiver: data.receiver,
                sender: data.sender,
                text: data.text,
                imageUrl: data.imageUrl || ""
            });
            await newMessage.populate("sender", "username");
            await newMessage.populate("receiver", "username");
            io.to(data.receiver).emit("receive_private_message", newMessage);
            io.to(data.sender).emit("receive_private_message", newMessage);
        }
        catch (err) {
            console.error("Error saving message:", err);
        }
    });
});
server.listen(3000, () => {
    console.log("backend server is running");
});
//# sourceMappingURL=index.js.map