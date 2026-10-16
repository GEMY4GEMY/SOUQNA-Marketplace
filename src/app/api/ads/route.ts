import { NextRequest, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/same-origin";
import { db } from "@/lib/db";
import { validateAdInput } from "@/lib/validation/ad";
import { currentActor } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/server-guards";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const take = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 50);
  const categoryId = params.get("categoryId") || undefined;
  const governorateId = params.get("governorateId") || undefined;
  const areaId = params.get("areaId") || undefined;

  const ads = await db.ad.findMany({
    where: { status: "ACTIVE", categoryId, governorateId, areaId },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true, title: true, price: true, featured: true, createdAt: true,
      category: { select: { nameAr: true, slug: true } },
      governorate: { select: { nameAr: true, slug: true } },
      area: { select: { nameAr: true, slug: true } },
    },
  });
  return NextResponse.json({ ads });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "INVALID_ORIGIN" }, { status: 403 });
  const actor = await currentActor();
  try { requirePermission(actor, "ads.create"); }
  catch (error) {
    const code = error instanceof Error ? error.message : "FORBIDDEN";
    return NextResponse.json({ error: code }, { status: code === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  const parsed = validateAdInput(body);
  if (!parsed.ok) return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.errors }, { status: 422 });

  const [category, governorate, area] = await Promise.all([db.category.findUnique({where:{id:parsed.data.categoryId},select:{active:true,parent:{select:{active:true}}}}),db.governorate.findUnique({where:{id:parsed.data.governorateId},select:{active:true}}),parsed.data.areaId?db.area.findUnique({where:{id:parsed.data.areaId},select:{active:true,governorateId:true}}):Promise.resolve(null)]);
  if(!category?.active || category.parent?.active===false) return NextResponse.json({error:"CATEGORY_UNAVAILABLE"},{status:422});
  if(!governorate?.active) return NextResponse.json({error:"GOVERNORATE_UNAVAILABLE"},{status:422});
  if(area && (!area.active || area.governorateId!==parsed.data.governorateId)) return NextResponse.json({error:"AREA_UNAVAILABLE"},{status:422});

  const ad = await db.ad.create({
    data: {
      ownerId: actor!.id,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      governorateId: parsed.data.governorateId,
      areaId: parsed.data.areaId,
      status: "PENDING",
    },
    select: { id: true, title: true, status: true, createdAt: true },
  });

  await db.auditLog.create({
    data: { actorId: actor!.id, action: "AD_CREATED", entityType: "Ad", entityId: ad.id },
  });

  return NextResponse.json({ ad }, { status: 201 });
}
