const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan"); 
const path = require("path"); 
dotenv.config();

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const groupRoute = require("./routes/group");
const announcementRoute = require("./routes/announcement");
const classRoute = require("./routes/class");


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
app.use("/api/group", groupRoute);
app.use("/api/announcement",announcementRoute);
app.use("/api/class",classRoute)
app.get("/test", (req, res) => {
  res.json({
    message:"frontend and backend are connected"});
});

app.listen(3000,()=>{
    console.log("backend server is running")
})