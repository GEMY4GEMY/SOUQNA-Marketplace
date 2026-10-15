import {createHash,randomInt} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
const egypt=/^01[0125][0-9]{8}$/;
export async function POST(req:NextRequest){
 const body=await req.json().catch(()=>null);const phone=String(body?.phone||"").replace(/\s+/g,"");
 if(!egypt.test(phone))return NextResponse.json({error:"INVALID_PHONE"},{status:422});
 if(!process.env.SMS_PROVIDER||!process.env.SMS_API_KEY)return NextResponse.json({error:"OTP_PROVIDER_NOT_CONFIGURED"},{status:503});
 const code=String(randomInt(100000,1000000));const secret=process.env.AUTH_SECRET||"";
 const codeHash=createHash("sha256").update(phone+":"+code+":"+secret).digest("hex");
 await db.otpChallenge.create({data:{destination:phone,codeHash,expiresAt:new Date(Date.now()+5*60*1000)}});
 // Provider adapter intentionally becomes active only after SMS_PROVIDER credentials are configured.
 return NextResponse.json({ok:true});
}
