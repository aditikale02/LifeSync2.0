var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  goals: () => goals,
  gratitudeEntries: () => gratitudeEntries,
  habits: () => habits,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertGoalSchema: () => insertGoalSchema,
  insertGratitudeEntrySchema: () => insertGratitudeEntrySchema,
  insertHabitSchema: () => insertHabitSchema,
  insertJournalEntrySchema: () => insertJournalEntrySchema,
  insertMeditationSessionSchema: () => insertMeditationSessionSchema,
  insertMindfulnessSessionSchema: () => insertMindfulnessSessionSchema,
  insertMoodEntrySchema: () => insertMoodEntrySchema,
  insertSleepLogSchema: () => insertSleepLogSchema,
  insertSocialInteractionSchema: () => insertSocialInteractionSchema,
  insertStudyLogSchema: () => insertStudyLogSchema,
  insertTodoSchema: () => insertTodoSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaterLogSchema: () => insertWaterLogSchema,
  journalEntries: () => journalEntries,
  meditationSessions: () => meditationSessions,
  mindfulnessSessions: () => mindfulnessSessions,
  moodEntries: () => moodEntries,
  sleepLogs: () => sleepLogs,
  socialInteractions: () => socialInteractions,
  studyLogs: () => studyLogs,
  todos: () => todos,
  users: () => users,
  waterLogs: () => waterLogs,
  wellnessInsertSchemas: () => wellnessInsertSchemas,
  wellnessTableNames: () => wellnessTableNames,
  wellnessTables: () => wellnessTables
});
import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, real, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// shared/social.ts
var interactionCategories = ["Friends", "Family", "Strangers", "Animals"];
var interactionRatings = [
  "Very Positive",
  "Positive",
  "Neutral",
  "Negative",
  "Very Negative"
];

// shared/schema.ts
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var wellnessTableNames = [
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
  "study_logs"
];
var socialInteractions = pgTable("social_interactions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  rating: text("rating").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertSocialInteractionSchema = z.object({
  userId: z.string().min(1),
  category: z.enum(interactionCategories),
  rating: z.enum(interactionRatings),
  note: z.string().trim().max(500).optional().nullable()
});
var meditationSessions = pgTable("meditation_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  duration: integer("duration").notNull(),
  soundId: text("sound_id").notNull(),
  completed: boolean("completed").notNull().default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var mindfulnessSessions = pgTable("mindfulness_sessions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  duration: integer("duration").notNull(),
  soundId: text("sound_id").notNull(),
  phaseCycles: integer("phase_cycles").notNull().default(0),
  completed: boolean("completed").notNull().default(true),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var moodEntries = pgTable("mood_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  moodLabel: text("mood_label").notNull(),
  moodScore: real("mood_score").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  moodEmoji: text("mood_emoji"),
  wordCount: integer("word_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var gratitudeEntries = pgTable("gratitude_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  emoji: text("emoji").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var habits = pgTable("habits", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  habitName: text("habit_name").notNull(),
  emoji: text("emoji").notNull().default("\u2B50"),
  streak: integer("streak").notNull().default(0),
  completedToday: boolean("completed_today").notNull().default(false),
  successRate: real("success_rate").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var goals = pgTable("goals", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  targetDate: text("target_date").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var todos = pgTable("todos", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  intensity: text("intensity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var sleepLogs = pgTable("sleep_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  bedtime: text("bedtime").notNull(),
  wakeTime: text("wake_time").notNull(),
  durationH: real("duration_h").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var waterLogs = pgTable("water_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  glasses: integer("glasses").notNull(),
  goal: integer("goal").notNull().default(8),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var studyLogs = pgTable("study_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  subject: text("subject").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  focusRating: integer("focus_rating").notNull().default(3),
  notes: text("notes"),
  studyDate: text("study_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var baseUserSchema = z.object({
  userId: z.string().min(1)
});
var insertMeditationSessionSchema = baseUserSchema.extend({
  duration: z.number().int().min(1),
  soundId: z.string().min(1),
  completed: z.boolean().optional(),
  startedAt: z.string().datetime().optional()
});
var insertMindfulnessSessionSchema = baseUserSchema.extend({
  duration: z.number().int().min(1),
  soundId: z.string().min(1),
  phaseCycles: z.number().int().min(0).optional(),
  completed: z.boolean().optional(),
  startedAt: z.string().datetime().optional()
});
var insertMoodEntrySchema = baseUserSchema.extend({
  moodLabel: z.string().min(1),
  moodScore: z.number().min(1).max(5),
  notes: z.string().trim().max(500).optional().nullable()
});
var insertJournalEntrySchema = baseUserSchema.extend({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  moodEmoji: z.string().trim().optional().nullable(),
  wordCount: z.number().int().min(0).optional()
});
var insertGratitudeEntrySchema = baseUserSchema.extend({
  text: z.string().trim().min(1),
  emoji: z.string().trim().min(1),
  category: z.string().trim().min(1)
});
var insertHabitSchema = baseUserSchema.extend({
  habitName: z.string().trim().min(1),
  emoji: z.string().trim().optional(),
  streak: z.number().int().min(0).optional(),
  completedToday: z.boolean().optional(),
  successRate: z.number().min(0).max(100).optional()
});
var insertGoalSchema = baseUserSchema.extend({
  title: z.string().trim().min(1),
  type: z.enum(["short", "long"]),
  targetDate: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
  completed: z.boolean().optional()
});
var insertTodoSchema = baseUserSchema.extend({
  text: z.string().trim().min(1),
  completed: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional()
});
var insertActivityLogSchema = baseUserSchema.extend({
  type: z.string().trim().min(1),
  duration: z.number().int().min(1),
  intensity: z.string().trim().min(1)
});
var insertSleepLogSchema = baseUserSchema.extend({
  bedtime: z.string().min(1),
  wakeTime: z.string().min(1),
  durationH: z.number().min(0)
});
var insertWaterLogSchema = baseUserSchema.extend({
  glasses: z.number().int().min(0),
  goal: z.number().int().min(1).optional()
});
var insertStudyLogSchema = baseUserSchema.extend({
  subject: z.string().trim().min(1),
  durationMinutes: z.number().int().min(1).max(720),
  focusRating: z.number().int().min(1).max(5),
  notes: z.string().trim().max(500).optional().nullable(),
  studyDate: z.string().min(1)
});
var wellnessTables = {
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
  study_logs: studyLogs
};
var wellnessInsertSchemas = {
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
  study_logs: insertStudyLogSchema
};

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  socialInteractions;
  wellnessRecords;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.socialInteractions = /* @__PURE__ */ new Map();
    this.wellnessRecords = Object.fromEntries(
      wellnessTableNames.map((table) => [table, /* @__PURE__ */ new Map()])
    );
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getSocialInteractionsByUserId(userId) {
    return Array.from(this.socialInteractions.values()).filter((interaction) => interaction.userId === userId).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }
  async createSocialInteraction(interaction) {
    const id = randomUUID();
    const record = {
      id,
      userId: interaction.userId,
      category: interaction.category,
      rating: interaction.rating,
      note: interaction.note?.trim() ? interaction.note.trim() : null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.socialInteractions.set(id, record);
    return record;
  }
  async getWellnessRecordsByUserId(table, userId) {
    const records = Array.from(this.wellnessRecords[table].values()).filter((record) => record.userId === userId).sort((left, right) => {
      const leftDate = new Date(String(left.createdAt ?? left.startedAt ?? 0)).getTime();
      const rightDate = new Date(String(right.createdAt ?? right.startedAt ?? 0)).getTime();
      return rightDate - leftDate;
    });
    return records;
  }
  async createWellnessRecord(table, input) {
    const id = randomUUID();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = {
      id,
      ...input,
      createdAt: input.createdAt ?? now
    };
    this.wellnessRecords[table].set(id, record);
    return record;
  }
  async deleteWellnessRecord(table, recordId) {
    const existed = this.wellnessRecords[table].delete(recordId);
    return existed ? 1 : 0;
  }
  async deleteWellnessRecordsByField(table, userId, field, value) {
    let deleted = 0;
    for (const [id, record] of Array.from(this.wellnessRecords[table].entries())) {
      if (record.userId !== userId) {
        continue;
      }
      if (String(record[field] ?? "") !== value) {
        continue;
      }
      this.wellnessRecords[table].delete(id);
      deleted += 1;
    }
    return deleted;
  }
};
var storage = new MemStorage();

// server/routes.ts
import { createClient } from "@supabase/supabase-js";
import { randomUUID as randomUUID2 } from "crypto";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
var databaseUrl = process.env.DATABASE_URL;
var pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
var db = pool ? drizzle({ client: pool, schema: schema_exports }) : null;
var hasDatabase = Boolean(db);

// server/routes.ts
import { and, desc, eq, sql as sql2 } from "drizzle-orm";

// server/wellness-metrics.ts
var ratingScores = {
  "Very Positive": 100,
  Positive: 80,
  Neutral: 60,
  Negative: 35,
  "Very Negative": 15
};
var categoryMultipliers = {
  Family: 1.1,
  Friends: 1.05,
  Animals: 1,
  Strangers: 0.9
};
var activityMet = {
  Running: 9.8,
  Gym: 6,
  Sports: 7,
  Walking: 3.5,
  Yoga: 3
};
function toDate(record) {
  return new Date(String(record.createdAt ?? record.startedAt ?? 0));
}
function inLastDays(record, days) {
  const min = Date.now() - days * 24 * 60 * 60 * 1e3;
  return toDate(record).getTime() >= min;
}
function avg(values) {
  if (!values.length) return 0;
  return values.reduce((sum2, value) => sum2 + value, 0) / values.length;
}
function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}
function clamp100(value) {
  return Math.max(0, Math.min(100, value));
}
function stdev(values) {
  if (values.length < 2) return 0;
  const mean = avg(values);
  const variance = avg(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}
function dailyCounts(records, days, mapValue) {
  const output = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    const dayRecords = records.filter((record) => toDate(record).toISOString().slice(0, 10) === key);
    const values = mapValue ? dayRecords.map(mapValue) : [];
    output.push({
      day: key.slice(5),
      count: dayRecords.length,
      value: values.length ? avg(values) : 0
    });
  }
  return output;
}
function getSocialImpact(record) {
  const rating = String(record.rating ?? "Neutral");
  const category = String(record.category ?? "Friends");
  const base = ratingScores[rating] ?? 60;
  const multiplier = categoryMultipliers[category] ?? 1;
  return Math.min(100, Math.round(base * multiplier));
}
function dayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}
function latestByKey(records, keyField) {
  const map = /* @__PURE__ */ new Map();
  for (const record of records) {
    const key = String(record[keyField] ?? "").trim();
    if (!key) continue;
    const existing = map.get(key);
    if (!existing || toDate(record).getTime() > toDate(existing).getTime()) {
      map.set(key, record);
    }
  }
  return Array.from(map.values());
}
function latestPerDay(records) {
  const map = /* @__PURE__ */ new Map();
  for (const record of records) {
    const key = dayKey(toDate(record));
    const existing = map.get(key);
    if (!existing || toDate(record).getTime() > toDate(existing).getTime()) {
      map.set(key, record);
    }
  }
  return Array.from(map.values());
}
function computeSnapshot(windowData, windowDays) {
  const meditationWindow = windowData.meditationSessions;
  const mindfulnessWindow = windowData.mindfulnessSessions;
  const moodWindow = windowData.moodEntries;
  const journalWindow = windowData.journalEntries;
  const gratitudeWindow = windowData.gratitudeEntries;
  const socialWindow = windowData.socialInteractions;
  const activityWindow = windowData.activityLogs;
  const sleepWindow = latestPerDay(windowData.sleepLogs);
  const waterWindow = latestPerDay(windowData.waterLogs);
  const habitState = latestByKey(windowData.habits, "habitName");
  const goalState = latestByKey(windowData.goals, "title");
  const todoState = latestByKey(windowData.todos, "text");
  const meditationMinutes = sum(meditationWindow.map((record) => Number(record.duration ?? 0)));
  const mindfulnessMinutes = sum(mindfulnessWindow.map((record) => Number(record.duration ?? 0)));
  const sleepHours = sleepWindow.map((record) => Number(record.durationH ?? 0));
  const avgSleep = avg(sleepHours);
  const sleepConsistency = stdev(sleepHours);
  const moodScores = moodWindow.map((record) => Number(record.moodScore ?? 0));
  const moodAvg = avg(moodScores);
  const moodNorm = clamp100((moodAvg - 1) / 4 * 100);
  const gratitudeDays = new Set(gratitudeWindow.map((record) => dayKey(toDate(record)))).size;
  const journalDays = new Set(journalWindow.map((record) => dayKey(toDate(record)))).size;
  const gratitudeNorm = clamp100(gratitudeDays / Math.max(1, windowDays) * 100);
  const journalStreakNorm = clamp100(Math.min(journalDays, windowDays) / Math.max(1, windowDays) * 100);
  const socialImpacts = socialWindow.map(getSocialImpact);
  const socialAverageImpact = avg(socialImpacts);
  const socialFrequencyScore = clamp100(socialWindow.length / 10 * 100);
  const socialScore = Math.round(socialAverageImpact * 0.75 + socialFrequencyScore * 0.25);
  const completedHabits = habitState.filter((habit) => Boolean(habit.completedToday)).length;
  const habitPct = habitState.length ? completedHabits / habitState.length * 100 : 0;
  const activeGoals = goalState.filter((goal) => !Boolean(goal.completed));
  const goalPct = activeGoals.length ? avg(activeGoals.map((goal) => Number(goal.progress ?? 0))) : 0;
  const doneTasks = todoState.filter((task) => Boolean(task.completed)).length;
  const taskPct = todoState.length ? doneTasks / todoState.length * 100 : 0;
  const activityMinutes = sum(activityWindow.map((record) => Number(record.duration ?? 0)));
  const activityNorm = clamp100(activityMinutes / 150 * 100);
  const waterPct = avg(
    waterWindow.map((record) => {
      const glasses = Number(record.glasses ?? 0);
      const goal = Number(record.goal ?? 8);
      return clamp100(glasses / Math.max(goal, 1) * 100);
    })
  );
  const mindScore = Math.round(
    clamp100(
      ((meditationMinutes + mindfulnessMinutes) / 70 + avgSleep / 8 + (meditationWindow.length + mindfulnessWindow.length) / 7) / 3 * 100
    )
  );
  const emotionalScore = Math.round(clamp100(moodNorm * 0.5 + journalStreakNorm * 0.3 + gratitudeNorm * 0.2));
  const productivityScore = Math.round(clamp100(habitPct * 0.5 + goalPct * 0.3 + taskPct * 0.2));
  const physicalScore = Math.round(clamp100(activityNorm * 0.6 + waterPct * 0.4));
  const lifeSyncScore = Math.round(
    mindScore * 0.25 + emotionalScore * 0.2 + socialScore * 0.2 + productivityScore * 0.2 + physicalScore * 0.15
  );
  const positiveInteractions = socialWindow.filter((record) => {
    const rating = String(record.rating ?? "");
    return rating === "Positive" || rating === "Very Positive";
  }).length;
  const socialPositiveRatio = socialWindow.length ? positiveInteractions / socialWindow.length * 100 : 0;
  const caloriesEstimated = sum(
    activityWindow.map((record) => {
      const duration = Number(record.duration ?? 0);
      const met = activityMet[String(record.type ?? "Walking")] ?? 4;
      return duration * met * 70 / 60;
    })
  );
  const crossPillar = {
    sleepVsMood: {
      correlationHint: avgSleep < 6.5 && moodAvg < 3 ? "negative" : "stable",
      avgSleep,
      avgMood: moodAvg
    },
    meditationVsProductivity: {
      meditationDays: meditationWindow.length,
      taskCompletionPct: taskPct,
      signal: meditationWindow.length >= 3 && taskPct >= 60 ? "positive" : "weak"
    },
    activityVsEmotional: {
      activityMinutes,
      emotionalScore,
      signal: activityMinutes >= 150 && emotionalScore >= 70 ? "positive" : "watch"
    },
    gratitudeVsMood: {
      gratitudeEntries: gratitudeWindow.length,
      avgMood: moodAvg,
      signal: gratitudeWindow.length >= 5 && moodAvg >= 3.5 ? "positive" : "watch"
    },
    socialVsMood: {
      socialPositiveRatio,
      avgMood: moodAvg,
      signal: socialPositiveRatio >= 70 && moodAvg >= 3.5 ? "positive" : "watch"
    }
  };
  return {
    metrics: {
      meditationMinutes,
      mindfulnessMinutes,
      avgMeditationSession: avg(meditationWindow.map((record) => Number(record.duration ?? 0))),
      avgSleep,
      sleepConsistency,
      moodAvg,
      moodHigh: moodScores.length ? Math.max(...moodScores) : 0,
      moodLow: moodScores.length ? Math.min(...moodScores) : 0,
      gratitudeEntries: gratitudeWindow.length,
      journalEntries: journalWindow.length,
      socialInteractions: socialWindow.length,
      socialPositiveRatio,
      habitCompletionPct: habitPct,
      goalProgressPct: goalPct,
      taskCompletionPct: taskPct,
      activityMinutes,
      caloriesEstimated: Math.round(caloriesEstimated),
      hydrationPct: Math.round(waterPct)
    },
    scores: {
      mindScore,
      emotionalScore,
      socialScore,
      productivityScore,
      physicalScore,
      lifeSyncScore
    },
    crossPillar
  };
}
function buildWellnessSummary(data, days) {
  const filteredData = {
    meditationSessions: data.meditationSessions.filter((record) => inLastDays(record, days)),
    mindfulnessSessions: data.mindfulnessSessions.filter((record) => inLastDays(record, days)),
    moodEntries: data.moodEntries.filter((record) => inLastDays(record, days)),
    journalEntries: data.journalEntries.filter((record) => inLastDays(record, days)),
    gratitudeEntries: data.gratitudeEntries.filter((record) => inLastDays(record, days)),
    habits: data.habits.filter((record) => inLastDays(record, days)),
    goals: data.goals.filter((record) => inLastDays(record, days)),
    todos: data.todos.filter((record) => inLastDays(record, days)),
    activityLogs: data.activityLogs.filter((record) => inLastDays(record, days)),
    sleepLogs: data.sleepLogs.filter((record) => inLastDays(record, days)),
    waterLogs: data.waterLogs.filter((record) => inLastDays(record, days)),
    socialInteractions: data.socialInteractions.filter((record) => inLastDays(record, days))
  };
  const snapshot = computeSnapshot(filteredData, days);
  const trendWindowDays = Math.min(days, 7);
  const lifeSync7d = Array.from({ length: trendWindowDays }, (_, index) => {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - (trendWindowDays - 1 - index));
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const inWindow = (record) => {
      const value = toDate(record).getTime();
      return value >= start.getTime() && value <= end.getTime();
    };
    const windowData = {
      meditationSessions: data.meditationSessions.filter(inWindow),
      mindfulnessSessions: data.mindfulnessSessions.filter(inWindow),
      moodEntries: data.moodEntries.filter(inWindow),
      journalEntries: data.journalEntries.filter(inWindow),
      gratitudeEntries: data.gratitudeEntries.filter(inWindow),
      habits: data.habits.filter(inWindow),
      goals: data.goals.filter(inWindow),
      todos: data.todos.filter(inWindow),
      activityLogs: data.activityLogs.filter(inWindow),
      sleepLogs: data.sleepLogs.filter(inWindow),
      waterLogs: data.waterLogs.filter(inWindow),
      socialInteractions: data.socialInteractions.filter(inWindow)
    };
    const daySnapshot = computeSnapshot(windowData, 7);
    return {
      day: dayKey(date).slice(5),
      count: windowData.socialInteractions.length,
      value: daySnapshot.scores.lifeSyncScore
    };
  });
  return {
    periodDays: days,
    metrics: snapshot.metrics,
    scores: snapshot.scores,
    trends: {
      lifeSync7d,
      socialFrequency7d: dailyCounts(filteredData.socialInteractions, Math.min(days, 7)),
      socialWellness7d: dailyCounts(filteredData.socialInteractions, Math.min(days, 7), getSocialImpact)
    },
    crossPillar: snapshot.crossPillar
  };
}
function buildInsightFromSummary(summary) {
  const { scores, metrics, crossPillar } = summary;
  const strengths = [];
  const improvements = [];
  const recommendations = [];
  if (scores.emotionalScore >= 75) strengths.push("Emotional wellness is strong this week, with stable mood and reflective habits.");
  if (metrics.socialPositiveRatio >= 70) strengths.push("Most social interactions were positive, which supports social resilience.");
  if (metrics.activityMinutes >= 150) strengths.push("You met a high activity threshold, supporting physical and emotional wellness.");
  if (metrics.hydrationPct >= 80) strengths.push("Hydration consistency stayed in a healthy range.");
  if (metrics.avgSleep < 7) improvements.push("Average sleep is below target; this may be limiting focus and mood stability.");
  if (scores.productivityScore < 65) improvements.push("Productivity score is lagging behind other pillars.");
  if (metrics.socialInteractions < 5) improvements.push("Social interaction frequency is low this week.");
  if (metrics.hydrationPct < 70) improvements.push("Hydration is below your recommended weekly average.");
  if (crossPillar.sleepVsMood.correlationHint === "negative") {
    recommendations.push("Prioritize 7+ hours of sleep for the next 3 nights to support mood recovery.");
  }
  if (crossPillar.meditationVsProductivity.signal === "weak") {
    recommendations.push("Schedule a short morning meditation before your first focus block to improve task completion.");
  }
  if (metrics.activityMinutes < 150) {
    recommendations.push("Add two 20-minute movement sessions this week to raise physical and emotional scores.");
  }
  if (metrics.socialPositiveRatio < 70) {
    recommendations.push("Plan one intentional positive social interaction in the next 48 hours.");
  }
  if (recommendations.length < 3) {
    recommendations.push("Keep current routines consistent for 7 days and re-check your LifeSync score trend.");
  }
  const summaryText = `Your LifeSync score is ${scores.lifeSyncScore}/100 this week. Mind: ${scores.mindScore}, Emotional: ${scores.emotionalScore}, Social: ${scores.socialScore}, Productivity: ${scores.productivityScore}, Physical: ${scores.physicalScore}. Focus first on the weakest pillar to create balanced improvement.`;
  return {
    summary: summaryText,
    wellness_score: scores.lifeSyncScore,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    recommendations: recommendations.slice(0, 6),
    generated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// server/routes.ts
function isWellnessTableName(value) {
  return wellnessTableNames.includes(value);
}
var wellnessDeletableFieldMap = {
  meditation_sessions: ["id", "userId", "soundId"],
  mindfulness_sessions: ["id", "userId", "soundId"],
  mood_entries: ["id", "userId", "moodLabel"],
  journal_entries: ["id", "userId", "title"],
  gratitude_entries: ["id", "userId", "text", "category"],
  habits: ["id", "userId", "habitName"],
  goals: ["id", "userId", "title"],
  todos: ["id", "userId", "text"],
  activity_logs: ["id", "userId", "type"],
  sleep_logs: ["id", "userId"],
  water_logs: ["id", "userId"],
  study_logs: ["id", "userId", "subject"]
};
async function bootstrapWellnessTables() {
  if (!db) {
    return;
  }
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS social_interactions (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      category text NOT NULL,
      rating text NOT NULL,
      note text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      duration integer NOT NULL,
      sound_id text NOT NULL,
      completed boolean NOT NULL DEFAULT true,
      started_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS mindfulness_sessions (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      duration integer NOT NULL,
      sound_id text NOT NULL,
      phase_cycles integer NOT NULL DEFAULT 0,
      completed boolean NOT NULL DEFAULT true,
      started_at timestamp NOT NULL DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      mood_label text NOT NULL,
      mood_score real NOT NULL,
      notes text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      title text NOT NULL,
      body text NOT NULL,
      mood_emoji text,
      word_count integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS gratitude_entries (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      text text NOT NULL,
      emoji text NOT NULL,
      category text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS habits (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      habit_name text NOT NULL,
      emoji text NOT NULL DEFAULT '⭐',
      streak integer NOT NULL DEFAULT 0,
      completed_today boolean NOT NULL DEFAULT false,
      success_rate real NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS goals (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      title text NOT NULL,
      type text NOT NULL,
      target_date text NOT NULL,
      progress integer NOT NULL DEFAULT 0,
      completed boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS todos (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      text text NOT NULL,
      completed boolean NOT NULL DEFAULT false,
      priority text NOT NULL DEFAULT 'medium',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      type text NOT NULL,
      duration integer NOT NULL,
      intensity text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      bedtime text NOT NULL,
      wake_time text NOT NULL,
      duration_h real NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS water_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      glasses integer NOT NULL,
      goal integer NOT NULL DEFAULT 8,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
  await db.execute(sql2`
    CREATE TABLE IF NOT EXISTS study_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      subject text NOT NULL,
      duration_minutes integer NOT NULL,
      focus_rating integer NOT NULL DEFAULT 3,
      notes text,
      study_date text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
}
async function getWellnessData(userId) {
  const readRecords = async (tableName) => {
    if (hasDatabase && db) {
      const table = wellnessTables[tableName];
      return db.select().from(table).where(eq(table.userId, userId)).orderBy(desc(table.createdAt));
    }
    return storage.getWellnessRecordsByUserId(tableName, userId);
  };
  const [
    meditationSessions2,
    mindfulnessSessions2,
    moodEntries2,
    journalEntries2,
    gratitudeEntries2,
    habits2,
    goals2,
    todos2,
    activityLogs2,
    sleepLogs2,
    waterLogs2,
    socialRecords
  ] = await Promise.all([
    readRecords("meditation_sessions"),
    readRecords("mindfulness_sessions"),
    readRecords("mood_entries"),
    readRecords("journal_entries"),
    readRecords("gratitude_entries"),
    readRecords("habits"),
    readRecords("goals"),
    readRecords("todos"),
    readRecords("activity_logs"),
    readRecords("sleep_logs"),
    readRecords("water_logs"),
    hasDatabase && db ? db.select().from(socialInteractions).where(eq(socialInteractions.userId, userId)).orderBy(desc(socialInteractions.createdAt)) : storage.getSocialInteractionsByUserId(userId)
  ]);
  return {
    meditationSessions: meditationSessions2,
    mindfulnessSessions: mindfulnessSessions2,
    moodEntries: moodEntries2,
    journalEntries: journalEntries2,
    gratitudeEntries: gratitudeEntries2,
    habits: habits2,
    goals: goals2,
    todos: todos2,
    activityLogs: activityLogs2,
    sleepLogs: sleepLogs2,
    waterLogs: waterLogs2,
    socialInteractions: socialRecords
  };
}
async function registerRoutes(app2) {
  await bootstrapWellnessTables();
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
      }
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({
          message: "Server auth configuration is missing. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        });
      }
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      const { error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName ?? ""
        }
      });
      if (error) {
        const isConflict = error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("exists");
        return res.status(isConflict ? 409 : 400).json({ message: error.message });
      }
      return res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed.";
      return res.status(500).json({ message });
    }
  });
  app2.get("/api/social-interactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }
      const interactions = hasDatabase && db ? await db.select().from(socialInteractions).where(eq(socialInteractions.userId, userId)).orderBy(desc(socialInteractions.createdAt)) : await storage.getSocialInteractionsByUserId(userId);
      return res.json(interactions);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load social interactions.";
      return res.status(500).json({ message });
    }
  });
  app2.post("/api/social-interactions", async (req, res) => {
    try {
      const parsed = insertSocialInteractionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message ?? "Invalid social interaction payload."
        });
      }
      const payload = parsed.data;
      const interaction = hasDatabase && db ? (await db.insert(socialInteractions).values({
        id: randomUUID2(),
        userId: payload.userId,
        category: payload.category,
        rating: payload.rating,
        note: payload.note?.trim() ? payload.note.trim() : null
      }).returning())[0] : await storage.createSocialInteraction(payload);
      return res.status(201).json(interaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save social interaction.";
      return res.status(500).json({ message });
    }
  });
  app2.get("/api/wellness/:table/:userId", async (req, res) => {
    try {
      const { table, userId } = req.params;
      if (!isWellnessTableName(table)) {
        return res.status(404).json({ message: "Unknown wellness table." });
      }
      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }
      const records = hasDatabase && db ? await db.select().from(wellnessTables[table]).where(eq(wellnessTables[table].userId, userId)).orderBy(desc(wellnessTables[table].createdAt)) : await storage.getWellnessRecordsByUserId(table, userId);
      return res.json(records);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load wellness records.";
      return res.status(500).json({ message });
    }
  });
  app2.post("/api/wellness/:table", async (req, res) => {
    try {
      const { table } = req.params;
      if (!isWellnessTableName(table)) {
        return res.status(404).json({ message: "Unknown wellness table." });
      }
      const schema = wellnessInsertSchemas[table];
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid payload." });
      }
      const input = parsed.data;
      const dbValues = {
        id: randomUUID2(),
        ...input,
        createdAt: /* @__PURE__ */ new Date()
      };
      if ("startedAt" in input && input.startedAt) {
        dbValues.startedAt = new Date(String(input.startedAt));
      }
      let record;
      if (hasDatabase && db) {
        const inserted = await db.insert(wellnessTables[table]).values(dbValues).returning();
        record = Array.isArray(inserted) ? inserted[0] : dbValues;
      } else {
        record = await storage.createWellnessRecord(table, {
          ...input,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return res.status(201).json(record);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save wellness record.";
      return res.status(500).json({ message });
    }
  });
  app2.delete("/api/wellness/:table/record/:recordId", async (req, res) => {
    try {
      const { table, recordId } = req.params;
      if (!isWellnessTableName(table)) {
        return res.status(404).json({ message: "Unknown wellness table." });
      }
      if (!recordId) {
        return res.status(400).json({ message: "Record id is required." });
      }
      let deletedCount = 0;
      if (hasDatabase && db) {
        const deleted = await db.delete(wellnessTables[table]).where(eq(wellnessTables[table].id, recordId)).returning({ id: wellnessTables[table].id });
        deletedCount = deleted.length;
      } else {
        deletedCount = await storage.deleteWellnessRecord(table, recordId);
      }
      return res.json({ deletedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete wellness record.";
      return res.status(500).json({ message });
    }
  });
  app2.delete("/api/wellness/:table", async (req, res) => {
    try {
      const { table } = req.params;
      const userId = String(req.query.userId ?? "").trim();
      const field = String(req.query.field ?? "").trim();
      const value = String(req.query.value ?? "");
      if (!isWellnessTableName(table)) {
        return res.status(404).json({ message: "Unknown wellness table." });
      }
      if (!userId || !field) {
        return res.status(400).json({ message: "userId and field are required." });
      }
      if (!wellnessDeletableFieldMap[table].includes(field)) {
        return res.status(400).json({ message: "Field is not deletable for this table." });
      }
      let deletedCount = 0;
      if (hasDatabase && db) {
        const tableRef = wellnessTables[table];
        const deleted = await db.delete(tableRef).where(and(eq(tableRef.userId, userId), eq(tableRef[field], value))).returning({ id: tableRef.id });
        deletedCount = deleted.length;
      } else {
        deletedCount = await storage.deleteWellnessRecordsByField(table, userId, field, value);
      }
      return res.json({ deletedCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete wellness records.";
      return res.status(500).json({ message });
    }
  });
  app2.get("/api/wellness-summary/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const days = Number(req.query.days ?? 7);
      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }
      const data = await getWellnessData(userId);
      const summary = buildWellnessSummary(data, Number.isFinite(days) ? Math.max(1, days) : 7);
      return res.json(summary);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to build wellness summary.";
      return res.status(500).json({ message });
    }
  });
  app2.get("/api/ai-insights/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }
      const data = await getWellnessData(userId);
      const summary = buildWellnessSummary(data, 7);
      const insight = buildInsightFromSummary(summary);
      return res.json(insight);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate AI insights.";
      return res.status(500).json({ message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const defaultPort = parseInt(process.env.PORT || "5000", 10);
  const host = "localhost";
  const startServer = (port, retriesLeft) => {
    const onError = (error) => {
      if (error.code === "EADDRINUSE" && app.get("env") === "development" && retriesLeft > 0) {
        const nextPort = port + 1;
        log(`port ${port} is in use, retrying on ${nextPort}`);
        startServer(nextPort, retriesLeft - 1);
        return;
      }
      throw error;
    };
    server.once("error", onError);
    server.listen({ port, host }, () => {
      server.off("error", onError);
      log(`serving on http://${host}:${port}`);
    });
  };
  startServer(defaultPort, 20);
})();
