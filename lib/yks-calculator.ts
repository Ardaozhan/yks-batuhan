// YKS 2025 / 2026 Score & Ranking Calculation Engine
// Based on official ÖSYM standardized score distribution and recent YKS percentiles

export interface YksNetInputs {
  // TYT (120 questions)
  tytTurkce: number; // max 40
  tytSosyal: number; // max 20
  tytMatematik: number; // max 40
  tytFen: number; // max 20

  // AYT Matematik (40 questions)
  aytMatematik: number; // max 40

  // AYT Fen (40 questions)
  aytFizik: number; // max 14
  aytKimya: number; // max 13
  aytBiyoloji: number; // max 13

  // AYT Edebiyat-Sosyal-1 (40 questions)
  aytEdebiyat: number; // max 24
  aytTarih1: number; // max 10
  aytCografya1: number; // max 6

  // AYT Sosyal-2 (40 questions)
  aytTarih2: number; // max 11
  aytCografya2: number; // max 11
  aytFelsefe: number; // max 12
  aytDin: number; // max 6

  // AYT Dil (80 questions)
  aytDil: number; // max 80

  // OBP
  diplomaGrade: number; // 50 - 100
  isBrokenObp: boolean; // Kırık OBP (önceki yıl yerleştiyse * 0.06)
}

export interface MultiYearRank {
  year2024: number; // 2024 (Zor/Seçici Sınav, aynı nete daha iyi sıra)
  year2025: number; // 2025/2026 (Tahmini Dengeli Standart)
  year2023: number; // 2023 (Kolay/Yığılmalı Sınav, aynı nete daha geride sıra)
}

export interface YksSimulationResult {
  // Net Sums
  totalTytNet: number;
  totalAytSayNet: number;
  totalAytEaNet: number;
  totalAytSozNet: number;

  // Raw Scores (Ham Puanlar)
  tytRawScore: number;
  sayRawScore: number;
  eaRawScore: number;
  sozRawScore: number;
  dilRawScore: number;

  // OBP contribution
  obpValue: number;
  obpContribution: number;

  // Placement Scores (Yerleştirme Puanları)
  tytPlacementScore: number;
  sayPlacementScore: number;
  eaPlacementScore: number;
  sozPlacementScore: number;
  dilPlacementScore: number;

  // Estimated 2025/2026 Rankings (Default Tahmini Sıralamalar)
  tytRank: number;
  sayRank: number;
  eaRank: number;
  sozRank: number;
  dilRank: number;

  // Multi-Year ÖSYM Rankings
  multiYearRanks: {
    TYT: MultiYearRank;
    SAY: MultiYearRank;
    EA: MultiYearRank;
    SOZ: MultiYearRank;
    DIL: MultiYearRank;
  };
}

export interface ProgramMatch {
  id: string;
  name: string;
  university: string;
  city: string;
  field: "SAY" | "EA" | "SOZ" | "DIL" | "TYT";
  baseRank2024: number;
  baseRank2023: number;
  probability: number; // 0 - 100
  status: "safe" | "target" | "risk"; // safe (>80%), target (50-80%), risk (<50%)
}

export interface NetLeverageItem {
  testName: string;
  key: keyof YksNetInputs;
  maxQuestions: number;
  currentNet: number;
  rankGain: number; // +1 net ile kaç kişi öne geçilir
}

// 2024 (Zor Yıl), 2025 (Standart), 2023 (Kolay Yıl) Curve Distributions
const CURVES_2025: Record<string, Array<{ score: number; rank: number }>> = {
  SAY: [
    { score: 550, rank: 10 },
    { score: 535, rank: 100 },
    { score: 515, rank: 1000 },
    { score: 495, rank: 3000 },
    { score: 480, rank: 7000 },
    { score: 460, rank: 15000 },
    { score: 440, rank: 25000 },
    { score: 415, rank: 40000 },
    { score: 385, rank: 70000 },
    { score: 350, rank: 110000 },
    { score: 310, rank: 170000 },
    { score: 260, rank: 260000 },
    { score: 210, rank: 420000 },
    { score: 170, rank: 750000 },
    { score: 100, rank: 1500000 },
  ],
  EA: [
    { score: 540, rank: 10 },
    { score: 515, rank: 100 },
    { score: 485, rank: 1000 },
    { score: 460, rank: 3000 },
    { score: 435, rank: 8000 },
    { score: 410, rank: 18000 },
    { score: 385, rank: 35000 },
    { score: 355, rank: 65000 },
    { score: 325, rank: 110000 },
    { score: 290, rank: 180000 },
    { score: 250, rank: 300000 },
    { score: 200, rank: 550000 },
    { score: 100, rank: 1800000 },
  ],
  TYT: [
    { score: 545, rank: 10 },
    { score: 520, rank: 100 },
    { score: 490, rank: 1000 },
    { score: 465, rank: 5000 },
    { score: 440, rank: 15000 },
    { score: 410, rank: 35000 },
    { score: 380, rank: 70000 },
    { score: 345, rank: 140000 },
    { score: 310, rank: 250000 },
    { score: 270, rank: 450000 },
    { score: 230, rank: 750000 },
    { score: 180, rank: 1400000 },
    { score: 100, rank: 2800000 },
  ],
  SOZ: [
    { score: 530, rank: 50 },
    { score: 480, rank: 1000 },
    { score: 440, rank: 5000 },
    { score: 400, rank: 20000 },
    { score: 360, rank: 55000 },
    { score: 320, rank: 120000 },
    { score: 270, rank: 250000 },
    { score: 200, rank: 600000 },
    { score: 100, rank: 1300000 },
  ],
  DIL: [
    { score: 535, rank: 50 },
    { score: 495, rank: 1000 },
    { score: 460, rank: 4000 },
    { score: 420, rank: 10000 },
    { score: 370, rank: 25000 },
    { score: 310, rank: 55000 },
    { score: 240, rank: 100000 },
    { score: 100, rank: 160000 },
  ],
};

// 2024: Zor Sınav — Aynı puan daha iyi derece getirir
const CURVES_2024: Record<string, Array<{ score: number; rank: number }>> = {
  SAY: [
    { score: 550, rank: 5 },
    { score: 530, rank: 60 },
    { score: 505, rank: 650 },
    { score: 480, rank: 2200 },
    { score: 460, rank: 5400 },
    { score: 440, rank: 11000 },
    { score: 415, rank: 19000 },
    { score: 385, rank: 32000 },
    { score: 350, rank: 58000 },
    { score: 310, rank: 98000 },
    { score: 260, rank: 170000 },
    { score: 210, rank: 310000 },
    { score: 170, rank: 620000 },
    { score: 100, rank: 1400000 },
  ],
  EA: [
    { score: 540, rank: 8 },
    { score: 510, rank: 70 },
    { score: 475, rank: 750 },
    { score: 445, rank: 2400 },
    { score: 415, rank: 6500 },
    { score: 385, rank: 14000 },
    { score: 355, rank: 28000 },
    { score: 325, rank: 54000 },
    { score: 295, rank: 92000 },
    { score: 260, rank: 155000 },
    { score: 220, rank: 270000 },
    { score: 100, rank: 1700000 },
  ],
  TYT: [
    { score: 540, rank: 8 },
    { score: 510, rank: 80 },
    { score: 475, rank: 800 },
    { score: 445, rank: 3800 },
    { score: 415, rank: 11500 },
    { score: 385, rank: 26000 },
    { score: 355, rank: 55000 },
    { score: 320, rank: 110000 },
    { score: 285, rank: 205000 },
    { score: 245, rank: 380000 },
    { score: 200, rank: 680000 },
    { score: 100, rank: 2700000 },
  ],
  SOZ: [
    { score: 525, rank: 30 },
    { score: 470, rank: 700 },
    { score: 425, rank: 3800 },
    { score: 380, rank: 14000 },
    { score: 340, rank: 42000 },
    { score: 295, rank: 95000 },
    { score: 245, rank: 210000 },
    { score: 100, rank: 1200000 },
  ],
  DIL: [
    { score: 530, rank: 35 },
    { score: 485, rank: 750 },
    { score: 445, rank: 3100 },
    { score: 400, rank: 7800 },
    { score: 350, rank: 19000 },
    { score: 290, rank: 44000 },
    { score: 220, rank: 85000 },
    { score: 100, rank: 155000 },
  ],
};

// 2023: Kolay Sınav — Yığılma fazla, aynı puan daha geride sıra getirir
const CURVES_2023: Record<string, Array<{ score: number; rank: number }>> = {
  SAY: [
    { score: 550, rank: 25 },
    { score: 540, rank: 220 },
    { score: 520, rank: 1800 },
    { score: 505, rank: 4800 },
    { score: 490, rank: 9500 },
    { score: 470, rank: 19000 },
    { score: 445, rank: 32000 },
    { score: 420, rank: 51000 },
    { score: 390, rank: 86000 },
    { score: 355, rank: 135000 },
    { score: 315, rank: 205000 },
    { score: 265, rank: 310000 },
    { score: 215, rank: 490000 },
    { score: 100, rank: 1600000 },
  ],
  EA: [
    { score: 545, rank: 18 },
    { score: 520, rank: 160 },
    { score: 495, rank: 1500 },
    { score: 470, rank: 4200 },
    { score: 445, rank: 10500 },
    { score: 420, rank: 22500 },
    { score: 395, rank: 43000 },
    { score: 365, rank: 78000 },
    { score: 335, rank: 130000 },
    { score: 300, rank: 210000 },
    { score: 255, rank: 350000 },
    { score: 100, rank: 1900000 },
  ],
  TYT: [
    { score: 550, rank: 18 },
    { score: 525, rank: 170 },
    { score: 498, rank: 1500 },
    { score: 475, rank: 6800 },
    { score: 450, rank: 19000 },
    { score: 420, rank: 44000 },
    { score: 390, rank: 86000 },
    { score: 355, rank: 170000 },
    { score: 320, rank: 295000 },
    { score: 280, rank: 520000 },
    { score: 235, rank: 860000 },
    { score: 100, rank: 2900000 },
  ],
  SOZ: [
    { score: 535, rank: 75 },
    { score: 490, rank: 1400 },
    { score: 450, rank: 6800 },
    { score: 410, rank: 26000 },
    { score: 370, rank: 70000 },
    { score: 330, rank: 145000 },
    { score: 280, rank: 290000 },
    { score: 100, rank: 1400000 },
  ],
  DIL: [
    { score: 540, rank: 70 },
    { score: 505, rank: 1400 },
    { score: 470, rank: 5200 },
    { score: 430, rank: 12500 },
    { score: 380, rank: 31000 },
    { score: 320, rank: 68000 },
    { score: 250, rank: 120000 },
    { score: 100, rank: 170000 },
  ],
};

function interpolateCurve(curve: Array<{ score: number; rank: number }>, score: number): number {
  if (score >= curve[0].score) {
    return Math.max(1, Math.round(curve[0].rank * (curve[0].score / score)));
  }
  const last = curve[curve.length - 1];
  if (score <= last.score) {
    return last.rank;
  }

  for (let i = 0; i < curve.length - 1; i++) {
    const high = curve[i];
    const low = curve[i + 1];
    if (score <= high.score && score >= low.score) {
      const factor = (high.score - score) / (high.score - low.score);
      const logHigh = Math.log(high.rank);
      const logLow = Math.log(low.rank);
      const interpolatedLog = logHigh + factor * (logLow - logHigh);
      return Math.max(1, Math.round(Math.exp(interpolatedLog)));
    }
  }
  return 50000;
}

export function estimateMultiYearRank(field: string, score: number): MultiYearRank {
  const c2025 = CURVES_2025[field] || CURVES_2025.SAY;
  const c2024 = CURVES_2024[field] || CURVES_2024.SAY;
  const c2023 = CURVES_2023[field] || CURVES_2023.SAY;

  return {
    year2024: interpolateCurve(c2024, score),
    year2025: interpolateCurve(c2025, score),
    year2023: interpolateCurve(c2023, score),
  };
}

export function calculateYksSimulation(inputs: YksNetInputs): YksSimulationResult {
  // 1. TYT Netleri
  const tytTurkce = Math.max(0, Math.min(40, inputs.tytTurkce || 0));
  const tytSosyal = Math.max(0, Math.min(20, inputs.tytSosyal || 0));
  const tytMat = Math.max(0, Math.min(40, inputs.tytMatematik || 0));
  const tytFen = Math.max(0, Math.min(20, inputs.tytFen || 0));
  const totalTytNet = +(tytTurkce + tytSosyal + tytMat + tytFen).toFixed(2);

  // TYT Ham Puanı (ÖSYM Taban 100 + Katsayılar)
  const tytBase = 100;
  const tytRawScore = Math.min(
    500,
    +(
      tytBase +
      tytTurkce * 3.3 +
      tytSosyal * 3.4 +
      tytMat * 3.3 +
      tytFen * 3.4
    ).toFixed(3)
  );

  // 2. AYT Netleri
  const aytMat = Math.max(0, Math.min(40, inputs.aytMatematik || 0));
  const aytFiz = Math.max(0, Math.min(14, inputs.aytFizik || 0));
  const aytKim = Math.max(0, Math.min(13, inputs.aytKimya || 0));
  const aytBiy = Math.max(0, Math.min(13, inputs.aytBiyoloji || 0));
  const totalAytSayNet = +(aytMat + aytFiz + aytKim + aytBiy).toFixed(2);

  const aytEdb = Math.max(0, Math.min(24, inputs.aytEdebiyat || 0));
  const aytTar1 = Math.max(0, Math.min(10, inputs.aytTarih1 || 0));
  const aytCog1 = Math.max(0, Math.min(6, inputs.aytCografya1 || 0));
  const totalAytEaNet = +(aytMat + aytEdb + aytTar1 + aytCog1).toFixed(2);

  const aytTar2 = Math.max(0, Math.min(11, inputs.aytTarih2 || 0));
  const aytCog2 = Math.max(0, Math.min(11, inputs.aytCografya2 || 0));
  const aytFel = Math.max(0, Math.min(12, inputs.aytFelsefe || 0));
  const aytDin = Math.max(0, Math.min(6, inputs.aytDin || 0));
  const totalAytSozNet = +(aytEdb + aytTar1 + aytCog1 + aytTar2 + aytCog2 + aytFel + aytDin).toFixed(2);

  const aytDil = Math.max(0, Math.min(80, inputs.aytDil || 0));

  // AYT Ham Puanları (TYT %40 + AYT %60)
  const aytBase = 100;
  const tytContributionToAyt = totalTytNet * 1.32;

  const sayRawScore = Math.min(
    500,
    +(
      aytBase +
      tytContributionToAyt +
      aytMat * 3.0 +
      aytFiz * 2.85 +
      aytKim * 3.07 +
      aytBiy * 3.07
    ).toFixed(3)
  );

  const eaRawScore = Math.min(
    500,
    +(
      aytBase +
      tytContributionToAyt +
      aytMat * 3.0 +
      aytEdb * 3.0 +
      aytTar1 * 2.8 +
      aytCog1 * 3.33
    ).toFixed(3)
  );

  const sozRawScore = Math.min(
    500,
    +(
      aytBase +
      tytContributionToAyt +
      aytEdb * 3.0 +
      aytTar1 * 2.8 +
      aytCog1 * 3.33 +
      aytTar2 * 2.91 +
      aytCog2 * 2.91 +
      aytFel * 3.0 +
      aytDin * 3.0
    ).toFixed(3)
  );

  const dilRawScore = Math.min(
    500,
    +(aytBase + tytContributionToAyt + aytDil * 3.0).toFixed(3)
  );

  // 3. OBP Hesabı
  const diploma = Math.max(50, Math.min(100, inputs.diplomaGrade || 80));
  const obpValue = +(diploma * 5).toFixed(1);
  const obpFactor = inputs.isBrokenObp ? 0.06 : 0.12;
  const obpContribution = +(obpValue * obpFactor).toFixed(3);

  // 4. Yerleştirme Puanları (Ham + OBP)
  const tytPlacementScore = +(tytRawScore + obpContribution).toFixed(3);
  const sayPlacementScore = +(sayRawScore + obpContribution).toFixed(3);
  const eaPlacementScore = +(eaRawScore + obpContribution).toFixed(3);
  const sozPlacementScore = +(sozRawScore + obpContribution).toFixed(3);
  const dilPlacementScore = +(dilRawScore + obpContribution).toFixed(3);

  // 5. Çok Yıllı Sıralama Dağılımı
  const multiYearRanks = {
    TYT: estimateMultiYearRank("TYT", tytPlacementScore),
    SAY: estimateMultiYearRank("SAY", sayPlacementScore),
    EA: estimateMultiYearRank("EA", eaPlacementScore),
    SOZ: estimateMultiYearRank("SOZ", sozPlacementScore),
    DIL: estimateMultiYearRank("DIL", dilPlacementScore),
  };

  return {
    totalTytNet,
    totalAytSayNet,
    totalAytEaNet,
    totalAytSozNet,
    tytRawScore,
    sayRawScore,
    eaRawScore,
    sozRawScore,
    dilRawScore,
    obpValue,
    obpContribution,
    tytPlacementScore,
    sayPlacementScore,
    eaPlacementScore,
    sozPlacementScore,
    dilPlacementScore,
    tytRank: multiYearRanks.TYT.year2025,
    sayRank: multiYearRanks.SAY.year2025,
    eaRank: multiYearRanks.EA.year2025,
    sozRank: multiYearRanks.SOZ.year2025,
    dilRank: multiYearRanks.DIL.year2025,
    multiYearRanks,
  };
}

// Database of Major Popular Programs across Turkey
export const POPULAR_PROGRAMS: Array<{
  id: string;
  name: string;
  university: string;
  city: string;
  field: "SAY" | "EA" | "SOZ" | "DIL" | "TYT";
  baseRank2024: number;
  baseRank2023: number;
}> = [
  // SAY
  { id: "say-1", name: "Tıp Fakültesi", university: "Hacettepe Üniversitesi", city: "Ankara", field: "SAY", baseRank2024: 180, baseRank2023: 190 },
  { id: "say-2", name: "Bilgisayar Mühendisliği", university: "Orta Doğu Teknik Üniversitesi", city: "Ankara", field: "SAY", baseRank2024: 750, baseRank2023: 820 },
  { id: "say-3", name: "Yapay Zeka & Veri Müh.", university: "İstanbul Teknik Üniversitesi", city: "İstanbul", field: "SAY", baseRank2024: 1400, baseRank2023: 1550 },
  { id: "say-4", name: "Tıp Fakültesi (Devlet)", university: "Cerrahpaşa Tıp Fakültesi", city: "İstanbul", field: "SAY", baseRank2024: 2100, baseRank2023: 2300 },
  { id: "say-5", name: "Elektrik-Elektronik Müh.", university: "Yıldız Teknik Üniversitesi", city: "İstanbul", field: "SAY", baseRank2024: 9800, baseRank2023: 11200 },
  { id: "say-6", name: "Diş Hekimliği", university: "Ege Üniversitesi", city: "İzmir", field: "SAY", baseRank2024: 22000, baseRank2023: 24500 },
  { id: "say-7", name: "Endüstri Mühendisliği", university: "Gazi Üniversitesi", city: "Ankara", field: "SAY", baseRank2024: 38000, baseRank2023: 42000 },
  { id: "say-8", name: "Yazılım Mühendisliği", university: "Marmara Üniversitesi", city: "İstanbul", field: "SAY", baseRank2024: 48000, baseRank2023: 54000 },
  { id: "say-9", name: "Makine Mühendisliği", university: "Dokuz Eylül Üniversitesi", city: "İzmir", field: "SAY", baseRank2024: 78000, baseRank2023: 85000 },
  { id: "say-10", name: "Hemşirelik", university: "Ankara Üniversitesi", city: "Ankara", field: "SAY", baseRank2024: 115000, baseRank2023: 125000 },

  // EA
  { id: "ea-1", name: "İktisat (İngilizce)", university: "Boğaziçi Üniversitesi", city: "İstanbul", field: "EA", baseRank2024: 350, baseRank2023: 400 },
  { id: "ea-2", name: "Hukuk Fakültesi", university: "Galatasaray Üniversitesi", city: "İstanbul", field: "EA", baseRank2024: 120, baseRank2023: 140 },
  { id: "ea-3", name: "Hukuk Fakültesi", university: "Ankara Üniversitesi", city: "Ankara", field: "EA", baseRank2024: 3800, baseRank2023: 4200 },
  { id: "ea-4", name: "İşletme (İngilizce)", university: "Orta Doğu Teknik Üniversitesi", city: "Ankara", field: "EA", baseRank2024: 1600, baseRank2023: 1850 },
  { id: "ea-5", name: "Hukuk Fakültesi", university: "İstanbul Üniversitesi", city: "İstanbul", field: "EA", baseRank2024: 5200, baseRank2023: 5900 },
  { id: "ea-6", name: "Yönetim Bilişim Sistemleri", university: "Marmara Üniversitesi", city: "İstanbul", field: "EA", baseRank2024: 14000, baseRank2023: 17500 },
  { id: "ea-7", name: "Psikoloji (İngilizce)", university: "Hacettepe Üniversitesi", city: "Ankara", field: "EA", baseRank2024: 9500, baseRank2023: 11000 },
  { id: "ea-8", name: "Uluslararası İlişkiler", university: "İstanbul Üniversitesi", city: "İstanbul", field: "EA", baseRank2024: 38000, baseRank2023: 45000 },
  { id: "ea-9", name: "Siyaset Bilimi & Kamu Yön.", university: "Ankara Üniversitesi", city: "Ankara", field: "EA", baseRank2024: 52000, baseRank2023: 59000 },

  // SOZ
  { id: "soz-1", name: "Tarih (İngilizce)", university: "Boğaziçi Üniversitesi", city: "İstanbul", field: "SOZ", baseRank2024: 450, baseRank2023: 520 },
  { id: "soz-2", name: "Özel Eğitim Öğretmenliği", university: "Hacettepe Üniversitesi", city: "Ankara", field: "SOZ", baseRank2024: 3200, baseRank2023: 3600 },
  { id: "soz-3", name: "İletişim & Medya", university: "İstanbul Üniversitesi", city: "İstanbul", field: "SOZ", baseRank2024: 18000, baseRank2023: 21000 },
  { id: "soz-4", name: "Türkçe Öğretmenliği", university: "Marmara Üniversitesi", city: "İstanbul", field: "SOZ", baseRank2024: 24000, baseRank2023: 27500 },
  { id: "soz-5", name: "Halkla İlişkiler & Reklam", university: "Ankara Üniversitesi", city: "Ankara", field: "SOZ", baseRank2024: 46000, baseRank2023: 52000 },

  // DIL
  { id: "dil-1", name: "İngiliz Dili ve Edebiyatı", university: "Boğaziçi Üniversitesi", city: "İstanbul", field: "DIL", baseRank2024: 850, baseRank2023: 920 },
  { id: "dil-2", name: "İngilizce Öğretmenliği", university: "Orta Doğu Teknik Üniversitesi", city: "Ankara", field: "DIL", baseRank2024: 2100, baseRank2023: 2400 },
  { id: "dil-3", name: "Mütercim-Tercümanlık", university: "Hacettepe Üniversitesi", city: "Ankara", field: "DIL", baseRank2024: 4500, baseRank2023: 4900 },
  { id: "dil-4", name: "İngilizce Öğretmenliği", university: "Ege Üniversitesi", city: "İzmir", field: "DIL", baseRank2024: 9800, baseRank2023: 11000 },

  // TYT (2 Yıllık Ön Lisans)
  { id: "tyt-1", name: "Bilgisayar Programcılığı", university: "Hacettepe Üniversitesi", city: "Ankara", field: "TYT", baseRank2024: 120000, baseRank2023: 135000 },
  { id: "tyt-2", name: "Anestezi", university: "İstanbul Üniversitesi-Cerrahpaşa", city: "İstanbul", field: "TYT", baseRank2024: 165000, baseRank2023: 180000 },
  { id: "tyt-3", name: "İlk ve Acil Yardım (Paramedik)", university: "Ege Üniversitesi", city: "İzmir", field: "TYT", baseRank2024: 210000, baseRank2023: 235000 },
];

export function calculateProgramMatches(userRank: number, field: string): ProgramMatch[] {
  const filtered = POPULAR_PROGRAMS.filter((p) => p.field === field);
  return filtered.map((prog) => {
    // Probability based on baseRank2024 vs userRank
    const ratio = prog.baseRank2024 / Math.max(1, userRank);
    let probability = 50;

    if (ratio >= 1.4) {
      probability = 95;
    } else if (ratio >= 1.15) {
      probability = Math.min(92, Math.round(80 + (ratio - 1.15) * 60));
    } else if (ratio >= 0.9) {
      probability = Math.round(50 + (ratio - 0.9) * 120);
    } else if (ratio >= 0.7) {
      probability = Math.round(20 + (ratio - 0.7) * 150);
    } else {
      probability = Math.max(5, Math.round(ratio * 25));
    }

    const status: "safe" | "target" | "risk" =
      probability >= 80 ? "safe" : probability >= 50 ? "target" : "risk";

    return {
      ...prog,
      probability,
      status,
    };
  });
}

// Calculate which subject test gives the biggest ranking jump per +1 net
export function calculateNetLeverage(inputs: YksNetInputs, field: "SAY" | "EA" | "SOZ" | "DIL" | "TYT"): NetLeverageItem[] {
  const baseResult = calculateYksSimulation(inputs);
  const getRank = (res: YksSimulationResult) => {
    switch (field) {
      case "SAY": return res.sayRank;
      case "EA": return res.eaRank;
      case "SOZ": return res.sozRank;
      case "DIL": return res.dilRank;
      case "TYT":
      default: return res.tytRank;
    }
  };

  const baseRank = getRank(baseResult);

  const tests: Array<{ testName: string; key: keyof YksNetInputs; maxQuestions: number; activeInField: boolean }> = [
    { testName: "TYT Türkçe", key: "tytTurkce", maxQuestions: 40, activeInField: true },
    { testName: "TYT Matematik", key: "tytMatematik", maxQuestions: 40, activeInField: true },
    { testName: "TYT Fen Bilimleri", key: "tytFen", maxQuestions: 20, activeInField: true },
    { testName: "TYT Sosyal Bilgiler", key: "tytSosyal", maxQuestions: 20, activeInField: true },
    { testName: "AYT Matematik", key: "aytMatematik", maxQuestions: 40, activeInField: field === "SAY" || field === "EA" },
    { testName: "AYT Fizik", key: "aytFizik", maxQuestions: 14, activeInField: field === "SAY" },
    { testName: "AYT Kimya", key: "aytKimya", maxQuestions: 13, activeInField: field === "SAY" },
    { testName: "AYT Biyoloji", key: "aytBiyoloji", maxQuestions: 13, activeInField: field === "SAY" },
    { testName: "AYT Edebiyat", key: "aytEdebiyat", maxQuestions: 24, activeInField: field === "EA" || field === "SOZ" },
    { testName: "AYT Tarih-1", key: "aytTarih1", maxQuestions: 10, activeInField: field === "EA" || field === "SOZ" },
    { testName: "AYT Coğrafya-1", key: "aytCografya1", maxQuestions: 6, activeInField: field === "EA" || field === "SOZ" },
    { testName: "AYT Sosyal-2", key: "aytTarih2", maxQuestions: 11, activeInField: field === "SOZ" },
    { testName: "AYT Yabancı Dil", key: "aytDil", maxQuestions: 80, activeInField: field === "DIL" },
  ];

  const relevant = tests.filter((t) => t.activeInField);

  return relevant.map((t) => {
    const currentVal = Number(inputs[t.key]) || 0;
    if (currentVal >= t.maxQuestions) {
      return {
        testName: t.testName,
        key: t.key,
        maxQuestions: t.maxQuestions,
        currentNet: currentVal,
        rankGain: 0,
      };
    }
    const modifiedInputs = { ...inputs, [t.key]: currentVal + 1 };
    const newResult = calculateYksSimulation(modifiedInputs);
    const newRank = getRank(newResult);
    const rankGain = Math.max(0, baseRank - newRank);

    return {
      testName: t.testName,
      key: t.key,
      maxQuestions: t.maxQuestions,
      currentNet: currentVal,
      rankGain,
    };
  }).sort((a, b) => b.rankGain - a.rankGain);
}

// Preset Targets for Instant Scenario Testing
export const FIELD_PRESETS: Record<string, Record<string, Partial<YksNetInputs>>> = {
  SAY: {
    top5k: { tytTurkce: 36, tytSosyal: 16, tytMatematik: 37, tytFen: 18, aytMatematik: 37, aytFizik: 13, aytKimya: 12, aytBiyoloji: 12, diplomaGrade: 95 },
    top20k: { tytTurkce: 33, tytSosyal: 14, tytMatematik: 32, tytFen: 15, aytMatematik: 31, aytFizik: 10, aytKimya: 10, aytBiyoloji: 10, diplomaGrade: 90 },
    top50k: { tytTurkce: 30, tytSosyal: 13, tytMatematik: 26, tytFen: 12, aytMatematik: 23, aytFizik: 8, aytKimya: 7, aytBiyoloji: 8, diplomaGrade: 85 },
    top100k: { tytTurkce: 26, tytSosyal: 11, tytMatematik: 19, tytFen: 9, aytMatematik: 15, aytFizik: 5, aytKimya: 5, aytBiyoloji: 6, diplomaGrade: 80 },
  },
  EA: {
    top5k: { tytTurkce: 36, tytSosyal: 17, tytMatematik: 35, tytFen: 12, aytMatematik: 35, aytEdebiyat: 22, aytTarih1: 9, aytCografya1: 5, diplomaGrade: 95 },
    top20k: { tytTurkce: 33, tytSosyal: 15, tytMatematik: 28, tytFen: 8, aytMatematik: 27, aytEdebiyat: 19, aytTarih1: 8, aytCografya1: 5, diplomaGrade: 90 },
    top50k: { tytTurkce: 29, tytSosyal: 13, tytMatematik: 21, tytFen: 5, aytMatematik: 19, aytEdebiyat: 16, aytTarih1: 6, aytCografya1: 4, diplomaGrade: 85 },
    top100k: { tytTurkce: 25, tytSosyal: 11, tytMatematik: 14, tytFen: 3, aytMatematik: 12, aytEdebiyat: 13, aytTarih1: 5, aytCografya1: 3, diplomaGrade: 80 },
  },
  SOZ: {
    top5k: { tytTurkce: 37, tytSosyal: 18, tytMatematik: 22, tytFen: 8, aytEdebiyat: 23, aytTarih1: 9, aytCografya1: 6, aytTarih2: 10, aytCografya2: 10, aytFelsefe: 11, aytDin: 6, diplomaGrade: 92 },
    top20k: { tytTurkce: 33, tytSosyal: 15, tytMatematik: 15, tytFen: 4, aytEdebiyat: 20, aytTarih1: 8, aytCografya1: 5, aytTarih2: 8, aytCografya2: 8, aytFelsefe: 9, aytDin: 5, diplomaGrade: 88 },
    top50k: { tytTurkce: 28, tytSosyal: 13, tytMatematik: 9, tytFen: 2, aytEdebiyat: 16, aytTarih1: 6, aytCografya1: 4, aytTarih2: 6, aytCografya2: 6, aytFelsefe: 7, aytDin: 4, diplomaGrade: 82 },
    top100k: { tytTurkce: 23, tytSosyal: 10, tytMatematik: 5, tytFen: 1, aytEdebiyat: 12, aytTarih1: 4, aytCografya1: 3, aytTarih2: 4, aytCografya2: 4, aytFelsefe: 5, aytDin: 3, diplomaGrade: 78 },
  },
  DIL: {
    top5k: { tytTurkce: 36, tytSosyal: 16, tytMatematik: 26, tytFen: 10, aytDil: 76, diplomaGrade: 95 },
    top20k: { tytTurkce: 31, tytSosyal: 13, tytMatematik: 16, tytFen: 5, aytDil: 68, diplomaGrade: 88 },
    top50k: { tytTurkce: 26, tytSosyal: 10, tytMatematik: 9, tytFen: 2, aytDil: 56, diplomaGrade: 82 },
    top100k: { tytTurkce: 20, tytSosyal: 8, tytMatematik: 4, tytFen: 1, aytDil: 42, diplomaGrade: 75 },
  },
  TYT: {
    top5k: { tytTurkce: 37, tytSosyal: 17, tytMatematik: 38, tytFen: 19, diplomaGrade: 95 },
    top20k: { tytTurkce: 34, tytSosyal: 15, tytMatematik: 33, tytFen: 16, diplomaGrade: 90 },
    top50k: { tytTurkce: 30, tytSosyal: 13, tytMatematik: 27, tytFen: 13, diplomaGrade: 85 },
    top100k: { tytTurkce: 26, tytSosyal: 11, tytMatematik: 20, tytFen: 9, diplomaGrade: 80 },
  }
};
