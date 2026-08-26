import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
export const cookieName = "yks_admin_session";
export const sign = () => createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update("admin").digest("hex");
export const validAdminPassword = (value:string) => { const a=Buffer.from(value), b=Buffer.from(process.env.ADMIN_PASSWORD ?? ""); return b.length>0&&a.length===b.length&&timingSafeEqual(a,b); };
export async function isAdminSession(){const value=(await cookies()).get(cookieName)?.value; return Boolean(value&&timingSafeEqual(Buffer.from(value),Buffer.from(sign())));}
