import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function hasValidImageSignature(bytes: Buffer, type: string): boolean {
  if (type === "image/jpeg")
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]));
  if (type === "image/webp")
    return bytes.length >= 12 &&
      bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
      bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export async function saveLocalImage(file: File) {
  if (!allowed.has(file.type)) throw new Error("UNSUPPORTED_IMAGE");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("IMAGE_TOO_LARGE");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasValidImageSignature(bytes, file.type)) throw new Error("INVALID_IMAGE_CONTENT");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "ads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return { storageKey: `ads/${name}`, url: `/uploads/ads/${name}` };
}

export async function deleteLocalImage(storageKey: string) {
  if (!storageKey.startsWith("ads/")) return;
  await unlink(path.join(process.cwd(), "public", "uploads", storageKey)).catch(() => {});
}
