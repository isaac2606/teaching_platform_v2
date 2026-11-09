import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Request, Response } from "express";

import User from "../models/User";
import Hub from "../models/Hub";
import Class from "../models/Class";
import Attendance from "../models/Attendance";
import { recordAttendance } from "../controllers/classController";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  await Attendance.init(); // Build indexes
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

const executeRecordAttendance = async (classId: string, records: any) => {
  let statusCode: number | null = null;
  let responseBody: any = null;

  const req: any = {
    params: { classId },
    body: { records }
  };

  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          responseBody = data;
        }
      };
    }
  };

  await recordAttendance(req, res);
  return { statusCode, responseBody };
};

describe("Attendance Uniqueness & Validation Tests", () => {
  it("rejects recording attendance if student is NOT enrolled in the class", async () => {
    const teacher = await User.create({
      username: "teacher1",
      email: "t1@example.com",
      password: "password123",
      role: "teacher"
    });

    const enrolledStudent = await User.create({
      username: "student1",
      email: "s1@example.com",
      password: "password123",
      role: "student"
    });

    const outsiderStudent = await User.create({
      username: "outsider",
      email: "outsider@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "History Hub",
      teacher: teacher._id
    });

    const targetClass = await Class.create({
      title: "Ancient Rome",
      teacher: teacher._id,
      hub: hub._id,
      students: [enrolledStudent._id]
    });

    // Attempt to record attendance for an outsider student
    const result = await executeRecordAttendance(targetClass._id.toString(), {
      [outsiderStudent._id.toString()]: "present"
    });

    expect(result.statusCode).toBe(400);
    expect(result.responseBody.message).toContain("is not enrolled in this class");

    // Ensure no attendance was recorded
    const count = await Attendance.countDocuments();
    expect(count).toBe(0);
  });

  it("rejects recording attendance if status is invalid", async () => {
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
      title: "Math Hub",
      teacher: teacher._id
    });

    const targetClass = await Class.create({
      title: "Geometry",
      teacher: teacher._id,
      hub: hub._id,
      students: [student._id]
    });

    const result = await executeRecordAttendance(targetClass._id.toString(), {
      [student._id.toString()]: "SkippedClass" // Invalid status
    });

    expect(result.statusCode).toBe(400);
    expect(result.responseBody.message).toContain("Invalid attendance status");
  });

  it("successfully records attendance for enrolled students and updates existing record on same session date (idempotent)", async () => {
    const teacher = await User.create({
      username: "teacher3",
      email: "t3@example.com",
      password: "password123",
      role: "teacher"
    });

    const student = await User.create({
      username: "student3",
      email: "s3@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "Physics Hub",
      teacher: teacher._id
    });

    const targetClass = await Class.create({
      title: "Mechanics",
      teacher: teacher._id,
      hub: hub._id,
      students: [student._id]
    });

    // 1. First record as 'Present'
    const result1 = await executeRecordAttendance(targetClass._id.toString(), {
      [student._id.toString()]: "present"
    });
    expect(result1.statusCode).toBe(200);

    const recordsAfterFirst = await Attendance.find({
      student: student._id,
      classCohort: targetClass._id
    });
    expect(recordsAfterFirst).toHaveLength(1);
    expect(recordsAfterFirst[0]?.status).toBe("Present");

    // 2. Later update the same session to 'Absent'
    const result2 = await executeRecordAttendance(targetClass._id.toString(), {
      [student._id.toString()]: "absent"
    });
    expect(result2.statusCode).toBe(200);

    // Must still have exactly 1 record (updated in place, not duplicated)
    const recordsAfterSecond = await Attendance.find({
      student: student._id,
      classCohort: targetClass._id
    });
    expect(recordsAfterSecond).toHaveLength(1);
    expect(recordsAfterSecond[0]?.status).toBe("Absent");
  });

  it("enforces database-level compound unique index on (student, classCohort, date)", async () => {
    const studentId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const sessionDate = new Date();
    sessionDate.setHours(0, 0, 0, 0);

    // First direct creation
    await Attendance.create({
      student: studentId,
      classCohort: classId,
      date: sessionDate,
      status: "Present"
    });

    // Second direct creation with identical student, class, date must fail duplicate index check
    let duplicateError: any = null;
    try {
      await Attendance.create({
        student: studentId,
        classCohort: classId,
        date: sessionDate,
        status: "Late"
      });
    } catch (err) {
      duplicateError = err;
    }

    expect(duplicateError).not.toBeNull();
    expect(duplicateError.code).toBe(11000);
  });
});
