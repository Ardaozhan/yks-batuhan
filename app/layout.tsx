import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = { title: "YKS Master", description: "Kişisel YKS çalışma yönetim sistemi" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr" className={`${geist.variable} ${inter.variable}`}><body>{children}</body></html>;
}
