import {NextResponse} from "next/server";
export async function GET(){
 return NextResponse.json({
  phoneOtp: Boolean(process.env.SMS_PROVIDER&&process.env.SMS_API_KEY),
  google: Boolean(process.env.GOOGLE_CLIENT_ID&&process.env.GOOGLE_CLIENT_SECRET),
  apple: Boolean(process.env.APPLE_CLIENT_ID&&process.env.APPLE_CLIENT_SECRET)
 });
}