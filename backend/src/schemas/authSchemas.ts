import { z } from "zod/v3";

export const RegisterSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher"])
});

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address"),
     password: z.string().min(6, "Password must be at least 6 characters"),
})