import { db } from "@/lib/db";

export async function checkUserActionLimit(
  userId: string,
  action: string,
  durationMs: number,
  max: number
): Promise<boolean> {
  if (!/^[a-z0-9:_-]{1,48}$/i.test(action) || durationMs < 1000 || max < 1) return false;
  const now = Date.now();
  const periodStart = Math.floor(now / durationMs) * durationMs;
  const key = `action:${action}:${periodStart}:${userId}`;
  const row = await db.registrationRateLimit.upsert({
    where: { key },
    create: { key, count: 1, expiresAt: new Date(periodStart + durationMs + 86_400_000) },
    update: { count: { increment: 1 } }
  });
  return row.count <= max;
}
