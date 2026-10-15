import {mkdir,writeFile,unlink} from "fs/promises";import path from "path";import {randomUUID} from "crypto";
const allowed=new Set(["image/jpeg","image/png","image/webp"]);
export const MAX_IMAGE_BYTES=8*1024*1024;
export async function saveLocalImage(file:File){if(!allowed.has(file.type))throw new Error("UNSUPPORTED_IMAGE");if(file.size>MAX_IMAGE_BYTES)throw new Error("IMAGE_TOO_LARGE");const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";const name=`${randomUUID()}.${ext}`;const dir=path.join(process.cwd(),"public","uploads","ads");await mkdir(dir,{recursive:true});await writeFile(path.join(dir,name),Buffer.from(await file.arrayBuffer()));return{storageKey:`ads/${name}`,url:`/uploads/ads/${name}`};}
export async function deleteLocalImage(storageKey:string){if(!storageKey.startsWith("ads/"))return;await unlink(path.join(process.cwd(),"public","uploads",storageKey)).catch(()=>{});}
