import { AppShell } from "@/components/navigation/app-shell";
import { SimulatorPage } from "@/components/simulator/simulator-page";

export const metadata = {
  title: "YKS Sıralama & Net Simülatörü 2025/2026 | YKS Odak",
  description: "2025/2026 ÖSYM katsayıları ve yığılma verileriyle TYT, AYT netlerini simüle et, tahmini Türkiye sıralamanı ve yerleştirme puanını anlık hesapla.",
};

export default function Page() {
  return (
    <AppShell>
      <SimulatorPage />
    </AppShell>
  );
}
