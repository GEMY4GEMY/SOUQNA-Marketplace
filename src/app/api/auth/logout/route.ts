import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/same-origin";
import { isSameOrigin } from "@/lib/auth/same-origin";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("souqna_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
