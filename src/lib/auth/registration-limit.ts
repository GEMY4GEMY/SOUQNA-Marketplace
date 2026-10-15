import { createHmac } from "crypto";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

// Configure the ingress to overwrite forwarded client-IP headers; these are not identity proof.
export async function checkRegistrationIpLimit(req: NextRequest): Promise<boolean> {
  const forwarded = req.headers.get("x-forwarded-for");
  const address = forwarded?.split(",").map(s => s.trim()).filter(Boolean).at(-1)
    || req.headers.get("x-real-ip") || "unidentified";
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
