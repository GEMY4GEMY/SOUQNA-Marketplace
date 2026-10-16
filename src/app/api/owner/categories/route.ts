import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/server-guards";
import { isSameOrigin } from "@/lib/auth/same-origin";

export async function GET() {
  const actor=await currentActor();
  try{requirePermission(actor,"categories.manage");}catch(e){const code=e instanceof Error?e.message:"FORBIDDEN";return NextResponse.json({error:code},{status:code==="UNAUTHENTICATED"?401:403});}
  const categories=await db.category.findMany({where:{},orderBy:[{sortOrder:"asc"},{nameAr:"asc"}],select:{id:true,parentId:true,nameAr:true,nameEn:true,slug:true,active:true,icon:true,imageUrl:true,sortOrder:true,_count:{select:{ads:true}}}});
  return NextResponse.json({categories});
}
export async function PATCH(request:NextRequest){
  if(!isSameOrigin(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
  const actor=await currentActor();try{requirePermission(actor,"categories.manage");}catch(e){const code=e instanceof Error?e.message:"FORBIDDEN";return NextResponse.json({error:code},{status:code==="UNAUTHENTICATED"?401:403});}
  const b=await request.json().catch(()=>null);const id=typeof b?.id==="string"?b.id:"";if(!id)return NextResponse.json({error:"INVALID_INPUT"},{status:422});
  const data:{nameAr?:string;nameEn?:string;active?:boolean;icon?:string|null;imageUrl?:string|null;sortOrder?:number}={};
  if(typeof b.nameAr==="string"&&b.nameAr.trim().length>=2)data.nameAr=b.nameAr.trim().slice(0,80);
  if(typeof b.nameEn==="string"&&b.nameEn.trim().length>=2)data.nameEn=b.nameEn.trim().slice(0,80);
  if(typeof b.active==="boolean")data.active=b.active;
  if(typeof b.icon==="string")data.icon=b.icon.trim().slice(0,12)||null;
  if(typeof b.imageUrl==="string")data.imageUrl=b.imageUrl.trim().slice(0,500)||null;
  if(Number.isInteger(b.sortOrder)&&b.sortOrder>=0&&b.sortOrder<=999)data.sortOrder=b.sortOrder;
  const category=await db.category.update({where:{id},data,select:{id:true,nameAr:true,nameEn:true,slug:true,active:true,icon:true,imageUrl:true,sortOrder:true}});
  await db.auditLog.create({data:{actorId:actor!.id,action:"CATEGORY_UPDATED",entityType:"Category",entityId:id,metadata:data}});
  return NextResponse.json({category});
}

export async function POST(request:NextRequest){
  if(!isSameOrigin(request))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403});
  const actor=await currentActor();try{requirePermission(actor,"categories.manage");}catch(e){const code=e instanceof Error?e.message:"FORBIDDEN";return NextResponse.json({error:code},{status:code==="UNAUTHENTICATED"?401:403});}
  const b=await request.json().catch(()=>null);
  const nameAr=typeof b?.nameAr==="string"?b.nameAr.trim().slice(0,80):"";
  const nameEn=typeof b?.nameEn==="string"?b.nameEn.trim().slice(0,80):"";
  const slug=typeof b?.slug==="string"?b.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70):"";
  if(nameAr.length<2||nameEn.length<2||slug.length<2)return NextResponse.json({error:"INVALID_INPUT"},{status:422});
  if(await db.category.findUnique({where:{slug},select:{id:true}}))return NextResponse.json({error:"SLUG_EXISTS"},{status:409});
  const parentId=typeof b.parentId==="string"&&b.parentId?b.parentId:null;if(parentId&&!await db.category.findUnique({where:{id:parentId},select:{id:true}}))return NextResponse.json({error:"PARENT_NOT_FOUND"},{status:422});
  const last=await db.category.findFirst({where:{parentId},orderBy:{sortOrder:"desc"},select:{sortOrder:true}});
  const category=await db.category.create({data:{nameAr,nameEn,slug,parentId,icon:typeof b.icon==="string"?b.icon.trim().slice(0,12)||null:null,sortOrder:(last?.sortOrder||0)+1},select:{id:true,parentId:true,nameAr:true,nameEn:true,slug:true,active:true,icon:true,imageUrl:true,sortOrder:true,_count:{select:{ads:true}}}});
  await db.auditLog.create({data:{actorId:actor!.id,action:"CATEGORY_CREATED",entityType:"Category",entityId:category.id,metadata:{slug}}});
  return NextResponse.json({category},{status:201});
}
