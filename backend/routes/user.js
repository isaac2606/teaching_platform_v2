const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getAllUsers, getUserProfile ,getContact ,addNewContact} = require("../controllers/userController");
const { verify } = require("jsonwebtoken");

const User = require("../models/User");
router.get("/fix-db", async (req, res) => {
    try {
        await User.updateMany({}, { $set: { recentUsers: [] } });
        res.send("<h1>Database fixed! You can now use the app.</h1>");
    } catch (err) {
        res.send("Error fixing db: " + err.message);
    }
});

router.get("/getUsers", verifyToken, getAllUsers);
router.get("/getContact",verifyToken,getContact);

router.get("/:id", verifyToken,getUserProfile);
router.post("/addContact",verifyToken,addNewContact)


module.exports = router;