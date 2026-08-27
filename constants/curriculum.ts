/**
 * YKS (TYT & AYT) Resmi MEB / ÖSYM Müfredat Sıralaması, Ön Koşul Haritası ve Ağırlık Bilgisi.
 * Yapay zeka (DeepSeek) koç ve planlayıcısının müfredat sırasını harfiyen bilmesi ve
 * pedagojik sırayı bozmadan rehberlik etmesi için eğitildiği bilgi tabanıdır.
 */

export type CurriculumTopicInfo = {
  order: number;
  name: string;
  prerequisites: string[];
  osymWeight: string; // Yıllık ortalama soru sayısı
  category: "temel" | "orta" | "ileri";
  description: string;
};

export const CURRICULUM_ROADMAP: Record<string, CurriculumTopicInfo[]> = {
  "tyt-matematik": [
    {
      order: 1,
      name: "Temel Kavramlar & Sayı Kümeleri",
      prerequisites: [],
      osymWeight: "2-3 Soru",
      category: "temel",
      description: "Tüm matematiğin temeli. Pozitif/negatif sayılar, tek/çift sayılar, asal sayılar.",
    },
    {
      order: 2,
      name: "Sayı Basamakları",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1-2 Soru",
      category: "temel",
      description: "Basamak çözümleme, basamak değeri hesapları.",
    },
    {
      order: 3,
      name: "Bölme ve Bölünebilme Kuralları",
      prerequisites: ["Sayı Basamakları"],
      osymWeight: "1-2 Soru",
      category: "temel",
      description: "2, 3, 4, 5, 8, 9, 11 ile bölünebilme ve kalan bağıntıları.",
    },
    {
      order: 4,
      name: "Asal Çarpanlar ve EBOB - EKOK",
      prerequisites: ["Bölme ve Bölünebilme Kuralları"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Asal çarpanlara ayırma, periyodik durumlar ve problem uygulamaları.",
    },
    {
      order: 5,
      name: "Rasyonel ve Ondalık Sayılar",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1-2 Soru",
      category: "temel",
      description: "Dört işlem, devirli ondalık sayılar ve sıralama.",
    },
    {
      order: 6,
      name: "Basit Eşitsizlikler",
      prerequisites: ["Rasyonel ve Ondalık Sayılar"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Aralık kavramı, eşitsizlik özellikleri ve taraf tarafa işlemler.",
    },
    {
      order: 7,
      name: "Mutlak Değer",
      prerequisites: ["Basit Eşitsizlikler"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Uzaklık kavramı, mutlak değerli denklemler ve eşitsizlikler.",
    },
    {
      order: 8,
      name: "Üslü İfadeler",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1-2 Soru",
      category: "temel",
      description: "Üs kuralları, üslü denklemler ve bilimsel gösterim.",
    },
    {
      order: 9,
      name: "Köklü İfadeler",
      prerequisites: ["Üslü İfadeler"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Kök dereceleri, eşlenik ve iç içe kökler.",
    },
    {
      order: 10,
      name: "Çarpanlara Ayırma ve Özdeşlikler",
      prerequisites: ["Üslü İfadeler"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Ortak parantez, tam kare, iki kare farkı ve küp açılımları.",
    },
    {
      order: 11,
      name: "Oran ve Orantı",
      prerequisites: ["Rasyonel ve Ondalık Sayılar"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Doğru orantı, ters orantı ve aritmetik/geometrik ortalama.",
    },
    {
      order: 12,
      name: "Birinci Dereceden Denklem Çözme",
      prerequisites: ["Çarpanlara Ayırma ve Özdeşlikler", "Oran ve Orantı"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Bir ve iki bilinmeyenli lineer denklem sistemleri.",
    },
    {
      order: 13,
      name: "Sayı ve Kesir Problemleri",
      prerequisites: ["Birinci Dereceden Denklem Çözme"],
      osymWeight: "5-6 Soru",
      category: "orta",
      description: "TYT'nin en yüksek soru gelen alanı. Denklem kurma becerisi.",
    },
    {
      order: 14,
      name: "Yaş Problemleri",
      prerequisites: ["Sayı ve Kesir Problemleri"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Zaman farkı ve yaş oranları.",
    },
    {
      order: 15,
      name: "Hız ve Hareket Problemleri",
      prerequisites: ["Sayı ve Kesir Problemleri"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Yol = Hız x Zaman, karşılaşma, dairesel pist ve akıntı problemleri.",
    },
    {
      order: 16,
      name: "Yüzde, Kâr-Zarar ve İskonto Problemleri",
      prerequisites: ["Sayı ve Kesir Problemleri", "Oran ve Orantı"],
      osymWeight: "2-3 Soru",
      category: "orta",
      description: "Maliyet, satış fiyatı, enflasyon ve indirim hesapları.",
    },
    {
      order: 17,
      name: "Karışım Problemleri",
      prerequisites: ["Yüzde, Kâr-Zarar ve İskonto Problemleri"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Madde miktarı ve yüzde oranları dengesi.",
    },
    {
      order: 18,
      name: "Grafik ve Tablo Yorumlama",
      prerequisites: ["Yüzde, Kâr-Zarar ve İskonto Problemleri"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Daire, çizgi ve sütun grafiklerinden veri okuma.",
    },
    {
      order: 19,
      name: "Kümeler ve Kartezyen Çarpım",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Kümelerde işlemler, Venn şeması ve kartezyen koordinatlar.",
    },
    {
      order: 20,
      name: "Mantık",
      prerequisites: ["Kümeler ve Kartezyen Çarpım"],
      osymWeight: "1 Soru",
      category: "temel",
      description: "Önermeler, bağlaçlar ve totoloji.",
    },
    {
      order: 21,
      name: "Fonksiyonlar (Tanım, Grafikler, Bileşke)",
      prerequisites: ["Kümeler ve Kartezyen Çarpım", "Birinci Dereceden Denklem Çözme"],
      osymWeight: "2-3 Soru (TYT+AYT Köprüsü)",
      category: "ileri",
      description: "AYT'ye geçişin kilit taşı! Tanım kümesi, grafik okuma, bileşke ve ters fonksiyon.",
    },
    {
      order: 22,
      name: "Polinomlar ve Bölme",
      prerequisites: ["Fonksiyonlar (Tanım, Grafikler, Bileşke)", "Çarpanlara Ayırma ve Özdeşlikler"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Polinom derecesi, kökler ve kalan bulma kuralları.",
    },
    {
      order: 23,
      name: "Sayma, Permütasyon ve Kombinasyon",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Çarpma kuralı, sıralama ve grup seçimi.",
    },
    {
      order: 24,
      name: "Olasılık",
      prerequisites: ["Sayma, Permütasyon ve Kombinasyon"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Basit ve koşullu olasılık, bağımsız olaylar.",
    },
    {
      order: 25,
      name: "İstatistik (Mod, Medyan, Standart Sapma)",
      prerequisites: ["Temel Kavramlar & Sayı Kümeleri"],
      osymWeight: "1 Soru",
      category: "temel",
      description: "Merkezi eğilim ve yayılım ölçüleri.",
    },
  ],

  "ayt-matematik": [
    {
      order: 1,
      name: "Polinomlar ve Çarpanlara Ayırma",
      prerequisites: ["TYT Fonksiyonlar"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "AYT düzeyinde katsayılar toplamı ve kök ilişkileri.",
    },
    {
      order: 2,
      name: "İkinci Dereceden Denklemler ve Karmaşık Sayılar",
      prerequisites: ["Polinomlar ve Çarpanlara Ayırma"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Diskriminant (Delta), kök-katsayı bağıntıları, sanal birim i.",
    },
    {
      order: 3,
      name: "İkinci Dereceden Fonksiyonlar (Parabol)",
      prerequisites: ["İkinci Dereceden Denklemler ve Karmaşık Sayılar"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Tepe noktası T(r,k), simetri ekseni ve teğetlik durumları.",
    },
    {
      order: 4,
      name: "İkinci Dereceden Eşitsizlikler",
      prerequisites: ["İkinci Dereceden Fonksiyonlar (Parabol)"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "İşaret tablosu, köklerin işaretleri ve eşitsizlik sistemleri.",
    },
    {
      order: 5,
      name: "Trigonometri (Birim Çember, Temel Oranlar)",
      prerequisites: ["Geometri Üçgenler", "TYT Fonksiyonlar"],
      osymWeight: "2 Soru",
      category: "orta",
      description: "Birim çember, esas ölçü, sin, cos, tan, cot fonksiyonları ve bölgeler.",
    },
    {
      order: 6,
      name: "Trigonometri (Toplam-Fark, Yarım Açı, Denklemler)",
      prerequisites: ["Trigonometri (Birim Çember, Temel Oranlar)"],
      osymWeight: "2-3 Soru",
      category: "ileri",
      description: "AYT'de her yıl 4-5 soru gelen dev alan! Toplam-fark ve trigonometrik denklemler.",
    },
    {
      order: 7,
      name: "Logaritma ve Üstel Fonksiyon",
      prerequisites: ["TYT Üslü İfadeler", "TYT Fonksiyonlar"],
      osymWeight: "1-2 Soru",
      category: "orta",
      description: "Logaritma taban kuralları, logaritmik denklemler ve basamak hesabı.",
    },
    {
      order: 8,
      name: "Diziler (Aritmetik ve Geometrik Diziler)",
      prerequisites: ["TYT Fonksiyonlar"],
      osymWeight: "1 Soru",
      category: "orta",
      description: "Genel terim, ilk n terim toplamı (Sn) ve ortak fark/çarpan.",
    },
    {
      order: 9,
      name: "Limit ve Süreklilik",
      prerequisites: ["TYT Fonksiyonlar", "İkinci Dereceden Eşitsizlikler"],
      osymWeight: "2 Soru",
      category: "orta",
      description: "Sağdan-soldan limit, 0/0 belirsizliği ve süreklilik koşulu. Türevin anahtarı!",
    },
    {
      order: 10,
      name: "Türev Alma Kuralları",
      prerequisites: ["Limit ve Süreklilik"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Çarpımın ve bölümün türevi, zincir kuralı, bileşke türevi.",
    },
    {
      order: 11,
      name: "Türevin Geometrik Yorumu",
      prerequisites: ["Türev Alma Kuralları"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Teğet ve normal eğimi, türevin grafik üzerindeki fiziksel karşılığı.",
    },
    {
      order: 12,
      name: "Maksimum - Minimum Problemleri ve Grafik Çizimi",
      prerequisites: ["Türevin Geometrik Yorumu"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Yerel ekstremum noktaları, artan-azalan aralıklar ve optimizasyon.",
    },
    {
      order: 13,
      name: "Belirsiz İntegral ve Değişken Değiştirme",
      prerequisites: ["Türev Alma Kuralları"],
      osymWeight: "1-2 Soru",
      category: "ileri",
      description: "Türevin ters işlemi, diferansiyel kavramı ve u dönüşümü.",
    },
    {
      order: 14,
      name: "Belirli İntegral ve Temel Teorem",
      prerequisites: ["Belirsiz İntegral ve Değişken Değiştirme"],
      osymWeight: "1 Soru",
      category: "ileri",
      description: "İntegralin sınırları ve parçalı fonksiyon integrali.",
    },
    {
      order: 15,
      name: "İntegral ile Alan Hesabı",
      prerequisites: ["Belirli İntegral ve Temel Teorem"],
      osymWeight: "2 Soru",
      category: "ileri",
      description: "Eğriler arasında kalan alan, x ve y eksenine göre alan.",
    },
  ],

  "tyt-fizik": [
    { order: 1, name: "Fizik Bilimine Giriş", prerequisites: [], osymWeight: "1 Soru", category: "temel", description: "Fiziksel niceliklerin sınıflandırılması (skaler, vektörel, temel, türetilmiş)." },
    { order: 2, name: "Madde ve Özellikleri", prerequisites: ["Fizik Bilimine Giriş"], osymWeight: "1 Soru", category: "temel", description: "Kütle, hacim, özkütle, adezyon, kohezyon, yüzey gerilimi ve kılcallık." },
    { order: 3, name: "Kuvvet ve Hareket", prerequisites: ["Madde ve Özellikleri"], osymWeight: "1 Soru", category: "orta", description: "Konum, hız, ivme, Newton'ın hareket yasaları ve sürtünme kuvveti." },
    { order: 4, name: "İş, Güç ve Enerji", prerequisites: ["Kuvvet ve Hareket"], osymWeight: "1 Soru", category: "orta", description: "Mekanik iş, kinetik/potansiyel enerji, mekanik enerjinin korunumu ve verim." },
    { order: 5, name: "Isı, Sıcaklık ve Genleşme", prerequisites: ["Madde ve Özellikleri"], osymWeight: "1 Soru", category: "orta", description: "İç enerji, öz ısı, ısı sığası, hal değişimi, ısı iletim yolları ve genleşme." },
    { order: 6, name: "Basınç ve Kaldırma Kuvveti", prerequisites: ["Madde ve Özellikleri"], osymWeight: "1 Soru", category: "orta", description: "Katı, sıvı, gaz basıncı, Pascal prensibi ve Arşimet kaldırma kuvveti." },
    { order: 7, name: "Elektrostatik", prerequisites: ["Madde ve Özellikleri"], osymWeight: "1 Soru", category: "orta", description: "Elektrik yükleri, sürtünme/dokunma/etki ile elektriklenme ve elektroskop." },
    { order: 8, name: "Elektrik Akımı ve Devreler", prerequisites: ["Elektrostatik"], osymWeight: "1 Soru", category: "orta", description: "Ohm yasası, dirençlerin bağlanması, üreteçler, lamba parlaklığı ve elektriksel güç." },
    { order: 9, name: "Manyetizma ve Mıknatıslar", prerequisites: ["Elektrik Akımı ve Devreler"], osymWeight: "1 Soru", category: "orta", description: "Mıknatıslar, manyetik alan çizgileri ve akımın manyetik etkisi." },
    { order: 10, name: "Dalgalar", prerequisites: ["Kuvvet ve Hareket"], osymWeight: "1 Soru", category: "orta", description: "Dalga boyu, periyot, frekans, yay, su, ses ve deprem dalgaları." },
    { order: 11, name: "Optik", prerequisites: ["Dalgalar"], osymWeight: "1-2 Soru", category: "ileri", description: "Aydınlanma, gölge, düzlem/küresel aynalar, kırılma, mercekler ve renk." },
  ],

  "ayt-fizik": [
    { order: 1, name: "Vektörler ve Bağıl Hareket", prerequisites: ["TYT Kuvvet ve Hareket"], osymWeight: "1 Soru", category: "orta", description: "Bileşke vektör ve nehir problemleri." },
    { order: 2, name: "Newton'ın Hareket Yasaları (İleri Seviye)", prerequisites: ["Vektörler ve Bağıl Hareket"], osymWeight: "1 Soru", category: "orta", description: "Eğik düzlem, makaralı sistemler ve sürtünmeli dinamik." },
    { order: 3, name: "Bir ve İki Boyutta Sabit İvmeli Hareket (Atışlar)", prerequisites: ["Newton'ın Hareket Yasaları (İleri Seviye)"], osymWeight: "1 Soru", category: "orta", description: "Serbest düşme, yatay ve eğik atış hareketleri." },
    { order: 4, name: "İş, Güç ve Enerji Dönüşümleri", prerequisites: ["Bir ve İki Boyutta Sabit İvmeli Hareket (Atışlar)"], osymWeight: "1 Soru", category: "orta", description: "Sürtünmeli yüzeylerde enerji kaybı ve yay potansiyel enerjisi." },
    { order: 5, name: "İtme ve Çizgisel Momentum", prerequisites: ["Newton'ın Hareket Yasaları (İleri Seviye)"], osymWeight: "1 Soru", category: "orta", description: "İmpuls, esnek ve esnek olmayan çarpışmalar, momentum korunumu." },
    { order: 6, name: "Tork, Denge ve Kütle Merkezi", prerequisites: ["Vektörler ve Bağıl Hareket"], osymWeight: "1 Soru", category: "orta", description: "Dönme dengesi, paralel kuvvetler ve ağırlık merkezi." },
    { order: 7, name: "Basit Makineler", prerequisites: ["Tork, Denge ve Kütle Merkezi"], osymWeight: "1 Soru", category: "temel", description: "Kaldıraç, makara, palanga, eğik düzlem, vida ve kasnaklar." },
    { order: 8, name: "Elektriksel Kuvvet, Alan ve Potansiyel", prerequisites: ["TYT Elektrostatik"], osymWeight: "1 Soru", category: "orta", description: "Coulomb yasası, elektriksel iş ve potansiyel enerji." },
    { order: 9, name: "Manyetizma ve Elektromanyetik İndüksiyon", prerequisites: ["Elektriksel Kuvvet, Alan ve Potansiyel"], osymWeight: "1-2 Soru", category: "ileri", description: "Manyetik kuvvet, indüksiyon emk'sı, Lenz yasası ve alternatif akım." },
    { order: 10, name: "Transformatörler ve Alternatif Akım", prerequisites: ["Manyetizma ve Elektromanyetik İndüksiyon"], osymWeight: "1 Soru", category: "orta", description: "Empedans, rezonans ve transformatör verimi." },
    { order: 11, name: "Düzgün Çembersel Hareket", prerequisites: ["Bir ve İki Boyutta Sabit İvmeli Hareket (Atışlar)"], osymWeight: "1-2 Soru", category: "orta", description: "Merkezcil ivme, viraj emniyeti, dönerek öteleme ve eylemsizlik momenti." },
    { order: 12, name: "Açısal Momentum ve Kütle Çekim / Kepler Yasaları", prerequisites: ["Düzgün Çembersel Hareket"], osymWeight: "1 Soru", category: "ileri", description: "Açısal momentumun korunumu ve gezegen hareketleri." },
    { order: 13, name: "Basit Harmonik Hareket", prerequisites: ["Düzgün Çembersel Hareket"], osymWeight: "1 Soru", category: "orta", description: "Yaylı ve basit sarkaç periyot bağıntıları." },
    { order: 14, name: "Dalga Mekaniği (Kırınım, Girişim, Doppler)", prerequisites: ["TYT Dalgalar"], osymWeight: "1 Soru", category: "orta", description: "Çift yarıkta girişim, tek yarıkta kırınım ve elektromanyetik dalgalar." },
    { order: 15, name: "Atom Fiziği, Radyoaktivite ve Modern Fizik", prerequisites: ["Dalga Mekaniği (Kırınım, Girişim, Doppler)"], osymWeight: "2 Soru", category: "orta", description: "Bohr atom modeli, fotoelektrik olay, Compton saçılması ve özel görelilik." },
  ],
};

/**
 * DeepSeek AI Promptlarına enjekte edilen katı müfredat sıralaması ve pedagojik eğitim talimatı.
 */
export const CURRICULUM_AI_TRAINING_PROMPT = `
MÜFREDAT SIRALAMASI VE ÖN KOŞUL EĞİTİMİ (MEB & ÖSYM STANDARDI):

Sen YKS müfredatının pedagojik sırasını ve ön koşul kurallarını harfiyen bilen bir yapay zekasın. Öğrenciye tavsiyede bulunurken veya plan oluştururken aşağıdaki kurallara MUTLAKA uymalısın:

1. ÖN KOŞUL KURALI (ASLA ATLAMA YAPILAMAZ):
- Matematik: Öğrenci 'Temel Kavramlar', 'Çarpanlara Ayırma' ve 'Denklemler' konularını bitirmeden doğrudan 'Problemler'e veya 'Fonksiyonlar'a GEÇEMEZ.
- AYT Matematik: Öğrenci TYT 'Fonksiyonlar' konusunu bitirmeden asla 'Polinomlar', 'Parabol' veya 'Limit'e başlayamaz.
- Limit bitmeden TÜREV, Türev bitmeden İNTEGRAL ASLA tavsiye edilemez veya plana konulamaz!
- Fizik: 'Kuvvet ve Hareket' bilinmeden 'İş-Güç-Enerji' veya 'Atışlar' tavsiye edilemez. 'Çembersel Hareket' için 'Dinamik ve İvmeli Hareket' ön koşuldur.
- Kimya: 'Mol Kavramı ve Kimyasal Hesaplamalar' bitmeden 'Kimyasal Tepkimelerde Hız ve Denge' veya 'Sıvı Çözeltiler' çalışılamaz.
- Biyoloji: 'Hücre ve Organeller' bitmeden 'Mitoz/Mayoz' veya 'Kalıtım' çalışılamaz. 'Genden Proteine' ve 'Solunum/Fotosentez' için 'Hücre' temeldir.
- Geometri: 'Üçgende Açılar, Özel Üçgenler ve Benzerlik' bitmeden 'Çokgenler', 'Dörtgenler' veya 'Çember' çalışılamaz.

2. SIRADAKİ MANTIKLI KONUYU BULMA PRENSİBİ:
- Öğrencinin tamamladığı konuları incele.
- Müfredat sırasına göre bir sonraki konunun ön koşulları tamamlanmış mı kontrol et.
- Öğrenciye her zaman müfredat sıralamasındaki "Sıradaki Doğal Adım"ı öner.

3. SORU AĞIRLIĞI (GARANTİ NET) STRATEJİSİ:
- TYT Türkçe'de 'Paragrafta Anlam ve Yapı' her gün asgari 20-25 soru olarak yer almalıdır (Sınavın 28-30 sorusu paragraftır).
- TYT Matematik'te 'Problemler' (Sayı, Kesir, Yaş, Hız, Yüzde) sınavın 12-14 sorusunu oluşturur; temel konular bitince her gün rutin olarak çözülmelidir.
- AYT Matematik'te 'Trigonometri' (4-5 soru), 'Türev' (3-4 soru), 'İntegral' (3-4 soru) en yüksek getirili konulardır.
`;

/**
 * Verilen dersteki öğrencinin müfredat sırasına göre çalışması gereken ilk mantıklı konuyu bulur.
 */
export function getNextCurriculumTopic(
  subjectId: string,
  completedTopicNames: string[]
): { nextTopic: CurriculumTopicInfo | null; remainingCount: number } {
  const sequence = CURRICULUM_ROADMAP[subjectId];
  if (!sequence) return { nextTopic: null, remainingCount: 0 };

  const completedSet = new Set(completedTopicNames.map((n) => n.trim().toLowerCase()));

  const uncompleted = sequence.filter((item) => {
    return !completedSet.has(item.name.trim().toLowerCase());
  });

  if (uncompleted.length === 0) {
    return { nextTopic: null, remainingCount: 0 };
  }

  // İlk uncompleted konuyu al
  const candidate = uncompleted[0];
  return { nextTopic: candidate, remainingCount: uncompleted.length };
}
