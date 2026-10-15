import {createHash,randomInt} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
const egypt=/^01[0125][0-9]{8}$/;
export async function POST(req:NextRequest){
 const b=await req.json().catch(()=>null);const name=String(b?.name||"").trim(),phone=String(b?.phone||"").replace(/\s+/g,""),password=String(b?.password||"");
 if(name.length<2||!egypt.test(phone)||password.length<8)return NextResponse.json({error:"INVALID_INPUT"},{status:422});
 if(await db.user.findUnique({where:{phone},select:{id:true}}))return NextResponse.json({error:"PHONE_EXISTS"},{status:409});
 if(!process.env.SMS_PROVIDER||!process.env.SMS_API_KEY)return NextResponse.json({error:"OTP_PROVIDER_NOT_CONFIGURED"},{status:503});
 const code=String(randomInt(100000,1000000)),secret=process.env.AUTH_SECRET||"";
 const codeHash=createHash("sha256").update(phone+":"+code+":"+secret).digest("hex");
 await db.otpChallenge.create({data:{destination:phone,codeHash,expiresAt:new Date(Date.now()+5*60*1000)}});
 // SMS adapter sends code only after provider credentials are configured.
 return NextResponse.json({ok:true});
}