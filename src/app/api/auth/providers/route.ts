import { NextResponse } from "next/server";
import { smsReady } from "@/lib/auth/sms";
export async function GET() {
  return NextResponse.json({ phoneOtp: smsReady(), google: false, apple: false });
}
