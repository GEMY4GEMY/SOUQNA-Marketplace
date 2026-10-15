import {createHash,timingSafeEqual} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {hashPassword} from "@/lib/auth/password";
import {createSessionToken} from "@/lib/auth/session";
const egypt=/^01[0125][0-9]{8}$/;
export async function POST(req:NextRequest){
 const b=await req.json().catch(()=>null);const name=String(b?.name||"").trim(),phone=String(b?.phone||"").replace(/\s+/g,""),password=String(b?.password||""),code=String(b?.code||"");
 if(name.length<2||!egypt.test(phone)||password.length<8||!/^[0-9]{6}$/.test(code))return NextResponse.json({error:"INVALID_INPUT"},{status:422});
 if(await db.user.findUnique({where:{phone},select:{id:true}}))return NextResponse.json({error:"PHONE_EXISTS"},{status:409});
 const challenge=await db.otpChallenge.findFirst({where:{destination:phone,purpose:"SIGN_IN",consumedAt:null,expiresAt:{gt:new Date()}},orderBy:{createdAt:"desc"}});
 const hash=createHash("sha256").update(phone+":"+code+":"+(process.env.AUTH_SECRET||"")).digest("hex");
 if(!challenge||challenge.attempts>=5||challenge.codeHash.length!==hash.length||!timingSafeEqual(Buffer.from(challenge.codeHash),Buffer.from(hash))){if(challenge)await db.otpChallenge.update({where:{id:challenge.id},data:{attempts:{increment:1}}});return NextResponse.json({error:"INVALID_OR_EXPIRED_CODE"},{status:401});}
 const user=await db.$transaction(async tx=>{const u=await tx.user.create({data:{name,phone,passwordHash:hashPassword(password),role:"USER"},select:{id:true,name:true,role:true}});await tx.otpChallenge.update({where:{id:challenge.id},data:{consumedAt:new Date(),userId:u.id}});await tx.authAccount.create({data:{userId:u.id,provider:"PHONE",providerUserId:phone}});return u});
 const response=NextResponse.json({user},{status:201});response.cookies.set("souqna_session",createSessionToken(user.id,user.role),{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*14});return response;
}