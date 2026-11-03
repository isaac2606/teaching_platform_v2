import mongoose from "mongoose";
import Hub from "../models/Hub";
import Class from "../models/Class";
import User from "../models/User";
import Membership from "../models/Membership";
import Assignment from "../models/Assignment";
import Submission from "../models/submission";
import Announcement from "../models/Announcement";
import Attendance from "../models/Attendance";
import Message from "../models/Message";

/**
 * Service to handle cascading deletions across MongoDB collections,
 * preventing orphaned documents and stale ID references.
 */

/**
 * Cascades deletion of a Class:
 * - Deletes associated Attendance records.
 * - Cleans up class references from Assignments and Announcements.
 * - Pulls class ID from parent Hub.classes.
 * - Pulls class ID from all Users' classes arrays.
 * - Deletes the Class document.
 */
export const cascadeDeleteClass = async (
  classId: string | mongoose.Types.ObjectId,
  teacherId?: string | mongoose.Types.ObjectId
) => {
  const targetClassId = new mongoose.Types.ObjectId(classId.toString());

  const query: Record<string, any> = { _id: targetClassId };
  if (teacherId) {
    query.teacher = teacherId;
  }

  const classObj = await Class.findOne(query);
  if (!classObj) {
    return null;
  }

  // 1. Delete all Attendance records for this class cohort
  await Attendance.deleteMany({ classCohort: targetClassId });

  // 2. Remove class reference from Assignments
  await Assignment.updateMany(
    { classes: targetClassId },
    { $pull: { classes: targetClassId } }
  );

  // 3. Remove class reference from Announcements
  await Announcement.updateMany(
    { targetClasses: targetClassId },
    { $pull: { targetClasses: targetClassId } }
  );

  // 4. Remove class from parent Hub's classes array
  await Hub.findByIdAndUpdate(classObj.hub, {
    $pull: { classes: targetClassId }
  });

  // 5. Remove class from all Users' classes arrays (teacher and students)
  await User.updateMany(
    { classes: targetClassId },
    { $pull: { classes: targetClassId } }
  );

  // 6. Delete the Class document
  await Class.findByIdAndDelete(targetClassId);

  return classObj;
};

/**
 * Cascades deletion of a Hub:
 * - Finds all child Classes and Assignments.
 * - Deletes all Submissions for those Assignments.
 * - Deletes all Assignments in this Hub.
 * - Deletes all Attendance records for Classes in this Hub.
 * - Deletes all Classes in this Hub.
 * - Deletes all Announcements for this Hub.
 * - Deletes all Messages in this Hub.
 * - Deletes all Memberships for this Hub.
 * - Cleans up User.hubs and User.classes across all users.
 * - Deletes the Hub document.
 */
export const cascadeDeleteHub = async (
  hubId: string | mongoose.Types.ObjectId
) => {
  const targetHubId = new mongoose.Types.ObjectId(hubId.toString());

  const hub = await Hub.findById(targetHubId);
  if (!hub) {
    return null;
  }

  // 1. Gather all class IDs belonging to this Hub
  const classes = await Class.find({ hub: targetHubId }).select("_id");
  const classIds = classes.map((c) => c._id);

  // 2. Gather all assignment IDs belonging to this Hub
  const assignments = await Assignment.find({ hub: targetHubId }).select("_id");
  const assignmentIds = assignments.map((a) => a._id);

  // 3. Delete all Submissions for assignments in this Hub
  if (assignmentIds.length > 0) {
    await Submission.deleteMany({ assignment: { $in: assignmentIds } });
  }

  // 4. Delete all Assignments in this Hub
  await Assignment.deleteMany({ hub: targetHubId });

  // 5. Delete all Attendance records for classes in this Hub
  if (classIds.length > 0) {
    await Attendance.deleteMany({ classCohort: { $in: classIds } });
  }

  // 6. Delete all Classes in this Hub
  await Class.deleteMany({ hub: targetHubId });

  // 7. Delete all Announcements for this Hub
  await Announcement.deleteMany({ hubs: targetHubId });

  // 8. Delete all Messages in this Hub
  await Message.deleteMany({ hubId: targetHubId });

  // 9. Delete all Memberships for this Hub
  await Membership.deleteMany({ hub: targetHubId });

  // 10. Clean up Users: pull hub and class references
  await User.updateMany(
    {
      $or: [{ hubs: targetHubId }, { classes: { $in: classIds } }]
    },
    {
      $pull: {
        hubs: targetHubId,
        classes: { $in: classIds }
      }
    }
  );

  // 11. Delete the Hub document
  await Hub.findByIdAndDelete(targetHubId);

  return hub;
};
