import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://yks-batuhan.vercel.app";
  const routes = [
    "",
    "/today",
    "/subjects",
    "/exams",
    "/simulator",
    "/planner",
    "/analytics",
    "/coach",
    "/login",
    "/register",
    "/forgot-password",
    "/privacy",
    "/terms",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" || route === "/today" || route === "/simulator" ? 1 : 0.8,
  }));
}
