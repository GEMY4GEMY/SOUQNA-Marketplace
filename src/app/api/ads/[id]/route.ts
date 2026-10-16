import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const { id } = await context.params;
  const ad = await db.ad.findFirst({
    where: { id, status: "ACTIVE" },
    select: {
      id: true, title: true, description: true, price: true, featured: true, createdAt: true, attributes: true,
      images: { orderBy: { position: "asc" }, select: { id: true, url: true, position: true } },
      owner: { select: { id: true, name: true, phone: true, role: true } },
      category: { select: { id: true, nameAr: true, slug: true } },
      governorate: { select: { id: true, nameAr: true, slug: true } },
      area: { select: { id: true, nameAr: true, slug: true } },
    },
  });
  if (!ad) return NextResponse.json({ error: "AD_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ad });
}
