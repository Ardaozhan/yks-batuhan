import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/auth/callback",
  "/privacy",
  "/terms",
]);

const authFormPaths = new Set(["/login", "/register"]);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Admin authentication uses its own session outside Supabase user flow
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (isAdminPath) return response;

  // Static files and metadata routes are always public
  if (
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-icon") ||
    pathname.startsWith("/opengraph-image") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return response;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const isAuthenticated = Boolean(claims && !claims.is_anonymous);
  const isPublic = publicPaths.has(pathname);

  if (!isAuthenticated && pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Anonymous sessions can use public pages but cannot enter protected routes.
  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If already logged in and visiting login/register, redirect to today workspace
  if (isAuthenticated && authFormPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/today", request.url));
  }

  return response;
}
