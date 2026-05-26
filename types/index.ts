import { z } from "zod";
import {
  UserSchema,
  MicroTaskSchema,
  TaskSchema,
  AILogSchema,
} from "@/lib/validations/schema";

export type User = z.infer<typeof UserSchema>;
export type MicroTask = z.infer<typeof MicroTaskSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type AILog = z.infer<typeof AILogSchema>;
