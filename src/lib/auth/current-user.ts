import { cookies } from "next/headers";
import { readSessionToken } from "./session";

export async function currentActor() {
  const store = await cookies();
  const payload = readSessionToken(store.get("souqna_session")?.value);
  return payload ? { id: payload.sub, role: payload.role } : null;
}
