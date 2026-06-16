const Group = require("../models/Group");
const User = require("../models/User");
const crypto = require("crypto");

const createGroup = async (req, res) => {
  try {
    const group = new Group({
      title: req.body.title,
      teacher: req.user.userId,
    });
    const savedGroup = await group.save();

    await User.findByIdAndUpdate({ _id: req.user.userId }, { $push: { groups: savedGroup._id } });
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json(err);
  }
};



const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.students.includes(req.user.userId)) {
      await group.updateOne({ $pull: { students: req.user.userId } });
      await User.updateOne(
        { _id: req.user.userId },
        { $pull: { groups: group._id } }
      );
      res.status(200).json({ message: "Student left the group" });
    } else {
      res.status(200).json({ message: "Student was not in the group" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({});
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    if (role === "teacher") {
      const user = await User.findById(userId).populate('groups');
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.status(200).json(user.groups);
    } else if (role === "student") {
      const groups = await Group.find({ students: userId });
      return res.status(200).json(groups);
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('teacher', 'username email')
      .populate('students', 'username email');
      
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getGroupByInviteToken = async (req, res) => {
  try {
    const group = await Group.findOne({ inviteToken: req.params.inviteToken });
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateGroup = async (req, res) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      { $set: { title: req.body.title } },
      { new: true }
    );
    if (!updatedGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(updatedGroup);
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
   
    await User.updateMany(
      { groups: req.params.id },
      { $pull: { groups: req.params.id } }
    );
    
    res.status(200).json({ message: "Group has been deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all hubs for this teacher and populate classes
    const groups = await Group.find({ teacher: userId }).populate('classes');
    
    let allStudentIds = new Set();
    let outstandingDues = 0;
    let sessionsToday = 0;
    
    const today = new Date().toISOString().split('T')[0]; // simple YYYY-MM-DD

    groups.forEach(group => {
       // Unique students across all hubs
       group.students.forEach(studentId => allStudentIds.add(studentId.toString()));
       
       // Calculate basic stats from classes
       group.classes.forEach(c => {
            // Very basic dues calculation for now: Dues * number of students in cohort
            outstandingDues += (c.dues || 0) * (c.students?.length || 0);
            
            if (c.date && c.date.startsWith(today)) {
                sessionsToday++;
            }
       });
    });

    res.status(200).json({
        totalStudents: allStudentIds.size,
        activeHubs: groups.length,
        outstandingDues,
        sessionsToday
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const fixIndex = async (req, res) => {
  try {
    const result = await Group.collection.dropIndex('inviteToken_1');
    res.status(200).json({ message: "Index dropped successfully", result });
  } catch (err) {
    if (err.code === 27) { // IndexNotFound
       return res.status(200).json({ message: "Index already dropped or doesn't exist" });
    }
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createGroup,
  leaveGroup,
  getAllGroups,
  getMyGroups,
  getGroupById,
  getGroupByInviteToken,
  updateGroup,
  deleteGroup,
  getDashboardStats,
  fixIndex
};
