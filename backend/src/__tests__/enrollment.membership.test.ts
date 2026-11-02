import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Request, Response, NextFunction } from 'express';

import User from '../models/User';
import Hub from '../models/Hub';
import Class from '../models/Class';
import Membership from '../models/Membership';
import authorize from '../middleware/requireHubRole';
import {
  enrollUserInHub,
  removeUserFromHub,
  assignStudentToClass,
  joinClassByInviteToken,
  joinHubOrClassByInviteToken
} from '../services/membershipService';

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

// Helper to test authorize middleware directly
const runAuthorizeMiddleware = async (
  roles: string[],
  userId: string,
  hubId: string
): Promise<{ statusCode: number | null; message: string | null; nextCalled: boolean }> => {
  let nextCalled = false;
  let statusCode: number | null = null;
  let message: string | null = null;

  const req: any = {
    user: { userId },
    params: { hubId },
    body: {}
  };

  const res: any = {
    status: (code: number) => {
      statusCode = code;
      return {
        json: (data: any) => {
          message = data?.message || data?.error || JSON.stringify(data);
        }
      };
    }
  };

  const next: NextFunction = () => {
    nextCalled = true;
  };

  const middleware = authorize(...roles);
  await middleware(req, res, next);

  return { statusCode, message, nextCalled };
};

describe("Enrollment & Authorization Single Source of Truth (Membership)", () => {
  it("Path 1: assignStudentToClass creates Membership and grants authorization", async () => {
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
      title: "Math Hub",
      teacher: teacher._id,
      inviteToken: "hub-math-123"
    });

    const mathClass = await Class.create({
      title: "Algebra 101",
      teacher: teacher._id,
      hub: hub._id,
      inviteToken: "class-alg-123"
    });

    // Before assignment: Student is NOT authorized
    const beforeAuth = await runAuthorizeMiddleware(["student"], student._id.toString(), hub._id.toString());
    expect(beforeAuth.nextCalled).toBe(false);
    expect(beforeAuth.statusCode).toBe(403);

    // Assign student to class
    const updatedClass = await assignStudentToClass(student._id, mathClass._id);
    expect(updatedClass?.students.map(s => s.toString())).toContain(student._id.toString());

    // 1. Authoritative Membership must exist
    const membership = await Membership.findOne({ user: student._id, hub: hub._id });
    expect(membership).not.toBeNull();
    expect(membership?.role).toBe("student");

    // 2. Denormalized collections are in sync
    const updatedHub = await Hub.findById(hub._id);
    const updatedStudent = await User.findById(student._id);
    expect(updatedHub?.students.map(s => s.toString())).toContain(student._id.toString());
    expect(updatedStudent?.hubs.map(h => h.toString())).toContain(hub._id.toString());
    expect(updatedStudent?.classes.map(c => c.toString())).toContain(mathClass._id.toString());

    // 3. Authorization check now SUCCEEDS
    const afterAuth = await runAuthorizeMiddleware(["student"], student._id.toString(), hub._id.toString());
    expect(afterAuth.nextCalled).toBe(true);
    expect(afterAuth.statusCode).toBeNull();
  });

  it("Path 2: joinClassByInviteToken creates Membership and grants authorization", async () => {
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
      title: "Physics Hub",
      teacher: teacher._id,
      inviteToken: "hub-phys-456"
    });

    const physClass = await Class.create({
      title: "Mechanics",
      teacher: teacher._id,
      hub: hub._id,
      inviteToken: "token-mechanics"
    });

    const result = await joinClassByInviteToken(student._id, "token-mechanics");
    expect(result).not.toBeNull();
    expect(result?.alreadyJoined).toBe(false);

    // Authoritative Membership exists
    const membership = await Membership.findOne({ user: student._id, hub: hub._id });
    expect(membership).not.toBeNull();
    expect(membership?.role).toBe("student");

    // Authorization check passes
    const authResult = await runAuthorizeMiddleware(["student"], student._id.toString(), hub._id.toString());
    expect(authResult.nextCalled).toBe(true);
  });

  it("Path 3: joinHubOrClassByInviteToken creates Membership for both hub and cohort tokens", async () => {
    const teacher = await User.create({
      username: "teacher3",
      email: "t3@example.com",
      password: "password123",
      role: "teacher"
    });

    const studentA = await User.create({
      username: "studentA",
      email: "sa@example.com",
      password: "password123",
      role: "student"
    });

    const studentB = await User.create({
      username: "studentB",
      email: "sb@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "Biology Hub",
      teacher: teacher._id,
      inviteToken: "bio-hub-token"
    });

    const bioClass = await Class.create({
      title: "Genetics",
      teacher: teacher._id,
      hub: hub._id,
      inviteToken: "bio-class-token"
    });

    // Student A joins directly via Hub token
    const joinHubRes = await joinHubOrClassByInviteToken(studentA._id, "bio-hub-token");
    expect(joinHubRes?.type).toBe("hub");
    const memA = await Membership.findOne({ user: studentA._id, hub: hub._id });
    expect(memA).not.toBeNull();
    const authA = await runAuthorizeMiddleware(["student"], studentA._id.toString(), hub._id.toString());
    expect(authA.nextCalled).toBe(true);

    // Student B joins via Class Cohort token
    const joinClassRes = await joinHubOrClassByInviteToken(studentB._id, "bio-class-token");
    expect(joinClassRes?.type).toBe("class");
    const memB = await Membership.findOne({ user: studentB._id, hub: hub._id });
    expect(memB).not.toBeNull();
    const authB = await runAuthorizeMiddleware(["student"], studentB._id.toString(), hub._id.toString());
    expect(authB.nextCalled).toBe(true);
  });

  it("Path 4: removeUserFromHub deletes Membership and immediately revokes authorization", async () => {
    const teacher = await User.create({
      username: "teacher4",
      email: "t4@example.com",
      password: "password123",
      role: "teacher"
    });

    const student = await User.create({
      username: "student4",
      email: "s4@example.com",
      password: "password123",
      role: "student"
    });

    const hub = await Hub.create({
      title: "History Hub",
      teacher: teacher._id,
      inviteToken: "hist-hub"
    });

    const histClass = await Class.create({
      title: "World History",
      teacher: teacher._id,
      hub: hub._id
    });

    // Enroll
    await assignStudentToClass(student._id, histClass._id);
    const beforeAuth = await runAuthorizeMiddleware(["student"], student._id.toString(), hub._id.toString());
    expect(beforeAuth.nextCalled).toBe(true);

    // Remove user from hub (e.g. leave or kicked)
    await removeUserFromHub(student._id, hub._id);

    // Membership must be gone
    const memAfter = await Membership.findOne({ user: student._id, hub: hub._id });
    expect(memAfter).toBeNull();

    // Cascaded references removed
    const hubAfter = await Hub.findById(hub._id);
    const classAfter = await Class.findById(histClass._id);
    const studentAfter = await User.findById(student._id);

    expect(hubAfter?.students.map(s => s.toString())).not.toContain(student._id.toString());
    expect(classAfter?.students.map(s => s.toString())).not.toContain(student._id.toString());
    expect(studentAfter?.hubs.map(h => h.toString())).not.toContain(hub._id.toString());
    expect(studentAfter?.classes.map(c => c.toString())).not.toContain(histClass._id.toString());

    // Authorization is REVOKED
    const afterAuth = await runAuthorizeMiddleware(["student"], student._id.toString(), hub._id.toString());
    expect(afterAuth.nextCalled).toBe(false);
    expect(afterAuth.statusCode).toBe(403);
  });

  it("Path 5: Role-based enforcement (Student cannot perform Teacher/Owner actions)", async () => {
    const student = await User.create({
      username: "student5",
      email: "s5@example.com",
      password: "password123",
      role: "student"
    });

    const hubId = new mongoose.Types.ObjectId();

    await enrollUserInHub(student._id, hubId, "student");

    // Student can access student-allowed endpoints
    const studentAuth = await runAuthorizeMiddleware(["student", "owner"], student._id.toString(), hubId.toString());
    expect(studentAuth.nextCalled).toBe(true);

    // Student is forbidden from owner/co_teacher endpoints
    const ownerAuth = await runAuthorizeMiddleware(["owner", "co_teacher"], student._id.toString(), hubId.toString());
    expect(ownerAuth.nextCalled).toBe(false);
    expect(ownerAuth.statusCode).toBe(403);
  });
});
