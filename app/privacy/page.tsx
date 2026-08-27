import Link from "next/link";
import { ArrowLeft, Shield, Sparkles } from "lucide-react";
import { appConfig } from "@/lib/config";

export const metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni - YKS Odak",
  description: "YKS Odak kullanıcı verilerinin korunması, işlenmesi ve KVKK aydınlatma metni.",
};

export default function PrivacyPage() {
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
              <Shield size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--ink)]">
                Gizlilik Politikası ve KVKK Metni
              </h1>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Son Güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="space-y-6 text-xs text-[var(--muted)] leading-relaxed">
            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                1. Veri Sorumlusu ve Genel Bakış
              </h2>
              <p>
                {appConfig.name} (&quot;Platform&quot;), 6698 sayılı Kişisel Verilerin Korunması
                Kanunu (&quot;KVKK&quot;) uyarınca kullanıcılarının gizliliğine ve kişisel
                verilerinin güvenliğine en üst düzeyde önem vermektedir. Bu metin, platformu
                kullanırken hangi verilerinizin işlendiğini ve haklarınızı açıklar.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                2. Toplanan ve İşlenen Veriler
              </h2>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Hesap Bilgileri:</strong> E-posta adresi, ad/soyad, hedef üniversite ve
                  bölüm tercihleri.
                </li>
                <li>
                  <strong>Çalışma ve Sınav Verileri:</strong> Çözülen deneme netleri, tamamlanan
                  müfredat konuları, günlük görev listesi ve çalışma süreleri.
                </li>
                <li>
                  <strong>Teknik ve Analitik Veriler:</strong> Cihaz türü, tarayıcı bilgisi, yerel
                  tercihler (localStorage) ve oturum çerezleri.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                3. Verilerin İşlenme Amaçları
              </h2>
              <p>
                Toplanan veriler yalnızca kişiselleştirilmiş YKS çalışma planı sunmak, deneme net
                istatistiklerini grafiklendirmek, yapay zeka koçluk önerileri üretmek ve sistem
                performansını korumak amacıyla işlenir. Verileriniz hiçbir koşulda üçüncü taraf
                reklam şirketlerine satılmaz veya devredilmez.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                4. Veri Güvenliği ve Saklama
              </h2>
              <p>
                Verileriniz endüstri standardı şifreleme yöntemleriyle (TLS/SSL ve Supabase güvenli
                veri tabanı mimarisi) korunmaktadır. Dilediğiniz zaman ayarlar sayfasından verilerinizi
                JSON formatında indirebilir veya hesabınızı tüm verileriyle birlikte silebilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="font-display text-sm font-bold text-[var(--ink)] mb-2">
                5. KVKK Kapsamındaki Haklarınız
              </h2>
              <p>
                KVKK&apos;nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme,
                işlenmişse buna ilişkin bilgi talep etme, verilerinizin silinmesini veya düzeltilmesini
                isteme haklarına sahipsiniz. İletişim için platform içi geri bildirim panelini
                kullanabilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
