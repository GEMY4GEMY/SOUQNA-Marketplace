import { cookies } from "next/headers";
import { readSessionToken } from "./session";
import { db } from "@/lib/db";

export async function currentActor() {
  const store = await cookies();
  const payload = readSessionToken(store.get("souqna_session")?.value);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true, status: true }
  });
  if (!user || user.status !== "ACTIVE") return null;

  // Database role is authoritative so permission changes take effect immediately.
  return { id: user.id, role: user.role };
}
