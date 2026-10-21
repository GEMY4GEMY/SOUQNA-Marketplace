import {NextRequest,NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentActor} from "@/lib/auth/current-user";
import {isSameOrigin} from "@/lib/auth/same-origin";
import {validateAdInput} from "@/lib/validation/ad";
type Context={params:Promise<{id:string}>};
export async function PATCH(request:NextRequest,context:Context){
 if(!isSameOrigin(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
 const actor=await currentActor();if(!actor)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const {id}=await context.params;const existing=await db.ad.findUnique({where:{id},select:{ownerId:true,status:true}});
 if(!existing)return NextResponse.json({error:"AD_NOT_FOUND"},{status:404});if(existing.ownerId!==actor.id)return NextResponse.json({error:"FORBIDDEN"},{status:403});
 if(existing.status==="ARCHIVED")return NextResponse.json({error:"ARCHIVED_AD"},{status:409});
 const body=await request.json().catch(()=>null);if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});
 const parsed=validateAdInput(body);if(!parsed.ok)return NextResponse.json({error:"VALIDATION_ERROR",details:parsed.errors},{status:422});
 const [category,governorate,area]=await Promise.all([db.category.findUnique({where:{id:parsed.data.categoryId},select:{active:true,parent:{select:{active:true}}}}),db.governorate.findUnique({where:{id:parsed.data.governorateId},select:{active:true}}),parsed.data.areaId?db.area.findUnique({where:{id:parsed.data.areaId},select:{active:true,governorateId:true}}):Promise.resolve(null)]);
 if(!category?.active||category.parent?.active===false)return NextResponse.json({error:"CATEGORY_UNAVAILABLE"},{status:422});
 if(!governorate?.active)return NextResponse.json({error:"GOVERNORATE_UNAVAILABLE"},{status:422});
 if(parsed.data.areaId&&(!area||!area.active||area.governorateId!==parsed.data.governorateId))return NextResponse.json({error:"AREA_UNAVAILABLE"},{status:422});
 const ad=await db.ad.update({where:{id},data:{title:parsed.data.title,description:parsed.data.description,price:parsed.data.price,categoryId:parsed.data.categoryId,governorateId:parsed.data.governorateId,areaId:parsed.data.areaId,status:"PENDING",featured:false},select:{id:true,status:true}});
 await db.auditLog.create({data:{actorId:actor.id,action:"AD_UPDATED_BY_OWNER",entityType:"Ad",entityId:id,metadata:{previousStatus:existing.status}}});
 return NextResponse.json({ad});
}
