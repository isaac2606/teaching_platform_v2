import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/User";
import Hub from "../models/Hub";
import Class from "../models/Class";
import Assignment from "../models/Assignment";
import Submission from "../models/submission";
import Announcement from "../models/Announcement";
import Attendance from "../models/Attendance";
import Message from "../models/Message";
import Membership from "../models/Membership";
import {
  cascadeDeleteClass,
  cascadeDeleteHub
} from "../services/cascadeDeleteService";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
});

describe("Cascading Deletions (No Orphaned Records)", () => {
  it("cascadeDeleteClass: cleans up attendance, references in assignments, announcements, hubs, and users", async () => {
    const teacher = await User.create({
      username: "teacher1",
      email: "t1@example.com",
      password: "password123",
      role: "teacher"
    });

    const student = await User.create({
      username: "student1",
      email: "s1@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "Science Hub",
      teacher: teacher._id,
      inviteToken: "sci-token-1"
    });

    const classObj = await Class.create({
      title: "Physics 101",
      teacher: teacher._id,
      hub: hub._id,
      students: [student._id]
    });

    // Link class to Hub & Student
    await Hub.findByIdAndUpdate(hub._id, { $push: { classes: classObj._id } });
    await User.findByIdAndUpdate(student._id, { $push: { classes: classObj._id } });

    // Create an Attendance record for this class
    const attendance = await Attendance.create({
      student: student._id,
      classCohort: classObj._id,
      date: new Date(),
      status: "Present"
    });

    // Create an Assignment targeting this class
    const assignment = await Assignment.create({
      title: "Lab Report 1",
      teacher: teacher._id,
      hub: hub._id,
      dueDate: new Date(),
      classes: [classObj._id]
    });

    // Create an Announcement targeting this class
    const announcement = await Announcement.create({
      title: "Exam Date",
      teacher: teacher._id,
      hubs: [hub._id],
      targetClasses: [classObj._id]
    });

    // Execute cascade delete
    const result = await cascadeDeleteClass(classObj._id, teacher._id);
    expect(result).not.toBeNull();

    // 1. Class document is deleted
    const deletedClass = await Class.findById(classObj._id);
    expect(deletedClass).toBeNull();

    // 2. Attendance record is deleted (no orphan)
    const deletedAttendance = await Attendance.findById(attendance._id);
    expect(deletedAttendance).toBeNull();

    // 3. Assignment has class ID pulled
    const updatedAssignment = await Assignment.findById(assignment._id);
    expect(updatedAssignment?.classes).toHaveLength(0);

    // 4. Announcement has class ID pulled
    const updatedAnnouncement = await Announcement.findById(announcement._id);
    expect(updatedAnnouncement?.targetClasses).toHaveLength(0);

    // 5. Hub has class ID pulled
    const updatedHub = await Hub.findById(hub._id);
    expect(updatedHub?.classes).toHaveLength(0);

    // 6. Student has class ID pulled
    const updatedStudent = await User.findById(student._id);
    expect(updatedStudent?.classes).toHaveLength(0);
  });

  it("cascadeDeleteHub: cleans up all child classes, assignments, submissions, attendance, messages, memberships, and user links", async () => {
    const teacher = await User.create({
      username: "teacher2",
      email: "t2@example.com",
      password: "password123",
      role: "teacher"
    });

    const student = await User.create({
      username: "student2",
      email: "s2@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "Literature Hub",
      teacher: teacher._id,
      inviteToken: "lit-token-1"
    });

    const classObj = await Class.create({
      title: "Poetry",
      teacher: teacher._id,
      hub: hub._id,
      students: [student._id]
    });

    // Membership
    const membership = await Membership.create({
      user: student._id,
      hub: hub._id,
      role: "student"
    });

    // Link to User
    await User.findByIdAndUpdate(student._id, {
      $push: { hubs: hub._id, classes: classObj._id }
    });

    // Assignment
    const assignment = await Assignment.create({
      title: "Essay 1",
      teacher: teacher._id,
      hub: hub._id,
      dueDate: new Date(),
      classes: [classObj._id]
    });

    // Submission
    const submission = await Submission.create({
      assignment: assignment._id,
      student: student._id,
      content: "Here is my essay"
    });

    // Attendance
    const attendance = await Attendance.create({
      student: student._id,
      classCohort: classObj._id,
      date: new Date(),
      status: "Present"
    });

    // Announcement
    const announcement = await Announcement.create({
      title: "Welcome",
      teacher: teacher._id,
      hubs: [hub._id]
    });

    // Message
    const message = await Message.create({
      sender: student._id,
      hubId: hub._id,
      text: "Hello everyone"
    });

    // Execute cascade delete for the Hub
    const result = await cascadeDeleteHub(hub._id);
    expect(result).not.toBeNull();

    // Verify all resources are completely removed
    expect(await Hub.findById(hub._id)).toBeNull();
    expect(await Class.findById(classObj._id)).toBeNull();
    expect(await Assignment.findById(assignment._id)).toBeNull();
    expect(await Submission.findById(submission._id)).toBeNull();
    expect(await Attendance.findById(attendance._id)).toBeNull();
    expect(await Announcement.findById(announcement._id)).toBeNull();
    expect(await Message.findById(message._id)).toBeNull();
    expect(await Membership.findById(membership._id)).toBeNull();

    // Verify user references are pruned
    const updatedStudent = await User.findById(student._id);
    expect(updatedStudent?.hubs).toHaveLength(0);
    expect(updatedStudent?.classes).toHaveLength(0);
  });
});
