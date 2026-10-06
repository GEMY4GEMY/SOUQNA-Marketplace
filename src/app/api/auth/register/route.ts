import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";

const egyptPhone = /^01[0125][0-9]{8}$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.replace(/\s+/g, "") : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 2 || !egyptPhone.test(phone) || password.length < 8) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const exists = await db.user.findUnique({ where: { phone }, select: { id: true } });
  if (exists) return NextResponse.json({ error: "PHONE_EXISTS" }, { status: 409 });

  const user = await db.user.create({
    data: { name, phone, passwordHash: hashPassword(password), role: "USER" },
    select: { id: true, name: true, role: true },
  });

  const token = createSessionToken(user.id, user.role);
  const response = NextResponse.json({ user }, { status: 201 });
  response.cookies.set("souqna_session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}
