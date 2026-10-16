import { createHmac, timingSafeEqual } from "crypto";
import type { Role } from "./permissions";

export type SessionPayload = { sub: string; role: Role; exp: number };

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET_MISSING");
  return value;
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string, role: Role, ttlSeconds = 60 * 60 * 24 * 14) {
  const payload = encode({ sub: userId, role, exp: Math.floor(Date.now() / 1000) + ttlSeconds });
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload;
    if (!parsed.sub || !parsed.role || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed;
  } catch {
    return null;
  }
}
