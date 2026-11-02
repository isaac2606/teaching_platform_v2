import mongoose from "mongoose";
import Membership, { IMembership } from "../models/Membership";
import Hub from "../models/Hub";
import Class from "../models/Class";
import User from "../models/User";

export type HubRole = "owner" | "co_teacher" | "student";

/**
 * Authoritative Hub Enrollment & Membership Service.
 * Centralizes all membership operations so Membership is the Single Source of Truth
 * for both enrollment lifecycle and authorization checks.
 */

/**
 * Enrolls a user in a Hub by creating or updating their Membership record,
 * and synchronizing the denormalized Hub and User collections.
 */
export const enrollUserInHub = async (
  userId: string | mongoose.Types.ObjectId,
  hubId: string | mongoose.Types.ObjectId,
  role: HubRole = "student"
): Promise<IMembership> => {
  // 1. Authoritative Membership record (upsert)
  const membership = await Membership.findOneAndUpdate(
    { user: userId, hub: hubId },
    { $set: { role } },
    { upsert: true, returnDocument: 'after' }
  );

  // 2. Synchronize denormalized Hub and User collections
  if (role === "student") {
    await Hub.findByIdAndUpdate(hubId, {
      $addToSet: { students: userId }
    });
  }

  await User.findByIdAndUpdate(userId, {
    $addToSet: { hubs: hubId }
  });

  return membership;
};

/**
 * Removes a user from a Hub, deleting their Membership and cascading
 * cleanup across all associated classes and user lists.
 */
export const removeUserFromHub = async (
  userId: string | mongoose.Types.ObjectId,
  hubId: string | mongoose.Types.ObjectId
): Promise<boolean> => {
  // 1. Delete authoritative Membership record
  const deleteResult = await Membership.deleteOne({ user: userId, hub: hubId });

  // 2. Find classes in this hub to remove from user's class list
  const classesInHub = await Class.find({ hub: hubId });
  const classIds = classesInHub.map(c => c._id);

  // 3. Remove student from Class.students
  await Class.updateMany(
    { hub: hubId },
    { $pull: { students: userId } }
  );

  // 4. Remove from Hub.students
  await Hub.findByIdAndUpdate(hubId, {
    $pull: { students: userId }
  });

  // 5. Remove hub and its classes from User
  await User.findByIdAndUpdate(userId, {
    $pull: { hubs: hubId },
    $pullAll: { classes: classIds }
  });

  return (deleteResult.deletedCount ?? 0) > 0;
};

/**
 * Assigns a student to a Class, ensuring they have an authoritative
 * Hub Membership record so authorization checks succeed.
 */
export const assignStudentToClass = async (
  studentId: string | mongoose.Types.ObjectId,
  classId: string | mongoose.Types.ObjectId
) => {
  const targetClass = await Class.findById(classId);
  if (!targetClass) {
    throw new Error("Class not found");
  }

  // 1. Authoritative Hub Membership
  await enrollUserInHub(studentId, targetClass.hub, "student");

  // 2. Add to Class.students
  const updatedClass = await Class.findByIdAndUpdate(
    classId,
    { $addToSet: { students: studentId } },
    { returnDocument: 'after' }
  );

  // 3. Add to User.classes
  await User.findByIdAndUpdate(studentId, {
    $addToSet: { classes: targetClass._id }
  });

  return updatedClass;
};

/**
 * Enrolls a student in a class via class invite token.
 */
export const joinClassByInviteToken = async (
  userId: string | mongoose.Types.ObjectId,
  inviteToken: string
) => {
  const classObj = await Class.findOne({ inviteToken });
  if (!classObj) {
    return null;
  }

  const isAlreadyEnrolled = classObj.students.some(
    s => s.toString() === userId.toString()
  );

  // 1. Authoritative Hub Membership
  await enrollUserInHub(userId, classObj.hub, "student");

  if (isAlreadyEnrolled) {
    return { classObj, alreadyJoined: true };
  }

  // 2. Add to Class.students
  await classObj.updateOne({ $addToSet: { students: userId } });

  // 3. Add to User.classes
  await User.findByIdAndUpdate(userId, {
    $addToSet: { classes: classObj._id }
  });

  return { classObj, alreadyJoined: false };
};

/**
 * Handles joining either a Hub or a Class Cohort using an invite token.
 */
export const joinHubOrClassByInviteToken = async (
  userId: string | mongoose.Types.ObjectId,
  inviteToken: string
) => {
  // Check Hub token first
  const hub = await Hub.findOne({ inviteToken });
  if (hub) {
    const isAlreadyMember = await Membership.findOne({ user: userId, hub: hub._id });
    await enrollUserInHub(userId, hub._id, "student");
    return {
      type: "hub" as const,
      entity: hub,
      alreadyJoined: !!isAlreadyMember
    };
  }

  // Check Class Cohort token
  const classObj = await Class.findOne({ inviteToken });
  if (classObj) {
    const result = await joinClassByInviteToken(userId, inviteToken);
    return {
      type: "class" as const,
      entity: result?.classObj,
      alreadyJoined: result?.alreadyJoined ?? false
    };
  }

  return null;
};
