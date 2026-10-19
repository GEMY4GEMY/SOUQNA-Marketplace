import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";
import { isSameOrigin } from "@/lib/auth/same-origin";

type Context={params:Promise<{id:string}>};
export async function PATCH(request:NextRequest,context:Context){
 if(!isSameOrigin(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
 const actor=await currentActor();
 if(!actor)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const {id}=await context.params;
 const body=await request.json().catch(()=>null);
 const action=body?.action;
 if(action!=="SOLD"&&action!=="ARCHIVE")return NextResponse.json({error:"INVALID_ACTION"},{status:400});
 const ad=await db.ad.findUnique({where:{id},select:{id:true,ownerId:true,status:true}});
 if(!ad)return NextResponse.json({error:"AD_NOT_FOUND"},{status:404});
 if(ad.ownerId!==actor.id)return NextResponse.json({error:"FORBIDDEN"},{status:403});
 if(action==="SOLD"&&!["ACTIVE","PENDING"].includes(ad.status))return NextResponse.json({error:"INVALID_STATUS"},{status:409});
 if(action==="ARCHIVE"&&ad.status==="ARCHIVED")return NextResponse.json({error:"INVALID_STATUS"},{status:409});
 const status=action==="SOLD"?"SOLD":"ARCHIVED";
 const updated=await db.ad.update({where:{id},data:{status},select:{id:true,status:true}});
 return NextResponse.json({ad:updated});
}
