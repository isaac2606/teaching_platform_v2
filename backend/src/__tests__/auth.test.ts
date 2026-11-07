import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../index'; 
import User from '../models/User';

let mongoServer: MongoMemoryServer;

// --- TEST SETUP BOILERPLATE ---
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  // Ensure unique indexes are built
  await User.init();
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
// ------------------------------

describe("Auth Routes Integration Tests", () => {
  
  it("should block registration if Zod validation fails (e.g. password too short)", async () => {
    const res = await request(app)
      .post("/api/auth/Register")
      .send({
        username: "johndoe",
        email: "john@example.com",
        password: "123", // <--- FAILS ZOD VALIDATION
        role: "student"
      });

    expect(res.status).toBe(400); // Expecting Bad Request
    expect(res.body.message).toBe("Validation failed ");
  });

  it("should successfully register a user and return HttpOnly cookies", async () => {
    const res = await request(app)
      .post("/api/auth/Register")
      .send({
          username: "johhnyboi",
          email: "john@gmail.com",
          password: "99769276a",
          role: "teacher"
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("user registered succesfully");

    // We check if the 'set-cookie' header exists and is an array of strings
    expect(res.headers['set-cookie']).toBeDefined();
    
    const cookies = res.headers['set-cookie'] as string[] | string | undefined;
    const cookiesString = Array.isArray(cookies) ? cookies.join(';') : (cookies || '');
    
    expect(cookiesString).toContain('accessToken=');
    expect(cookiesString).toContain('HttpOnly');
  });

  it("should block sequential duplicate registration with the same email", async () => {
    // First registration
    const res1 = await request(app)
      .post("/api/auth/Register")
      .send({
        username: "user1",
        email: "duplicate@example.com",
        password: "password123",
        role: "student"
      });
    expect(res1.status).toBe(200);

    // Second registration with the exact same email
    const res2 = await request(app)
      .post("/api/auth/Register")
      .send({
        username: "user2",
        email: "duplicate@example.com",
        password: "password123",
        role: "student"
      });
    expect(res2.status).toBe(400);
    expect(res2.body.message).toBe("User with this email already exists.");
  });

  it("should block duplicate registration even if email casing differs (case-insensitive)", async () => {
    await request(app)
      .post("/api/auth/Register")
      .send({
        username: "userA",
        email: "casecheck@example.com",
        password: "password123",
        role: "student"
      });

    // Try registering with uppercase
    const res = await request(app)
      .post("/api/auth/Register")
      .send({
        username: "userB",
        email: "CASECHECK@EXAMPLE.COM",
        password: "password123",
        role: "student"
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User with this email already exists.");
  });

  it("should prevent duplicate emails under concurrent/race condition requests via database unique index", async () => {
    // Send two simultaneous registration requests for the same email
    const [resA, resB] = await Promise.all([
      request(app)
        .post("/api/auth/Register")
        .send({
          username: "concurrent1",
          email: "racecondition@example.com",
          password: "password123",
          role: "student"
        }),
      request(app)
        .post("/api/auth/Register")
        .send({
          username: "concurrent2",
          email: "racecondition@example.com",
          password: "password123",
          role: "student"
        })
    ]);

    // Exactly one must succeed (200) and one must be rejected (400)
    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([200, 400]);

    // In the database, only one user exists
    const usersInDb = await User.find({ email: "racecondition@example.com" });
    expect(usersInDb).toHaveLength(1);
  });

});
