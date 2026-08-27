import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Kullanım Şartları ve Koşulları - YKS Odak",
  description: "YKS Odak platformu kullanım şartları, sorumluluk reddi ve üyelik koşulları.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <div className="paper-card p-6 sm:p-10 bg-white">
          <div className="flex items-center gap-3 pb-6 border-b border-[var(--outline)] mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-ai)] text-[var(--primary)]">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--ink)]">
                Kullanım Şartları
              </h1>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-[var(--muted)] leading-relaxed">
            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                1. Hizmetin Kapsamı ve Kabul
              </h2>
              <p>
                {appConfig.name}, YKS (Yükseköğretim Kurumları Sınavı) adaylarının çalışma süreçlerini
                planlamalarına, deneme netlerini takip etmelerine ve yapay zeka destekli öneriler
                almalarına yardımcı olan bir dijital eğitim takip platformudur. Siteye erişerek bu
                kullanım şartlarını kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                2. Sıralama Simülatörü ve Sorumluluk Reddi (Disclaimer)
              </h2>
              <p>
                Platformda yer alan YKS Sıralama ve Net Simülatörü, geçmiş yılların ÖSYM istatistiki
                verilerine ve standart sapma projeksiyonlarına dayanan bir <strong>tahmin aracıdır</strong>.
                Resmi ÖSYM sonuç belgesi niteliği taşımaz ve kesin bir sınav sonucu taahhüdü vermez.
                Gerçek sınav puanları ve sıralamaları, o yıl sınava giren tüm adayların genel başarı
                düzeyine göre ÖSYM tarafından belirlenir.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                3. Kullanıcı Yükümlülükleri
              </h2>
              <p>
                Kullanıcılar hesap güvenliğini sağlamakla, sisteme doğru bilgi girmekle ve sistemi
                tersine mühendislik, otomatik veri kazıma (scraping) veya API kötüye kullanımı gibi
                faaliyetlere maruz bırakmamakla yükümlüdür.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                4. Fikri Mülkiyet Hakları
              </h2>
              <p>
                {appConfig.name} markası, tasarımı, arayüz bileşenleri ve yazılım kodları ilgili
                yasalara tabidir. İzinsiz kopyalanamaz veya çoğaltılamaz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
