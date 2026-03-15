import type { WellnessTableName } from "@shared/schema";

export async function createWellnessRecord<T extends Record<string, unknown>>(
  table: WellnessTableName,
  payload: T,
) {
  const response = await fetch(`/api/wellness/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to save wellness record.");
  }

  return data as T & { id: string };
}

export async function fetchWellnessRecords<T extends Record<string, unknown>>(
  table: WellnessTableName,
  userId: string,
): Promise<T[]> {
  const response = await fetch(`/api/wellness/${table}/${userId}`);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || "Failed to fetch records.");
  return (data as T[]) ?? [];
}

export async function deleteWellnessRecord(table: WellnessTableName, recordId: string) {
  const response = await fetch(`/api/wellness/${table}/record/${encodeURIComponent(recordId)}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete record.");
  }

  return data as { deletedCount: number };
}

export async function deleteWellnessRecordsByField(
  table: WellnessTableName,
  userId: string,
  field: string,
  value: string,
) {
  const params = new URLSearchParams({ userId, field, value });
  const response = await fetch(`/api/wellness/${table}?${params.toString()}`, {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete records.");
  }

  return data as { deletedCount: number };
}
