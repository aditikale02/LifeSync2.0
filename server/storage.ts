import {
  type User,
  type InsertUser,
  type SocialInteraction,
  type InsertSocialInteraction,
  type WellnessTableName,
  wellnessTableNames,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSocialInteractionsByUserId(userId: string): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
  getWellnessRecordsByUserId(table: WellnessTableName, userId: string): Promise<Record<string, unknown>[]>;
  createWellnessRecord(table: WellnessTableName, input: Record<string, unknown>): Promise<Record<string, unknown>>;
  deleteWellnessRecord(table: WellnessTableName, recordId: string): Promise<number>;
  deleteWellnessRecordsByField(table: WellnessTableName, userId: string, field: string, value: string): Promise<number>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private socialInteractions: Map<string, SocialInteraction>;
  private wellnessRecords: Record<WellnessTableName, Map<string, Record<string, unknown>>>;

  constructor() {
    this.users = new Map();
    this.socialInteractions = new Map();
    this.wellnessRecords = Object.fromEntries(
      wellnessTableNames.map((table) => [table, new Map<string, Record<string, unknown>>()])
    ) as Record<WellnessTableName, Map<string, Record<string, unknown>>>;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSocialInteractionsByUserId(userId: string): Promise<SocialInteraction[]> {
    return Array.from(this.socialInteractions.values())
      .filter((interaction) => interaction.userId === userId)
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }

  async createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction> {
    const id = randomUUID();
    const record: SocialInteraction = {
      id,
      userId: interaction.userId,
      category: interaction.category,
      rating: interaction.rating,
      note: interaction.note?.trim() ? interaction.note.trim() : null,
      createdAt: new Date(),
    };

    this.socialInteractions.set(id, record);

    return record;
  }

  async getWellnessRecordsByUserId(table: WellnessTableName, userId: string): Promise<Record<string, unknown>[]> {
    const records = Array.from(this.wellnessRecords[table].values())
      .filter((record) => record.userId === userId)
      .sort((left, right) => {
        const leftDate = new Date(String(left.createdAt ?? left.startedAt ?? 0)).getTime();
        const rightDate = new Date(String(right.createdAt ?? right.startedAt ?? 0)).getTime();
        return rightDate - leftDate;
      });

    return records;
  }

  async createWellnessRecord(table: WellnessTableName, input: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const record: Record<string, unknown> = {
      id,
      ...input,
      createdAt: input.createdAt ?? now,
    };

    this.wellnessRecords[table].set(id, record);

    return record;
  }

  async deleteWellnessRecord(table: WellnessTableName, recordId: string): Promise<number> {
    const existed = this.wellnessRecords[table].delete(recordId);
    return existed ? 1 : 0;
  }

  async deleteWellnessRecordsByField(
    table: WellnessTableName,
    userId: string,
    field: string,
    value: string,
  ): Promise<number> {
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
}

export const storage = new MemStorage();
