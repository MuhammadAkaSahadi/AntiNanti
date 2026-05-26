import { z } from "zod";

// User validation schema
export const UserSchema = z.object({
  uid: z.string().min(1, "User ID (UID) is required"),
  email: z.string().email("Please enter a valid email address"),
  displayName: z.string().min(1, "Display name is required"),
  partnerEmail: z
    .string()
    .email("Partner email must be a valid email address")
    .or(z.literal(""))
    .optional(),
});

// Micro-task validation schema
export const MicroTaskSchema = z.object({
  id: z.string().min(1, "Micro-task ID is required"),
  title: z.string().min(1, "Micro-task title is required"),
  duration: z.number().int().positive("Duration must be a positive integer (minutes)"),
  urgency: z.enum(["low", "medium", "high"], {
    message: "Urgency must be low, medium, or high",
  }),
  status: z.enum(["pending", "progress", "completed"], {
    message: "Status must be pending, progress, or completed",
  }),
});

// Main Task validation schema
export const TaskSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Task title is required"),
  deadline: z.string().min(1, "Deadline is required"), // Store as ISO String / Formatted Date String
  status: z.enum(["pending", "progress", "completed"], {
    message: "Status must be pending, progress, or completed",
  }),
  microTasks: z.array(MicroTaskSchema).default([]),
});

// AI Logs validation schema for contextual memory history
export const AILogSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["briefing", "negotiation"]),
  content: z.string().min(1, "AI log content cannot be empty"),
  createdAt: z.string().or(z.date()).optional(),
});
