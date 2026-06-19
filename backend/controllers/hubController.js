const Hub = require("../models/Hub");
const User = require("../models/User");
const crypto = require("crypto");

const createHub = async (req, res) => {
  try {
    const inviteToken = crypto.randomBytes(8).toString("hex");
    const hub = new Hub({
      title: req.body.title,
      teacher: req.user.userId,
      inviteToken:inviteToken
    });
    const savedHub = await hub.save();

    await User.findByIdAndUpdate({ _id: req.user.userId }, { $push: { hubs: savedHub._id } });
    res.status(201).json(savedHub);
  } catch (err) {
    res.status(500).json(err);
  }
};

const leaveHub = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id);
    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }

    if (hub.students.includes(req.user.userId)) {
      await hub.updateOne({ $pull: { students: req.user.userId } });
      await User.updateOne(
        { _id: req.user.userId },
        { $pull: { hubs: hub._id } }
      );
      res.status(200).json({ message: "Student left the hub" });
    } else {
      res.status(200).json({ message: "Student was not in the hub" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllHubs = async (req, res) => {
  try {
    const hubs = await Hub.find({});
    res.status(200).json(hubs);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getMyHubs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role === "teacher") {
      const user = await User.findById(userId).populate('hubs');
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(user.hubs);
    } else if (role === "student") {
      const hubs = await Hub.find({ students: userId });
      return res.status(200).json(hubs);
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getHubById = async (req, res) => {
  try {
    const hub = await Hub.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students', 'username email');
      
    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }
    res.status(200).json(hub);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getHubByInviteToken = async (req, res) => {
  try {
    const hub = await Hub.findOne({ inviteToken: req.params.inviteToken });
    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }
    res.status(200).json(hub);
  } catch (err) {
    res.status(500).json(err);
  }
};

const joinHubByInviteToken = async (req, res) => {
    try {
        const hub = await Hub.findOne({ inviteToken: req.params.inviteToken });
        if (!hub) {
            return res.status(404).json({ message: "Hub not found or invalid invite token." });
        }
        
        if (!hub.students.includes(req.user.userId)) {
            // Add student to the Cohort
            await hub.updateOne({ $push: { students: req.user.userId } });
            
            // Add Hub to User's list
            await User.updateOne(
                { _id: req.user.userId },
                { 
                    $addToSet: { hubs: hub._id },
                }
            );

            res.status(200).json({ message: "Student joined the Hub successfully" });
        } else {
            res.status(200).json({ message: "Student already in the Hub" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const updateHub = async (req, res) => {
  try {
    const updatedHub = await Hub.findByIdAndUpdate(
      req.params.id,
      { $set: { title: req.body.title } },
      { new: true }
    );
    if (!updatedHub) {
      return res.status(404).json({ message: "Hub not found" });
    }
    res.status(200).json(updatedHub);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteHub = async (req, res) => {
  try {
    const hub = await Hub.findByIdAndDelete(req.params.id);
    if (!hub) {
      return res.status(404).json({ message: "Hub not found" });
    }
   
    await User.updateMany(
      { hubs: req.params.id },
      { $pull: { hubs: req.params.id } }
    );
    
    res.status(200).json({ message: "Hub has been deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const hubs = await Hub.find({ teacher: userId }).populate('classes');
    
    let allStudentIds = new Set();
    let outstandingDues = 0;
    let sessionsToday = 0;
    
    const today = new Date().toISOString().split('T')[0]; 

    hubs.forEach(hub => {
       hub.students.forEach(studentId => allStudentIds.add(studentId.toString()));
       
       hub.classes.forEach(c => {
            outstandingDues += (c.dues || 0) * (c.students?.length || 0);
            
            if (c.date && c.date.startsWith(today)) {
                sessionsToday++;
            }
       });
    });

    res.status(200).json({
        totalStudents: allStudentIds.size,
        activeHubs: hubs.length,
        outstandingDues,
        sessionsToday
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const fixIndex = async (req, res) => {
  try {
    const result = await Hub.collection.dropIndex('inviteToken_1');
    res.status(200).json({ message: "Index dropped successfully", result });
  } catch (err) {
    if (err.code === 27) { 
       return res.status(200).json({ message: "Index already dropped or doesn't exist" });
    }
    res.status(500).json({ error: err.message });
  }
};

const getChatHistory = async (req,res)=>{
    try{
        const chatHistory = await Hub.findById(req.params.hubId).populate("sender","username").sort({createdAt:1});

        res.status(200).json(chatHistory)

    }catch(err){
        res.status(500).json(err)
    }
}


module.exports = {
  createHub,
  leaveHub,
  getAllHubs,
  getMyHubs,
  getHubById,
  getHubByInviteToken,
  updateHub,
  deleteHub,
  getDashboardStats,
  fixIndex,
  getChatHistory,
  joinHubByInviteToken
};
