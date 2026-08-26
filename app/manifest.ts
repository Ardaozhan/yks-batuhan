import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "YKS Odak - AI Tabanlı YKS Koçluğu & Takip",
    short_name: "YKS Odak",
    description: "ÖSYM müfredat sıralı AI çalışma planlayıcısı, net takip sistemi ve 2025/2026 YKS sıralama simülatörü.",
    start_url: "/today",
    display: "standalone",
    background_color: "#fbf9f5",
    theme_color: "#526049",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
