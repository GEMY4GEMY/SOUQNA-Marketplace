import { createHash, randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkRegistrationIpLimit } from "@/lib/auth/registration-limit";
import { sendRegistrationCode, smsReady } from "@/lib/auth/sms";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const registrationId = typeof b?.registrationId === "string" ? b.registrationId : "";
  if (!/^[a-z0-9]{15,40}$/.test(registrationId))
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  if (!smsReady() || !process.env.AUTH_SECRET)
    return NextResponse.json({ error: "OTP_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
  if (!(await checkRegistrationIpLimit(req)))
    return NextResponse.json({ error: "TOO_MANY_REQUESTS" }, { status: 429 });

  const now = new Date();
  const pending = await db.pendingRegistration.findUnique({ where: { id: registrationId } });
  if (!pending || pending.expiresAt <= now)
    return NextResponse.json({ error: "REGISTRATION_EXPIRED" }, { status: 410 });

  const latest = await db.otpChallenge.findFirst({
    where: { destination: pending.phone, purpose: "REGISTER" },
    orderBy: { createdAt: "desc" }, select: { createdAt: true }
  });
  if (latest && latest.createdAt > new Date(now.getTime() - 60_000))
    return NextResponse.json({ error: "PLEASE_WAIT" }, { status: 429 });

  const sentToday = await db.otpChallenge.count({
    where: { destination: pending.phone, purpose: "REGISTER", createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60_000) } }
  });
  if (sentToday >= 10)
    return NextResponse.json({ error: "OTP_DAILY_LIMIT" }, { status: 429 });

  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(now.getTime() + 5 * 60_000);
  const challenge = await db.otpChallenge.create({
    data: {
      destination: pending.phone, purpose: "REGISTER",
      codeHash: createHash("sha256").update(pending.phone + ":" + code + ":" + process.env.AUTH_SECRET).digest("hex"),
      expiresAt
    }
  });
  try {
    await sendRegistrationCode(pending.phone, code);
    await db.pendingRegistration.update({ where: { id: pending.id }, data: { expiresAt } });
  } catch {
    await db.otpChallenge.delete({ where: { id: challenge.id } }).catch(() => {});
    return NextResponse.json({ error: "SMS_SEND_FAILED" }, { status: 502 });
  }
  return NextResponse.json({ registrationId: pending.id, phone: pending.phone, expiresAt: expiresAt.toISOString() });
}
