export const ROLES = [
  "SUPER_OWNER",
  "ADMIN",
  "MODERATOR",
  "SUPPORT",
  "BUSINESS",
  "USER",
] as const;

export type Role = (typeof ROLES)[number];

export type Permission =
  | "system.manage"
  | "staff.manage"
  | "settings.manage"
  | "finance.view"
  | "packages.manage"
  | "locations.manage"
  | "categories.manage"
  | "ads.review"
  | "ads.manage"
  | "users.view"
  | "users.moderate"
  | "reports.manage"
  | "support.manage"
  | "ads.create";

const ALL: Permission[] = [
  "system.manage", "staff.manage", "settings.manage", "finance.view",
  "packages.manage", "locations.manage", "categories.manage", "ads.review",
  "ads.manage", "users.view", "users.moderate", "reports.manage",
  "support.manage", "ads.create",
];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_OWNER: ALL,
  ADMIN: ["finance.view","packages.manage","locations.manage","categories.manage","ads.review","ads.manage","users.view","users.moderate","reports.manage","support.manage","ads.create"],
  MODERATOR: ["ads.review","ads.manage","users.view","users.moderate","reports.manage"],
  SUPPORT: ["users.view","reports.manage","support.manage"],
  BUSINESS: ["ads.create"],
  USER: ["ads.create"],
};

export function can(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Guardrail: only the SUPER_OWNER can manage staff/system-level ownership controls.
export function canManageRole(actor: Role, target: Role) {
  if (target === "SUPER_OWNER") return actor === "SUPER_OWNER";
  if (actor === "SUPER_OWNER") return true;
  return actor === "ADMIN" && !["SUPER_OWNER", "ADMIN"].includes(target);
}
