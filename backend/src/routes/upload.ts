import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import Upload from "../middleware/upload";

import multer from "multer";

router.post("/", verifyToken, (req, res) => {
  Upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the 10MB limit." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }
    // Cloudinary returns the full absolute HTTPS URL in req.file.path
    res.status(200).json({ filename: req.file.path });
  });
});

export default router;
