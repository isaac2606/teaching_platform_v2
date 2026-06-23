const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/verifyToken");
const Upload = require("../middleware/upload");

router.post("/", verifyToken, Upload.single("image"), (req, res) => {
  try {
    res.status(200).json({ filename: req.file.filename });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
