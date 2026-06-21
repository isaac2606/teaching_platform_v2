require('dotenv').config({ path: './backend/.env' });
const mongoose = require("mongoose");
const User = require("./backend/models/User");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL).then(async () => {
  console.log("Connected to MongoDB.");
  
  try {
    const result = await User.updateMany({}, { $set: { recentUsers: [] } });
    console.log(`Successfully cleared recentUsers for ${result.modifiedCount} users.`);
  } catch (error) {
    console.error("Error clearing users:", error);
  } finally {
    mongoose.disconnect();
  }
}).catch(err => {
  console.error("MongoDB connection error:", err);
});
