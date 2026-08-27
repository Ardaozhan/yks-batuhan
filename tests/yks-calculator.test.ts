import { describe, expect, it } from "vitest";
import {
  calculateNetLeverage,
  calculateProgramMatches,
  calculateYksSimulation,
  estimateMultiYearRank,
  FIELD_PRESETS,
  type YksNetInputs,
} from "@/lib/yks-calculator";

describe("YKS Calculator & Multi-Year ÖSYM Engine", () => {
  const sampleInputs: YksNetInputs = {
    tytTurkce: 35,
    tytSosyal: 15,
    tytMatematik: 32,
    tytFen: 16,
    aytMatematik: 30,
    aytFizik: 11,
    aytKimya: 10,
    aytBiyoloji: 10,
    aytEdebiyat: 0,
    aytTarih1: 0,
    aytCografya1: 0,
    aytTarih2: 0,
    aytCografya2: 0,
    aytFelsefe: 0,
    aytDin: 0,
    aytDil: 0,
    diplomaGrade: 90,
    isBrokenObp: false,
  };

  it("calculates accurate total net sums and raw scores", () => {
    const result = calculateYksSimulation(sampleInputs);

    expect(result.totalTytNet).toBe(98);
    expect(result.totalAytSayNet).toBe(61);
    expect(result.tytPlacementScore).toBeGreaterThan(400);
    expect(result.sayPlacementScore).toBeGreaterThan(450);
    expect(result.obpContribution).toBe(54); // 90 * 5 * 0.12 = 54
  });

  it("handles broken OBP correctly", () => {
    const normal = calculateYksSimulation({ ...sampleInputs, isBrokenObp: false });
    const broken = calculateYksSimulation({ ...sampleInputs, isBrokenObp: true });

    expect(broken.obpContribution).toBe(normal.obpContribution / 2);
    expect(broken.sayPlacementScore).toBeLessThan(normal.sayPlacementScore);
    expect(broken.sayRank).toBeGreaterThan(normal.sayRank); // Lower score = worse rank number
  });

  it("computes multi-year comparison correctly where 2024 is more selective than 2023", () => {
    const rank2024 = estimateMultiYearRank("SAY", 460).year2024;
    const rank2023 = estimateMultiYearRank("SAY", 460).year2023;

    // In 2024 (hard exam), the same score yields a better (smaller number) rank
    expect(rank2024).toBeLessThan(rank2023);
  });

  it("calculates university program matches with valid probabilities", () => {
    const matches = calculateProgramMatches(25000, "SAY");

    expect(matches.length).toBeGreaterThan(0);
    const haccettepeTip = matches.find((m) => m.name.includes("Tıp Fakültesi"));
    expect(haccettepeTip?.status).toBe("risk"); // rank 25k is risky for Hacettepe Tip (rank ~180)

    const endustri = matches.find((m) => m.name.includes("Endüstri Mühendisliği"));
    expect(endustri?.status).toBe("safe"); // rank 25k is safe for Gazi Endüstri (rank ~38k)
  });

  it("calculates AI net leverage ranking benefits properly", () => {
    const leverage = calculateNetLeverage(sampleInputs, "SAY");

    expect(leverage.length).toBeGreaterThan(0);
    expect(leverage[0].rankGain).toBeGreaterThan(0);
  });

  it("contains valid field presets for instant target simulation", () => {
    expect(FIELD_PRESETS.SAY.top5k.aytMatematik).toBe(37);
    expect(FIELD_PRESETS.EA.top5k.aytEdebiyat).toBe(22);
  });
});

