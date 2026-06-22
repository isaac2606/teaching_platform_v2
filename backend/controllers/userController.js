const User = require("../models/User");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile", error: err.message });
    }
};

const getContact  = async (req,res)=>{

    try{
        
        const user = await User.findById(req.user.userId).populate("recentUsers");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user.recentUsers || [])

    }catch(err){
        console.error("GET CONTACT ERROR:", err);
        res.status(500).json({ message: err.message, stack: err.stack })
    }
}


const addNewContact  =async (req,res)=>{

    try{
        const newContact = await User.findById(req.body.newContact);
        if(req.user.role === "student" && newContact.role ==="student")
            res.status(403).json({message: "cannot contact student privatly"})
        else{
            const updatedUser = await User.findByIdAndUpdate(
                req.user.userId,
                { $addToSet: { recentUsers: newContact._id } },
                { new: true } // Return updated doc
            );
            res.status(200).json({message: "Contact added", recentUsers: updatedUser.recentUsers});
        }
        
    }catch(err){
        console.error("Error in addNewContact:", err);
        res.status(500).json(err)
    }
}


module.exports = {
    getAllUsers,
    getUserProfile,
    addNewContact,
    getContact
};
