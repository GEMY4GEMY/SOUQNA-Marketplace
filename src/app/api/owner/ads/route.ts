import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/server-guards";

export async function GET(request: NextRequest) {
  const actor = await currentActor();
  try { requirePermission(actor, "ads.review"); }
  catch (error) {
    const code = error instanceof Error ? error.message : "FORBIDDEN";
    return NextResponse.json({ error: code }, { status: code === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const rawStatus = request.nextUrl.searchParams.get("status") || "PENDING";
  const allowed = ["DRAFT","PENDING","ACTIVE","REJECTED","SOLD","EXPIRED","ARCHIVED"] as const;
  const status = allowed.find((item) => item === rawStatus) ?? "PENDING";

  const ads = await db.ad.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      owner: { select: { id: true, name: true, phone: true } },
      category: { select: { id: true, nameAr: true } },
      area: { select: { id: true, nameAr: true } },
    },
  });
  return NextResponse.json({ ads });
}
