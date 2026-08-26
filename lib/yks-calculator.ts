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

  // Estimated 2025/2026 Rankings (Tahmini Sıralamalar)
  tytRank: number;
  sayRank: number;
  eaRank: number;
  sozRank: number;
  dilRank: number;
}

// 2024 / 2025 Approximate ÖSYM Score-to-Rank Curves (Score -> Rank)
const RANKING_CURVES: Record<string, Array<{ score: number; rank: number }>> = {
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

function estimateRankFromScore(type: string, score: number): number {
  const curve = RANKING_CURVES[type] || RANKING_CURVES.SAY;
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
  const obpValue = diploma * 5; // 250 - 500
  const obpFactor = inputs.isBrokenObp ? 0.06 : 0.12;
  const obpContribution = +(obpValue * obpFactor).toFixed(3);

  // 4. Yerleştirme Puanları
  const tytPlacementScore = +(tytRawScore + obpContribution).toFixed(3);
  const sayPlacementScore = +(sayRawScore + obpContribution).toFixed(3);
  const eaPlacementScore = +(eaRawScore + obpContribution).toFixed(3);
  const sozPlacementScore = +(sozRawScore + obpContribution).toFixed(3);
  const dilPlacementScore = +(dilRawScore + obpContribution).toFixed(3);

  // 5. Sıralama Tahminleri
  const tytRank = estimateRankFromScore("TYT", tytPlacementScore);
  const sayRank = estimateRankFromScore("SAY", sayPlacementScore);
  const eaRank = estimateRankFromScore("EA", eaPlacementScore);
  const sozRank = estimateRankFromScore("SOZ", sozPlacementScore);
  const dilRank = estimateRankFromScore("DIL", dilPlacementScore);

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
    tytRank,
    sayRank,
    eaRank,
    sozRank,
    dilRank,
  };
}
