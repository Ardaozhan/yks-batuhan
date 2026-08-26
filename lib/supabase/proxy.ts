import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = new Set(["/login", "/register"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Admin authentication uses its own httpOnly session cookie. Keep both the
  // admin UI and its API outside the Supabase user-session redirects.
  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminPath) return response;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return response;
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
    },
  });
  const { data: claims } = await supabase.auth.getClaims();
  const isPublic = publicPaths.has(pathname);
  if (!claims && !isPublic) return NextResponse.redirect(new URL("/login", request.url));
  if (claims && isPublic) return NextResponse.redirect(new URL("/today", request.url));
  return response;
}
