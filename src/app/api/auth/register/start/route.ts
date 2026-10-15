import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const egypt = /^01[0125][0-9]{8}$/;

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const name = typeof b?.name === "string" ? b.name.trim() : "";
  const phone = typeof b?.phone === "string" ? b.phone.replace(/\s+/g, "") : "";
  const password = typeof b?.password === "string" ? b.password : "";
  if (name.length < 2 || name.length > 120 || !egypt.test(phone) || password.length < 8 || password.length > 128)
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  if (await db.user.findUnique({ where: { phone }, select: { id: true } }))
    return NextResponse.json({ error: "PHONE_EXISTS" }, { status: 409 });

  // No SMS adapter has been wired yet. Never claim an OTP was sent.
  return NextResponse.json({ error: "OTP_PROVIDER_NOT_CONFIGURED" }, { status: 503 });
}
