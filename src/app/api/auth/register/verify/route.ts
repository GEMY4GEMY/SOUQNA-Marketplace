import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const registrationId = typeof b?.registrationId === "string" ? b.registrationId : "";
  const code = typeof b?.code === "string" ? b.code : "";
  if (!/^[a-z0-9]{15,40}$/.test(registrationId) || !/^[0-9]{6}$/.test(code))
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });

  const pending = await db.pendingRegistration.findUnique({ where: { id: registrationId } });
  if (!pending || pending.expiresAt <= new Date())
    return NextResponse.json({ error: "INVALID_OR_EXPIRED_CODE" }, { status: 401 });

  const challenge = await db.otpChallenge.findFirst({
    where: { destination: pending.phone, purpose: "REGISTER", consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });
  if (!challenge || challenge.attempts >= 5)
    return NextResponse.json({ error: "INVALID_OR_EXPIRED_CODE" }, { status: 401 });
  const calculated = createHash("sha256").update(pending.phone + ":" + code + ":" + (process.env.AUTH_SECRET || "")).digest("hex");
  const a = Buffer.from(challenge.codeHash, "hex"), z = Buffer.from(calculated, "hex");
  if (a.length !== z.length || !timingSafeEqual(a, z)) {
    await db.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    return NextResponse.json({ error: "INVALID_OR_EXPIRED_CODE" }, { status: 401 });
  }

  try {
    const user = await db.$transaction(async (tx) => {
      const claimed = await tx.otpChallenge.updateMany({ where: { id: challenge.id, consumedAt: null, attempts: { lt: 5 } }, data: { consumedAt: new Date() } });
      if (claimed.count !== 1) throw new Error("CHALLENGE_USED");
      const created = await tx.user.create({ data: { name: pending.name, phone: pending.phone, passwordHash: pending.passwordHash, role: "USER" }, select: { id: true, name: true, role: true } });
      await tx.otpChallenge.update({ where: { id: challenge.id }, data: { userId: created.id } });
      await tx.authAccount.create({ data: { userId: created.id, provider: "PHONE", providerUserId: pending.phone } });
      await tx.pendingRegistration.delete({ where: { id: pending.id } });
      return created;
    });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set("souqna_session", createSessionToken(user.id, user.role), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return response;
  } catch {
    return NextResponse.json({ error: "REGISTRATION_CONFLICT" }, { status: 409 });
  }
}
