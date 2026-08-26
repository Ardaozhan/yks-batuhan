import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf9f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f130e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yks-batuhan.vercel.app"),
  title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip Sistemi",
  description:
    "ÖSYM müfredat sıralı AI çalışma planlayıcısı, net takip sistemi ve 2025/2026 YKS sıralama simülatörü.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YKS Odak",
  },
  openGraph: {
    title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip",
    description: "ÖSYM müfredat sıralı AI çalışma planlayıcısı ve 2025/2026 YKS sıralama simülatörü.",
    url: "https://yks-batuhan.vercel.app",
    siteName: "YKS Odak",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip",
    description: "ÖSYM müfredat sıralı AI çalışma planlayıcısı ve 2025/2026 YKS sıralama simülatörü.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geist.variable} ${inter.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
