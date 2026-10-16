import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s+/g, "") : "";
  const password = typeof body?.password === "string" ? body.password : "";

  const user = phone ? await db.user.findUnique({ where: { phone } }) : null;
  if (!user?.passwordHash || user.status !== "ACTIVE" || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  const token = createSessionToken(user.id, user.role);
  const response = NextResponse.json({ user: { id: user.id, name: user.name, role: user.role } });
  response.cookies.set("souqna_session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
