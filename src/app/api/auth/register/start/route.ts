import { createHash, randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { smsReady, sendRegistrationCode } from "@/lib/auth/sms";
import { checkRegistrationIpLimit } from "@/lib/auth/registration-limit";

const egypt = /^01[0125][0-9]{8}$/;
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const phone = typeof b?.phone === "string" ? b.phone.replace(/\s+/g, "") : "";
  const password = typeof b?.password === "string" ? b.password : "";
  if (name.length < 2 || name.length > 120 || !egypt.test(phone) || password.length < 8 || password.length > 128)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  if (!smsReady() || !process.env.AUTH_SECRET)
    return NextResponse.json({ error: "OTP_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
  if (!(await checkRegistrationIpLimit(req)))
    return NextResponse.json({ error: "TOO_MANY_REQUESTS" }, { status: 429 });
  if (await db.user.findUnique({ where: { phone }, select: { id: true } }))
    return NextResponse.json({ error: "PHONE_EXISTS" }, { status: 409 });

  const now = new Date();
  // Opportunistic bounded cleanup keeps expired registration state from accumulating.
  await Promise.all([
    db.pendingRegistration.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.otpChallenge.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 24 * 60 * 60_000) } } }),
    db.registrationRateLimit.deleteMany({ where: { expiresAt: { lt: now } } })
  ]);
  const previous = await db.pendingRegistration.findUnique({ where: { phone } });
  if (previous && previous.createdAt.getTime() > now.getTime() - 60_000)
    return NextResponse.json({ error: "PLEASE_WAIT" }, { status: 429 });

  const recentCode = await db.otpChallenge.findFirst({
    where: { destination: phone, purpose: "REGISTER", createdAt: { gt: new Date(now.getTime() - 60_000) } },
    orderBy: { createdAt: "desc" }, select: { id: true }
  });
  if (recentCode)
    return NextResponse.json({ error: "PLEASE_WAIT" }, { status: 429 });
  const sentToday = await db.otpChallenge.count({
    where: { destination: phone, purpose: "REGISTER", createdAt: { gt: new Date(now.getTime() - 24 * 60 * 60_000) } }
  });
  if (sentToday >= 10)
    return NextResponse.json({ error: "OTP_DAILY_LIMIT" }, { status: 429 });

  const code = String(randomInt(100000, 1000000));
  const expiresAt = new Date(now.getTime() + 5 * 60_000);
  const pending = await db.pendingRegistration.upsert({
    where: { phone },
    create: { name, phone, passwordHash: hashPassword(password), expiresAt },
    update: { name, passwordHash: hashPassword(password), expiresAt, createdAt: now }
  });
  const challenge = await db.otpChallenge.create({
    data: {
      destination: phone, purpose: "REGISTER",
      codeHash: createHash("sha256").update(phone + ":" + code + ":" + process.env.AUTH_SECRET).digest("hex"),
      expiresAt
    }
  });
  try {
    await sendRegistrationCode(phone, code);
  } catch {
    await db.otpChallenge.delete({ where: { id: challenge.id } }).catch(() => {});
    await db.pendingRegistration.delete({ where: { id: pending.id } }).catch(() => {});
    return NextResponse.json({ error: "SMS_SEND_FAILED" }, { status: 502 });
  }
  return NextResponse.json({ registrationId: pending.id, phone, expiresAt: expiresAt.toISOString() });
}
