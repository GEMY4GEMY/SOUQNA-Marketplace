import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [categories, governorates] = await Promise.all([
    db.category.findMany({
      where: { active: true, parentId: null },
      orderBy: { nameAr: "asc" },
      select: { id: true, nameAr: true, slug: true },
    }),
    db.governorate.findMany({
      where: { active: true },
      orderBy: { nameAr: "asc" },
      select: {
        id: true, nameAr: true, slug: true,
        areas: { where: { active: true }, orderBy: { nameAr: "asc" }, select: { id: true, nameAr: true, slug: true } },
      },
    }),
  ]);
  return NextResponse.json({ categories, governorates });
}
