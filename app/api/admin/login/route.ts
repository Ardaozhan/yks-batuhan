import { NextResponse } from "next/server";
import { cookieName, sign, validAdminPassword } from "@/lib/admin-session";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };
  if (!validAdminPassword(password ?? "")) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }
  const r = NextResponse.json({ ok: true });
  r.cookies.set(cookieName, sign(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 43200,
  });
  return r;
}
