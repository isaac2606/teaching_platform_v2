import express from "express";
const router = express.Router();

import verifyToken from "../middleware/verifyToken";
import Upload from "../middleware/upload";







router.post("/", verifyToken, Upload.single("image"), (req, res) => {
  try {
    // Cloudinary returns the full absolute HTTPS URL in req.file.path
    res.status(200).json({ filename: req.file.path });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
