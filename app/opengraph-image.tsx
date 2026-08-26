import { ImageResponse } from "next/og";

export const alt = "YKS Odak - AI Tabanlı YKS Koçluğu & Takip Sistemi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #111410 0%, #1e261a 50%, #2f3e27 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "#526049",
              border: "2px solid #8fa883",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            🎯
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "36px", fontWeight: "900", letterSpacing: "-1px" }}>
              YKS ODAK
            </span>
            <span style={{ fontSize: "16px", color: "#8fa883", fontWeight: "bold" }}>
              2025 / 2026 AI KOÇLUK & TAKİP SİSTEMİ
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span
            style={{
              fontSize: "56px",
              fontWeight: "900",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              maxWidth: "900px",
            }}
          >
            ÖSYM Müfredat Sıralı Akıllı Çalışma Planı & Sıralama Simülatörü
          </span>
          <span style={{ fontSize: "24px", color: "#c5c8be", maxWidth: "800px" }}>
            DeepSeek V3 destekli AI Koç, net takibi, OBP katkısı ve güncel Türkiye sıralaması projeksiyonu.
          </span>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            + 160+ ÖSYM Konusu
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            + Canlı Sıralama Simülatörü
          </div>
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              padding: "10px 24px",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            + DeepSeek V3 AI Koç
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
