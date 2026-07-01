import { Request, Response, NextFunction } from "express";
import  from ;
import {  } from ;
import  from ;.v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eduspace_uploads",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "gif"],
  },
});

const upload = multer({ storage: storage });

export default ;