import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // X-XSS-Protection is deprecated in modern browsers — CSP below replaces it
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  {
    // Permissions-Policy: disable unused browser features
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    // Content-Security-Policy: XSS secondary defense
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for its inline scripts; nonce-based CSP requires custom server
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // Images: self + data URIs (avatars/icons) + blob (canvas exports)
      "img-src 'self' data: blob:",
      // Fonts served from same origin
      "font-src 'self'",
      // API calls to Supabase + DeepSeek
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost} https://api.deepseek.com`,
      // Iframes blocked (matches X-Frame-Options: SAMEORIGIN)
      "frame-src 'self'",
      // No plugins or objects allowed
      "object-src 'none'",
      // Prevents base tag hijacking
      "base-uri 'self'",
      // All form actions stay on same origin
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

