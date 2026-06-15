const Group = require("../models/Group");
const User = require("../models/User");
const crypto = require("crypto");

const createGroup = async (req, res) => {
  try {
    const inviteToken = crypto.randomBytes(8).toString("hex");
    const group = new Group({
      title: req.body.title,
      teacher: req.user.userId,
      inviteToken: inviteToken,
    });
    const savedGroup = await group.save();

    await User.findByIdAndUpdate({ _id: req.user.userId }, { $push: { groups: savedGroup._id } });
    res.status(201).json(savedGroup);
  } catch (err) {
    res.status(500).json(err);
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ inviteToken: req.params.inviteToken });
    if (!group) {
      return res.status(404).json({ message: "Group not found or invalid invite token." });
    }

    if (!group.students.includes(req.user.userId)) {
      await group.updateOne({ $push: { students: req.user.userId } });
      await User.updateOne(
        { _id: req.user.userId },
        { $push: { groups: group._id } }
      );
      res.status(200).json({ message: "Student joined the group" });
    } else {
      res.status(200).json({ message: "Student already in the group" });
    }
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

module.exports = {
  createGroup,
  joinGroup,
  leaveGroup,
  getAllGroups,
  getMyGroups,
  getGroupById,
  getGroupByInviteToken,
  updateGroup,
  deleteGroup
};
