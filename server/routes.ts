import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { db, hasDatabase } from "./db";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  insertSocialInteractionSchema,
  socialInteractions,
  wellnessInsertSchemas,
  wellnessTableNames,
  wellnessTables,
  type WellnessTableName,
} from "@shared/schema";
import { buildInsightFromSummary, buildWellnessSummary } from "./wellness-metrics";

function isWellnessTableName(value: string): value is WellnessTableName {
  return wellnessTableNames.includes(value as WellnessTableName);
}

const wellnessDeletableFieldMap: Record<WellnessTableName, string[]> = {
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
};

async function bootstrapWellnessTables() {
  if (!db) {
    return;
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS social_interactions (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      category text NOT NULL,
      rating text NOT NULL,
      note text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
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

  await db.execute(sql`
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

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS mood_entries (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      mood_label text NOT NULL,
      mood_score real NOT NULL,
      notes text,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
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

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS gratitude_entries (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      text text NOT NULL,
      emoji text NOT NULL,
      category text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
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

  await db.execute(sql`
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

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS todos (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      text text NOT NULL,
      completed boolean NOT NULL DEFAULT false,
      priority text NOT NULL DEFAULT 'medium',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      type text NOT NULL,
      duration integer NOT NULL,
      intensity text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      bedtime text NOT NULL,
      wake_time text NOT NULL,
      duration_h real NOT NULL,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS water_logs (
      id varchar PRIMARY KEY,
      user_id varchar NOT NULL,
      glasses integer NOT NULL,
      goal integer NOT NULL DEFAULT 8,
      created_at timestamp NOT NULL DEFAULT now()
    )
  `);
}

async function getWellnessData(userId: string) {
  const readRecords = async (tableName: WellnessTableName) => {
    if (hasDatabase && db) {
      const table = wellnessTables[tableName] as any;
      return db.select().from(table).where(eq(table.userId, userId)).orderBy(desc(table.createdAt));
    }

    return storage.getWellnessRecordsByUserId(tableName, userId);
  };

  const [
    meditationSessions,
    mindfulnessSessions,
    moodEntries,
    journalEntries,
    gratitudeEntries,
    habits,
    goals,
    todos,
    activityLogs,
    sleepLogs,
    waterLogs,
    socialRecords,
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
    hasDatabase && db
      ? db.select().from(socialInteractions).where(eq(socialInteractions.userId, userId)).orderBy(desc(socialInteractions.createdAt))
      : storage.getSocialInteractionsByUserId(userId),
  ]);

  return {
    meditationSessions: meditationSessions as Record<string, unknown>[],
    mindfulnessSessions: mindfulnessSessions as Record<string, unknown>[],
    moodEntries: moodEntries as Record<string, unknown>[],
    journalEntries: journalEntries as Record<string, unknown>[],
    gratitudeEntries: gratitudeEntries as Record<string, unknown>[],
    habits: habits as Record<string, unknown>[],
    goals: goals as Record<string, unknown>[],
    todos: todos as Record<string, unknown>[],
    activityLogs: activityLogs as Record<string, unknown>[],
    sleepLogs: sleepLogs as Record<string, unknown>[],
    waterLogs: waterLogs as Record<string, unknown>[],
    socialInteractions: socialRecords as Record<string, unknown>[],
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  await bootstrapWellnessTables();

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body as {
        email?: string;
        password?: string;
        fullName?: string;
      };

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
          message: "Server auth configuration is missing. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        });
      }

      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName ?? "",
        },
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

  app.get("/api/social-interactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }

      const interactions = hasDatabase && db
        ? await db
            .select()
            .from(socialInteractions)
            .where(eq(socialInteractions.userId, userId))
            .orderBy(desc(socialInteractions.createdAt))
        : await storage.getSocialInteractionsByUserId(userId);

      return res.json(interactions);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load social interactions.";
      return res.status(500).json({ message });
    }
  });

  app.post("/api/social-interactions", async (req, res) => {
    try {
      const parsed = insertSocialInteractionSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message ?? "Invalid social interaction payload.",
        });
      }

      const payload = parsed.data;
      const interaction = hasDatabase && db
        ? (
            await db
              .insert(socialInteractions)
              .values({
                id: randomUUID(),
                userId: payload.userId,
                category: payload.category,
                rating: payload.rating,
                note: payload.note?.trim() ? payload.note.trim() : null,
              })
              .returning()
          )[0]
        : await storage.createSocialInteraction(payload);

      return res.status(201).json(interaction);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save social interaction.";
      return res.status(500).json({ message });
    }
  });

  app.get("/api/wellness/:table/:userId", async (req, res) => {
    try {
      const { table, userId } = req.params;

      if (!isWellnessTableName(table)) {
        return res.status(404).json({ message: "Unknown wellness table." });
      }

      if (!userId) {
        return res.status(400).json({ message: "User id is required." });
      }

      const records = hasDatabase && db
        ? await db
            .select()
            .from(wellnessTables[table] as any)
            .where(eq((wellnessTables[table] as any).userId, userId))
            .orderBy(desc((wellnessTables[table] as any).createdAt))
        : await storage.getWellnessRecordsByUserId(table, userId);

      return res.json(records);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load wellness records.";
      return res.status(500).json({ message });
    }
  });

  app.post("/api/wellness/:table", async (req, res) => {
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

      const dbValues: Record<string, unknown> = {
        id: randomUUID(),
        ...input,
        createdAt: new Date(),
      };

      if ("startedAt" in input && input.startedAt) {
        dbValues.startedAt = new Date(String(input.startedAt));
      }

      let record: Record<string, unknown>;

      if (hasDatabase && db) {
        const inserted = await db
          .insert(wellnessTables[table] as any)
          .values(dbValues)
          .returning();

        record = Array.isArray(inserted) ? (inserted[0] as Record<string, unknown>) : dbValues;
      } else {
        record = await storage.createWellnessRecord(table, {
          ...input,
          createdAt: new Date().toISOString(),
        });
      }

      return res.status(201).json(record);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save wellness record.";
      return res.status(500).json({ message });
    }
  });

  app.delete("/api/wellness/:table/record/:recordId", async (req, res) => {
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
        const deleted = await db
          .delete(wellnessTables[table] as any)
          .where(eq((wellnessTables[table] as any).id, recordId))
          .returning({ id: (wellnessTables[table] as any).id });

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

  app.delete("/api/wellness/:table", async (req, res) => {
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
        const tableRef = wellnessTables[table] as any;
        const deleted = await db
          .delete(tableRef)
          .where(and(eq(tableRef.userId, userId), eq(tableRef[field], value)))
          .returning({ id: tableRef.id });
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

  app.get("/api/wellness-summary/:userId", async (req, res) => {
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

  app.get("/api/ai-insights/:userId", async (req, res) => {
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

  const httpServer = createServer(app);

  return httpServer;
}
