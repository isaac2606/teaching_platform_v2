import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User';
import Class from '../models/Class';
import Hub from '../models/Hub';

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

describe("User classes field & persistence tests", () => {
  it("should initialize user with an empty classes array by default", async () => {
    const user = new User({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "student"
    });
    const savedUser = await user.save();

    expect(savedUser.classes).toBeDefined();
    expect(Array.isArray(savedUser.classes)).toBe(true);
    expect(savedUser.classes.length).toBe(0);
  });

  it("should persist class IDs added via $addToSet without being stripped by Mongoose strict schema", async () => {
    const user = await User.create({
      username: "student1",
      email: "student1@example.com",
      password: "password123",
      role: "student"
    });

    const mockClassId = new mongoose.Types.ObjectId();

    await User.updateOne(
      { _id: user._id },
      { $addToSet: { classes: mockClassId } }
    );

    const fetchedUser = await User.findById(user._id);
    expect(fetchedUser).not.toBeNull();
    expect(fetchedUser?.classes).toHaveLength(1);
    expect(fetchedUser?.classes[0]?.toString()).toBe(mockClassId.toString());
  });

  it("should remove class IDs via $pull when class is removed or left", async () => {
    const classId1 = new mongoose.Types.ObjectId();
    const classId2 = new mongoose.Types.ObjectId();

    const user = await User.create({
      username: "student2",
      email: "student2@example.com",
      password: "password123",
      role: "student",
      classes: [classId1, classId2]
    });

    expect(user.classes).toHaveLength(2);

    await User.updateOne(
      { _id: user._id },
      { $pull: { classes: classId1 } }
    );

    const fetchedUser = await User.findById(user._id);
    expect(fetchedUser?.classes).toHaveLength(1);
    expect(fetchedUser?.classes[0]?.toString()).toBe(classId2.toString());
  });

  it("should remove class IDs across multiple users using updateMany", async () => {
    const sharedClassId = new mongoose.Types.ObjectId();

    const teacher = await User.create({
      username: "teacher1",
      email: "teacher1@example.com",
      password: "password123",
      role: "teacher",
      classes: [sharedClassId]
    });

    const student = await User.create({
      username: "student3",
      email: "student3@example.com",
      password: "password123",
      role: "student",
      classes: [sharedClassId]
    });

    await User.updateMany(
      { classes: sharedClassId },
      { $pull: { classes: sharedClassId } }
    );

    const updatedTeacher = await User.findById(teacher._id);
    const updatedStudent = await User.findById(student._id);

    expect(updatedTeacher?.classes).toHaveLength(0);
    expect(updatedStudent?.classes).toHaveLength(0);
  });
});
