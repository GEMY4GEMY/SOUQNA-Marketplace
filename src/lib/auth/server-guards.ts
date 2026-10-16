import type { Role, Permission } from "./permissions";
import { can } from "./permissions";

export type SessionActor = {
  id: string;
  role: Role;
};

/**
 * Temporary server-side authorization boundary.
 * Authentication will supply SessionActor; API routes must never trust a role
 * sent by the browser/request body.
 */
export function requirePermission(actor: SessionActor | null, permission: Permission) {
  if (!actor) throw new Error("UNAUTHENTICATED");
  if (!can(actor.role, permission)) throw new Error("FORBIDDEN");
  return actor;
}
