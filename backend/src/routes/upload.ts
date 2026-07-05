import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import Upload from "../middleware/upload";







router.post("/", verifyToken, Upload.single("image"), (req, res) => {
  try {
    // Cloudinary returns the full absolute HTTPS URL in req.file.path
    res.status(200).json({ filename: req.file.path });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json("An unknown error occurred");
    }
  }
});

export default router;
