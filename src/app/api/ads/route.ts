import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateAdInput } from "@/lib/validation/ad";

// Public discovery endpoint. Pagination is intentionally bounded.
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
  // Authentication/session wiring is the next milestone.
  // Until then, creation is intentionally closed rather than accepting spoofed owner IDs.
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });

  const parsed = validateAdInput(body);
  if (!parsed.ok) return NextResponse.json({ error: "VALIDATION_ERROR", details: parsed.errors }, { status: 422 });

  return NextResponse.json(
    { error: "AUTH_REQUIRED", message: "تسجيل الدخول مطلوب قبل نشر الإعلان." },
    { status: 401 },
  );
}
