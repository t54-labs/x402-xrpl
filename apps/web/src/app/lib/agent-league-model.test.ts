import { describe, expect, it } from "vitest";
import {
  BENEFIT_THRESHOLDS,
  PROVIDER_SCORES,
  SEASON_SCORE_MAX,
  USER_SCORES,
  calculateSeasonScore,
  validateScoreModel,
} from "./agent-league-model";

describe("Agent League demo score model", () => {
  it("uses a 100,000-point scale for both divisions", () => {
    expect(SEASON_SCORE_MAX).toBe(100_000);
    expect(validateScoreModel(USER_SCORES)).toBe(true);
    expect(validateScoreModel(PROVIDER_SCORES)).toBe(true);
  });

  it("produces the deterministic preview scores", () => {
    expect(calculateSeasonScore(USER_SCORES)).toBe(68_420);
    expect(calculateSeasonScore(PROVIDER_SCORES)).toBe(76_500);
  });

  it("keeps benefit thresholds ordered below the score ceiling", () => {
    expect([...BENEFIT_THRESHOLDS]).toEqual([...BENEFIT_THRESHOLDS].sort((a, b) => a - b));
    expect(BENEFIT_THRESHOLDS.at(-1)).toBeLessThan(SEASON_SCORE_MAX);
  });
});
