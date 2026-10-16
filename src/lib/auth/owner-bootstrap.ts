import { db } from "@/lib/db";
import { hashPassword } from "./password";

const egyptPhone = /^01[0125][0-9]{8}$/;

export async function bootstrapSuperOwner() {
  const name = process.env.BOOTSTRAP_OWNER_NAME?.trim();
  const phone = process.env.BOOTSTRAP_OWNER_PHONE?.replace(/\s+/g, "");
  const password = process.env.BOOTSTRAP_OWNER_PASSWORD;
  const enabled = process.env.BOOTSTRAP_OWNER_ENABLED === "true";

  if (!enabled) return { created: false, reason: "DISABLED" } as const;
  if (!name || !phone || !password || !egyptPhone.test(phone) || password.length < 12) {
    throw new Error("INVALID_BOOTSTRAP_OWNER_CONFIG");
  }

  const existingOwner = await db.user.findFirst({
    where: { role: "SUPER_OWNER" },
    select: { id: true },
  });
  if (existingOwner) return { created: false, reason: "OWNER_EXISTS" } as const;

  const phoneTaken = await db.user.findUnique({ where: { phone }, select: { id: true } });
  if (phoneTaken) throw new Error("BOOTSTRAP_PHONE_ALREADY_USED");

  const owner = await db.user.create({
    data: { name, phone, passwordHash: hashPassword(password), role: "SUPER_OWNER" },
    select: { id: true, name: true, role: true },
  });

  await db.auditLog.create({
    data: { actorId: owner.id, action: "SUPER_OWNER_BOOTSTRAPPED", entityType: "User", entityId: owner.id },
  });

  return { created: true, owner } as const;
}
