import type { WellnessTableName } from "@shared/schema";
import { supabase, supabaseAuthStorageKey } from "@/lib/supabase";

type WellnessTableAlias =
  | WellnessTableName
  | "tasks"
  | "water_entries"
  | "sleep_entries"
  | "study_sessions"
  | "pomodoro_sessions"
  | "social_interactions"
  | "activities"
  | "habit_logs"
  | "reflection_entries";

type PostgrestErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const tableAliases: Record<WellnessTableAlias, string[]> = {
  meditation_sessions: ["meditation_sessions", "meditation_logs"],
  mindfulness_sessions: ["mindfulness_sessions"],
  mood_entries: ["mood_entries"],
  journal_entries: ["journal_entries"],
  gratitude_entries: ["gratitude_entries"],
  habits: ["habits"],
  goals: ["goals"],
  todos: ["tasks", "todos"],
  tasks: ["tasks", "todos"],
  activity_logs: ["activities", "activity_logs"],
  activities: ["activities", "activity_logs"],
  sleep_logs: ["sleep_entries", "sleep_logs"],
  sleep_entries: ["sleep_entries", "sleep_logs"],
  water_logs: ["water_entries", "water_logs"],
  water_entries: ["water_entries", "water_logs"],
  study_logs: ["study_sessions", "study_logs"],
  study_sessions: ["study_sessions", "study_logs"],
  pomodoro_sessions: ["pomodoro_sessions"],
  social_interactions: ["social_interactions", "social_logs"],
  habit_logs: ["habit_logs"],
  reflection_entries: ["reflection_entries", "journal_entries"],
};

const upsertConflictTargets: Partial<Record<WellnessTableAlias, string>> = {
  journal_entries: "user_id,entry_date",
  water_entries: "user_id,log_date",
  water_logs: "user_id,log_date",
  sleep_entries: "user_id,log_date",
  sleep_logs: "user_id,log_date",
  mood_entries: "user_id,entry_date",
};

function isMissingRelationError(error: PostgrestErrorLike | null | undefined) {
  if (!error) return false;
  return error.code === "PGRST205" || error.code === "42P01" || /relation|table/i.test(error.message ?? "");
}

function isAuthOrRlsError(error: PostgrestErrorLike | null | undefined) {
  if (!error) return false;
  return (
    error.code === "42501" ||
    error.code === "PGRST301" ||
    error.code === "PGRST302" ||
    /auth\.uid|permission denied|jwt|not authenticated|row-level security|rls/i.test(error.message ?? "")
  );
}

function normalizeSupabaseError(error: PostgrestErrorLike | null | undefined, fallback: string) {
  if (!error) return fallback;
  if (isAuthOrRlsError(error)) {
    return "No authenticated user session. Please sign in again before saving data.";
  }

  return error.message || fallback;
}

async function resolveAuthenticatedUserId(providedUserId?: unknown) {
  if (typeof providedUserId === "string" && providedUserId.trim().length > 0) {
    return providedUserId;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("[LifeSync] SESSION ERROR before mutation:", sessionError);
  }

  const resolvedUserId = sessionData.session?.user?.id;
  if (!resolvedUserId) {
    if (typeof window !== "undefined" && window?.localStorage) {
      try {
        const authToken = window.localStorage.getItem(supabaseAuthStorageKey);
        console.error("[LifeSync] AUTH TOKEN CHECK FAILED:", {
          storageKey: supabaseAuthStorageKey,
          hasToken: Boolean(authToken),
        });
      } catch {
        console.error("[LifeSync] AUTH TOKEN CHECK FAILED: unable to read localStorage");
      }
    }

    throw new Error("No authenticated user session. Please sign in again before saving data.");
  }

  return resolvedUserId;
}

function camelToSnake(input: string) {
  return input
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();
}

function snakeToCamel(input: string) {
  return input.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
}

function normalizeForTable(table: WellnessTableAlias, payload: Record<string, unknown>) {
  const normalized = { ...payload };

  if (table === "tasks" || table === "todos") {
    if (normalized.title == null && normalized.text != null) normalized.title = normalized.text;
    if (normalized.text == null && normalized.title != null) normalized.text = normalized.title;
  }

  if (table === "water_entries" || table === "water_logs") {
    if (normalized.amount == null && normalized.glasses != null) normalized.amount = normalized.glasses;
    if (normalized.glasses == null && normalized.amount != null) normalized.glasses = normalized.amount;
    if (normalized.logDate == null) normalized.logDate = new Date().toISOString().slice(0, 10);
  }

  if (table === "sleep_entries" || table === "sleep_logs") {
    if (normalized.duration == null && normalized.durationH != null) normalized.duration = normalized.durationH;
    if (normalized.durationH == null && normalized.duration != null) normalized.durationH = normalized.duration;
    if (normalized.logDate == null) normalized.logDate = new Date().toISOString().slice(0, 10);
  }

  if (table === "study_sessions" || table === "study_logs") {
    if (normalized.duration == null && normalized.durationMinutes != null) normalized.duration = normalized.durationMinutes;
    if (normalized.durationMinutes == null && normalized.duration != null) normalized.durationMinutes = normalized.duration;
  }

  if (table === "pomodoro_sessions") {
    if (normalized.duration == null && normalized.durationMinutes != null) normalized.duration = normalized.durationMinutes;
    if (normalized.durationMinutes == null && normalized.duration != null) normalized.durationMinutes = normalized.duration;
  }

  if (table === "social_interactions") {
    if (normalized.notes == null && normalized.note != null) normalized.notes = normalized.note;
    if (normalized.note == null && normalized.notes != null) normalized.note = normalized.notes;
    if (normalized.type == null && normalized.category != null) normalized.type = normalized.category;
    if (normalized.category == null && normalized.type != null) normalized.category = normalized.type;
  }

  if (table === "mood_entries") {
    if (normalized.mood == null && normalized.moodLabel != null) normalized.mood = normalized.moodLabel;
    if (normalized.moodLabel == null && normalized.mood != null) normalized.moodLabel = normalized.mood;
    if (normalized.note == null && normalized.notes != null) normalized.note = normalized.notes;
    if (normalized.notes == null && normalized.note != null) normalized.notes = normalized.note;
    if (normalized.entryDate == null) normalized.entryDate = new Date().toISOString().slice(0, 10);
  }

  if (table === "journal_entries") {
    if (normalized.content == null && normalized.body != null) normalized.content = normalized.body;
    if (normalized.body == null && normalized.content != null) normalized.body = normalized.content;
    if (normalized.entryDate == null) normalized.entryDate = new Date().toISOString().slice(0, 10);
  }

  if (table === "activities" || table === "activity_logs") {
    if (normalized.duration == null && normalized.durationMinutes != null) normalized.duration = normalized.durationMinutes;
    if (normalized.durationMinutes == null && normalized.duration != null) normalized.durationMinutes = normalized.duration;
  }

  return normalized;
}

function toDbRecord(table: WellnessTableAlias, payload: Record<string, unknown>) {
  const normalized = normalizeForTable(table, payload);
  const mapped = Object.fromEntries(Object.entries(normalized).map(([key, value]) => [camelToSnake(key), value]));

  if (mapped.user_id == null && normalized.userId != null) {
    mapped.user_id = normalized.userId;
  }

  if (mapped.created_at == null && normalized.createdAt != null) {
    mapped.created_at = normalized.createdAt;
  }

  return mapped;
}

function sanitizePayloadForResolvedTable(resolvedTable: string, payload: Record<string, unknown>) {
  const sanitized = { ...payload };

  if (resolvedTable === "water_entries") {
    delete sanitized.glasses;
  }

  if (resolvedTable === "water_logs") {
    delete sanitized.amount;
  }

  if (resolvedTable === "tasks") {
    delete sanitized.text;
  }

  if (resolvedTable === "activities") {
    delete sanitized.duration_minutes;
  }

  return sanitized;
}

function toClientRecord<T extends Record<string, unknown>>(table: WellnessTableAlias, record: Record<string, unknown>) {
  const mapped = Object.fromEntries(Object.entries(record).map(([key, value]) => [snakeToCamel(key), value]));
  const normalized = normalizeForTable(table, mapped);
  const output = Object.fromEntries(Object.entries(normalized).filter(([, value]) => value !== undefined));
  if (output.userId == null && output.user_id != null) {
    output.userId = output.user_id;
  }

  return output as T;
}

async function withTableFallback<T>(
  table: WellnessTableAlias,
  runner: (resolvedTable: string) => Promise<{ data: T; error: PostgrestErrorLike | null }>,
): Promise<T> {
  const candidates = tableAliases[table] ?? [table];
  let lastError: PostgrestErrorLike | null = null;

  for (const candidate of candidates) {
    const { data, error } = await runner(candidate);

    if (!error) {
      return data;
    }

    if (isAuthOrRlsError(error)) {
      throw new Error(normalizeSupabaseError(error, `Supabase operation failed for table ${candidate}.`));
    }

    if (!isMissingRelationError(error)) {
      throw new Error(normalizeSupabaseError(error, `Supabase operation failed for table ${candidate}.`));
    }

    lastError = error;
  }

  throw new Error(lastError?.message || `No accessible table found for ${table}.`);
}

export async function createWellnessRecord<T extends Record<string, unknown>>(
  table: WellnessTableAlias,
  payload: T,
) {
  const dbPayload = toDbRecord(table, payload);
  dbPayload.user_id = await resolveAuthenticatedUserId(dbPayload.user_id);

  const row = await withTableFallback<Record<string, unknown>>(table, async (resolvedTable) => {
    const resolvedPayload = sanitizePayloadForResolvedTable(resolvedTable, dbPayload);
    const result = await supabase.from(resolvedTable).insert(resolvedPayload).select("*").single();

    if (result.error) {
      console.error(`[LifeSync] SUPABASE INSERT ERROR for table ${resolvedTable}:`, result.error, "Payload:", resolvedPayload);
    }

    if (result.error?.code === "23505") {
      const conflictTarget = upsertConflictTargets[table];
      if (conflictTarget) {
        const upsertResult = await supabase
          .from(resolvedTable)
          .upsert(resolvedPayload, { onConflict: conflictTarget })
          .select("*")
          .single();

        if (upsertResult.error) {
          console.error(`[LifeSync] SUPABASE UPSERT ERROR for table ${resolvedTable}:`, upsertResult.error, "Payload:", resolvedPayload);
        }

        return {
          data: (upsertResult.data ?? {}) as Record<string, unknown>,
          error: upsertResult.error,
        };
      }
    }

    return {
      data: (result.data ?? {}) as Record<string, unknown>,
      error: result.error,
    };
  });

  return toClientRecord<T & { id: string }>(table, row);
}

export async function updateWellnessRecord<T extends Record<string, unknown>>(
  table: WellnessTableAlias,
  recordId: string,
  payload: Partial<T>,
) {
  const dbPayload = toDbRecord(table, payload as Record<string, unknown>);
  await resolveAuthenticatedUserId(dbPayload.user_id);

  const row = await withTableFallback<Record<string, unknown>>(table, async (resolvedTable) => {
    const resolvedPayload = sanitizePayloadForResolvedTable(resolvedTable, dbPayload);
    const result = await supabase
      .from(resolvedTable)
      .update(resolvedPayload)
      .eq("id", recordId)
      .select("*")
      .single();

    if (result.error) {
      console.error(`[LifeSync] SUPABASE UPDATE ERROR for table ${resolvedTable}:`, result.error, "Payload:", resolvedPayload);
    }

    return {
      data: (result.data ?? {}) as Record<string, unknown>,
      error: result.error,
    };
  });

  return toClientRecord<T & { id: string }>(table, row);
}

export async function fetchWellnessRecords<T extends Record<string, unknown>>(
  table: WellnessTableAlias,
  userId: string,
): Promise<T[]> {
  return withTableFallback<T[]>(table, async (resolvedTable) => {
    const result = await supabase
      .from(resolvedTable)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (result.error && !/column .*created_at/i.test(result.error.message ?? "")) {
      return { data: [], error: result.error };
    }

    if (result.error) {
      const fallback = await supabase.from(resolvedTable).select("*").eq("user_id", userId);
      return {
        data: ((fallback.data ?? []) as Record<string, unknown>[]).map((record) => toClientRecord<T>(table, record)),
        error: fallback.error,
      };
    }

    return {
      data: ((result.data ?? []) as Record<string, unknown>[]).map((record) => toClientRecord<T>(table, record)),
      error: null,
    };
  });
}

export async function deleteWellnessRecord(table: WellnessTableAlias, recordId: string) {
  await resolveAuthenticatedUserId();

  await withTableFallback<true>(table, async (resolvedTable) => {
    const result = await supabase.from(resolvedTable).delete().eq("id", recordId);
    return { data: true, error: result.error };
  });

  return { deletedCount: 1 };
}

export async function deleteWellnessRecordsByField(
  table: WellnessTableAlias,
  userId: string,
  field: string,
  value: string,
) {
  const dbField = camelToSnake(field);
  const authenticatedUserId = await resolveAuthenticatedUserId(userId);

  if (authenticatedUserId !== userId) {
    throw new Error("User mismatch for delete operation. Please sign in again.");
  }

  await withTableFallback<true>(table, async (resolvedTable) => {
    const result = await supabase.from(resolvedTable).delete().eq("user_id", userId).eq(dbField, value);
    return { data: true, error: result.error };
  });

  return { deletedCount: 1 };
}
