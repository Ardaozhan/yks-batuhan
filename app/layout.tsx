import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { CookieBanner } from "@/components/ui/cookie-banner";

const geist = Geist({ variable: "--font-geist", subsets: ["latin", "latin-ext"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalApplication",
  "name": "YKS Odak",
  "operatingSystem": "All",
  "applicationCategory": "EducationalApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TRY"
  },
  "description": "ÖSYM müfredat sıralı AI çalışma planlayıcısı, net takip sistemi ve YKS koçluk platformu.",
  "url": "https://yks-batuhan.vercel.app"
};

export const viewport: Viewport = {
  themeColor: "#fbf9f5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://yks-batuhan.vercel.app"),
  title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip Sistemi",
  description:
    "ÖSYM müfredat sıralı AI çalışma planlayıcısı, net takip sistemi ve 2025/2026 YKS hazırlık platformu.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YKS Odak",
  },
  openGraph: {
    title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip",
    description: "ÖSYM müfredat sıralı AI çalışma planlayıcısı ve YKS hazırlık platformu.",
    url: "https://yks-batuhan.vercel.app",
    siteName: "YKS Odak",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip",
    description: "ÖSYM müfredat sıralı AI çalışma planlayıcısı ve YKS hazırlık platformu.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="tr"
      className={`${geist.variable} ${inter.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Toaster />
        <CookieBanner />
        <Script
          id="sw-register"
          strategy="afterInteractive"
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
