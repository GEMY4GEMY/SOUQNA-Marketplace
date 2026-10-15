import { createHmac } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Railway public HTTP edge sets X-Real-IP. Private-network callers are not trusted.
export async function checkRegistrationIpLimit(req: NextRequest): Promise<boolean> {
  const address = req.headers.get("x-real-ip")?.trim();
  if (!address || address.length > 64 || /[^a-fA-F0-9:.]/.test(address)) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  const digest = createHmac("sha256", secret).update(address).digest("hex");
  const now = Date.now();
  for (const [period, duration, max] of [["hour", 3600000, 8], ["day", 86400000, 30]] as const) {
    const periodStart = Math.floor(now / duration) * duration;
    const key = period + ":" + periodStart + ":" + digest;
    const row = await db.registrationRateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: new Date(periodStart + duration + 86400000) },
      update: { count: { increment: 1 } }
    });
    if (row.count > max) return false;
  }
  return true;
}
