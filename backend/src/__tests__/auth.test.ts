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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
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
    expect(res.body.message).toBe("Validation failed");
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
    expect(res.body.message).toBe("User registered successfully");

    // We check if the 'set-cookie' header exists and is an array of strings
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Convert the array of cookies into a single string for easy searching
    const cookiesString = res.headers['set-cookie'].join(';');
    
    expect(cookiesString).toContain('accessToken=');
    expect(cookiesString).toContain('HttpOnly');
  });

});
