import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { interactionCategories, interactionRatings } from "./social";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const wellnessTableNames = [
  "meditation_sessions",
  "mindfulness_sessions",
  "mood_entries",
  "journal_entries",
  "gratitude_entries",
  "habits",
  "goals",
  "todos",
  "activity_logs",
  "sleep_logs",
  "water_logs",
  "study_logs",
] as const;

export type WellnessTableName = typeof wellnessTableNames[number];

export const socialInteractions = pgTable("social_interactions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  rating: text("rating").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSocialInteractionSchema = z.object({
  userId: z.string().min(1),
  category: z.enum(interactionCategories),
  rating: z.enum(interactionRatings),
  note: z.string().trim().max(500).optional().nullable(),
});

export const meditationSessions = pgTable("meditation_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  duration: integer("duration").notNull(),
  soundId: text("sound_id").notNull(),
  completed: boolean("completed").notNull().default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mindfulnessSessions = pgTable("mindfulness_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  duration: integer("duration").notNull(),
  soundId: text("sound_id").notNull(),
  phaseCycles: integer("phase_cycles").notNull().default(0),
  completed: boolean("completed").notNull().default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  moodLabel: text("mood_label").notNull(),
  moodScore: real("mood_score").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  moodEmoji: text("mood_emoji"),
  wordCount: integer("word_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gratitudeEntries = pgTable("gratitude_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  emoji: text("emoji").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  habitName: text("habit_name").notNull(),
  emoji: text("emoji").notNull().default("⭐"),
  streak: integer("streak").notNull().default(0),
  completedToday: boolean("completed_today").notNull().default(false),
  successRate: real("success_rate").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  targetDate: text("target_date").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  intensity: text("intensity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sleepLogs = pgTable("sleep_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  bedtime: text("bedtime").notNull(),
  wakeTime: text("wake_time").notNull(),
  durationH: real("duration_h").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waterLogs = pgTable("water_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  glasses: integer("glasses").notNull(),
  goal: integer("goal").notNull().default(8),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyLogs = pgTable("study_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  focusRating: integer("focus_rating").notNull().default(3),
  notes: text("notes"),
  studyDate: text("study_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const baseUserSchema = z.object({
  userId: z.string().min(1),
});

export const insertMeditationSessionSchema = baseUserSchema.extend({
  duration: z.number().int().min(1),
  soundId: z.string().min(1),
  completed: z.boolean().optional(),
  startedAt: z.string().datetime().optional(),
});

export const insertMindfulnessSessionSchema = baseUserSchema.extend({
  duration: z.number().int().min(1),
  soundId: z.string().min(1),
  phaseCycles: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  startedAt: z.string().datetime().optional(),
});

export const insertMoodEntrySchema = baseUserSchema.extend({
  moodLabel: z.string().min(1),
  moodScore: z.number().min(1).max(5),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const insertJournalEntrySchema = baseUserSchema.extend({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  moodEmoji: z.string().trim().optional().nullable(),
  wordCount: z.number().int().min(0).optional(),
});

export const insertGratitudeEntrySchema = baseUserSchema.extend({
  text: z.string().trim().min(1),
  emoji: z.string().trim().min(1),
  category: z.string().trim().min(1),
});

export const insertHabitSchema = baseUserSchema.extend({
  habitName: z.string().trim().min(1),
  emoji: z.string().trim().optional(),
  streak: z.number().int().min(0).optional(),
  completedToday: z.boolean().optional(),
  successRate: z.number().min(0).max(100).optional(),
});

export const insertGoalSchema = baseUserSchema.extend({
  title: z.string().trim().min(1),
  type: z.enum(["short", "long"]),
  targetDate: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional(),
});

export const insertTodoSchema = baseUserSchema.extend({
  text: z.string().trim().min(1),
  completed: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const insertActivityLogSchema = baseUserSchema.extend({
  type: z.string().trim().min(1),
  duration: z.number().int().min(1),
  intensity: z.string().trim().min(1),
});

export const insertSleepLogSchema = baseUserSchema.extend({
  bedtime: z.string().min(1),
  wakeTime: z.string().min(1),
  durationH: z.number().min(0),
});

export const insertWaterLogSchema = baseUserSchema.extend({
  glasses: z.number().int().min(0),
  goal: z.number().int().min(1).optional(),
});

export const insertStudyLogSchema = baseUserSchema.extend({
  subject: z.string().trim().min(1),
  durationMinutes: z.number().int().min(1).max(720),
  focusRating: z.number().int().min(1).max(5),
  notes: z.string().trim().max(500).optional().nullable(),
  studyDate: z.string().min(1),
});

export const wellnessTables = {
  meditation_sessions: meditationSessions,
  mindfulness_sessions: mindfulnessSessions,
  mood_entries: moodEntries,
  journal_entries: journalEntries,
  gratitude_entries: gratitudeEntries,
  habits,
  goals,
  todos,
  activity_logs: activityLogs,
  sleep_logs: sleepLogs,
  water_logs: waterLogs,
  study_logs: studyLogs,
} as const;

export const wellnessInsertSchemas = {
  meditation_sessions: insertMeditationSessionSchema,
  mindfulness_sessions: insertMindfulnessSessionSchema,
  mood_entries: insertMoodEntrySchema,
  journal_entries: insertJournalEntrySchema,
  gratitude_entries: insertGratitudeEntrySchema,
  habits: insertHabitSchema,
  goals: insertGoalSchema,
  todos: insertTodoSchema,
  activity_logs: insertActivityLogSchema,
  sleep_logs: insertSleepLogSchema,
  water_logs: insertWaterLogSchema,
  study_logs: insertStudyLogSchema,
} as const;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSocialInteraction = z.infer<typeof insertSocialInteractionSchema>;
export type SocialInteraction = typeof socialInteractions.$inferSelect;
export type InsertMeditationSession = z.infer<typeof insertMeditationSessionSchema>;
export type MeditationSession = typeof meditationSessions.$inferSelect;
export type InsertMindfulnessSession = z.infer<typeof insertMindfulnessSessionSchema>;
export type MindfulnessSession = typeof mindfulnessSessions.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertGratitudeEntry = z.infer<typeof insertGratitudeEntrySchema>;
export type GratitudeEntry = typeof gratitudeEntries.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type SleepLog = typeof sleepLogs.$inferSelect;
export type InsertWaterLog = z.infer<typeof insertWaterLogSchema>;
export type WaterLog = typeof waterLogs.$inferSelect;
export type InsertStudyLog = z.infer<typeof insertStudyLogSchema>;
export type StudyLog = typeof studyLogs.$inferSelect;
