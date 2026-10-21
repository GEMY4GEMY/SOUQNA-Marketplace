import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/server-guards";
import { isSameOrigin } from "@/lib/auth/same-origin";
import { checkUserActionLimit } from "@/lib/auth/action-limit";
import { saveCategoryImage, deleteLocalImage } from "@/lib/storage/local";
type C={params:Promise<{id:string}>};
export async function POST(request:NextRequest,context:C){
 if(!isSameOrigin(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
 const actor=await currentActor();try{requirePermission(actor,"categories.manage");}catch(e){const code=e instanceof Error?e.message:"FORBIDDEN";return NextResponse.json({error:code},{status:code==="UNAUTHENTICATED"?401:403});}
 if(!(await checkUserActionLimit(actor!.id,"category-image",60_000,10)))return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});
 const {id}=await context.params;const category=await db.category.findUnique({where:{id},select:{id:true,imageUrl:true}});if(!category)return NextResponse.json({error:"CATEGORY_NOT_FOUND"},{status:404});
 const form=await request.formData();const file=form.get("image");if(!(file instanceof File))return NextResponse.json({error:"NO_IMAGE"},{status:422});
 try{const saved=await saveCategoryImage(file);const updated=await db.category.update({where:{id},data:{imageUrl:saved.url},select:{id:true,imageUrl:true}});if(category.imageUrl?.startsWith("/uploads/categories/"))await deleteLocalImage(category.imageUrl.replace("/uploads/",""));await db.auditLog.create({data:{actorId:actor!.id,action:"CATEGORY_IMAGE_UPDATED",entityType:"Category",entityId:id}});return NextResponse.json({category:updated});}
 catch(e){const code=e instanceof Error?e.message:"UPLOAD_FAILED";return NextResponse.json({error:code},{status:["UNSUPPORTED_IMAGE","IMAGE_TOO_LARGE","INVALID_IMAGE_CONTENT"].includes(code)?422:500});}
}
