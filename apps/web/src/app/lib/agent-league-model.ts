export const SEASON_SCORE_MAX = 100_000;
export const BENEFIT_THRESHOLDS = [15_000, 50_000, 75_000, 90_000] as const;

export type ScoreItem = {
  key: "verifiedActivity" | "verifiedUsage" | "consistency" | "diversity" | "reach" | "retention";
  value: number;
  max: number;
  tone: "blue" | "paper" | "coral";
};

export const USER_SCORES: ScoreItem[] = [
  { key: "verifiedActivity", value: 36_950, max: 50_000, tone: "blue" },
  { key: "consistency", value: 15_470, max: 25_000, tone: "paper" },
  { key: "diversity", value: 16_000, max: 25_000, tone: "coral" },
];

export const PROVIDER_SCORES: ScoreItem[] = [
  { key: "verifiedUsage", value: 31_200, max: 40_000, tone: "blue" },
  { key: "reach", value: 22_500, max: 30_000, tone: "paper" },
  { key: "retention", value: 15_200, max: 20_000, tone: "coral" },
  { key: "consistency", value: 7_600, max: 10_000, tone: "paper" },
];

export function calculateSeasonScore(items: ScoreItem[]) {
  return Math.min(SEASON_SCORE_MAX, items.reduce((sum, item) => sum + item.value, 0));
}

export function validateScoreModel(items: ScoreItem[]) {
  const componentMax = items.reduce((sum, item) => sum + item.max, 0);
  const valuesWithinBounds = items.every((item) => item.value >= 0 && item.value <= item.max);
  return componentMax === SEASON_SCORE_MAX && valuesWithinBounds;
}
