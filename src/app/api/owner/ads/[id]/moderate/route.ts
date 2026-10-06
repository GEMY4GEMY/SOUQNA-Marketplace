import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentActor } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/auth/server-guards";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: Context) {
  const actor = await currentActor();
  try { requirePermission(actor, "ads.review"); }
  catch (error) {
    const code = error instanceof Error ? error.message : "FORBIDDEN";
    return NextResponse.json({ error: code }, { status: code === "UNAUTHENTICATED" ? 401 : 403 });
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;

  if (decision !== "APPROVE" && decision !== "REJECT") {
    return NextResponse.json({ error: "INVALID_DECISION" }, { status: 422 });
  }

  const existing = await db.ad.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!existing) return NextResponse.json({ error: "AD_NOT_FOUND" }, { status: 404 });
  if (existing.status !== "PENDING") {
    return NextResponse.json({ error: "AD_NOT_PENDING" }, { status: 409 });
  }

  const status = decision === "APPROVE" ? "ACTIVE" : "REJECTED";
  const ad = await db.$transaction(async (tx) => {
    const updated = await tx.ad.update({ where: { id }, data: { status }, select: { id: true, status: true } });
    await tx.auditLog.create({
      data: {
        actorId: actor!.id,
        action: decision === "APPROVE" ? "AD_APPROVED" : "AD_REJECTED",
        entityType: "Ad",
        entityId: id,
        metadata: { previousStatus: existing.status, newStatus: status },
      },
    });
    return updated;
  });

  return NextResponse.json({ ad });
}
