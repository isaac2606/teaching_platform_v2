const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    groups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Group" 
    }],
    refreshToken: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
