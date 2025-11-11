import { describe, expect, it } from "vitest";
import {
  tickToTokenRatio,
  tokenRatioToClosestTick,
} from "./priceConversions";
import { MIN_TICK, MAX_TICK } from "./tick";

describe("priceConversions", () => {
  describe("roundtrip conversions", () => {
    it("tick 0", () => {
      const ratio = tickToTokenRatio(0);
      const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
      expect(tick).toEqual(0);
    });

    it("positive ticks", () => {
      for (const originalTick of [1, 100, 1000, 10000, 100000, 1000000]) {
        const ratio = tickToTokenRatio(originalTick);
        const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
        expect(tick).toEqual(originalTick);
      }
    });

    it("negative ticks", () => {
      for (const originalTick of [-1, -100, -1000, -10000, -100000, -1000000]) {
        const ratio = tickToTokenRatio(originalTick);
        const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
        expect(tick).toEqual(originalTick);
      }
    });

    it("MIN_TICK", () => {
      const ratio = tickToTokenRatio(MIN_TICK);
      const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
      // Due to precision loss in the ratio representation, we may be off by a few ticks
      expect(Math.abs(tick - MIN_TICK)).toBeLessThan(100);
    });

    it("MAX_TICK", () => {
      const ratio = tickToTokenRatio(MAX_TICK);
      const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
      // Due to precision loss in the ratio representation, we may be off by a few ticks
      expect(Math.abs(tick - MAX_TICK)).toBeLessThan(100);
    });
  });

  describe("tickToTokenRatio", () => {
    it("tick 0 returns 1:1 ratio", () => {
      const { amount0, amount1 } = tickToTokenRatio(0);
      expect(amount0).toEqual(amount1);
    });

    it("positive tick means token1 is worth more", () => {
      const { amount0, amount1 } = tickToTokenRatio(10000);
      expect(amount1).toBeGreaterThan(amount0);
    });

    it("negative tick means token0 is worth more", () => {
      const { amount0, amount1 } = tickToTokenRatio(-10000);
      expect(amount1).toBeLessThan(amount0);
    });
  });

  describe("tokenRatioToClosestTick", () => {
    it("1:1 ratio returns tick 0", () => {
      const tick = tokenRatioToClosestTick(1n << 128n, 1n << 128n);
      expect(tick).toEqual(0);
    });

    it("2:1 ratio (token1 worth 2x token0)", () => {
      const tick = tokenRatioToClosestTick(1n, 2n);
      expect(tick).toBeGreaterThan(0);
    });

    it("1:2 ratio (token0 worth 2x token1)", () => {
      const tick = tokenRatioToClosestTick(2n, 1n);
      expect(tick).toBeLessThan(0);
    });

    it("handles large ratios", () => {
      // 1000:1 ratio
      const tick = tokenRatioToClosestTick(1n, 1000n);
      expect(tick).toBeGreaterThan(0);
      const ratio = tickToTokenRatio(tick);
      // Verify the ratio is approximately 1000:1
      expect(Number(ratio.amount1) / Number(ratio.amount0)).toBeCloseTo(1000, -1);
    });

    it("returns tick at or below the given price", () => {
      // Test with a ratio between two ticks
      const tick1000 = tickToTokenRatio(1000);
      const tick1001 = tickToTokenRatio(1001);

      // Create a ratio halfway between tick 1000 and 1001
      const midAmount0 = tick1000.amount0 + tick1001.amount0;
      const midAmount1 = tick1000.amount1 + tick1001.amount1;

      const tick = tokenRatioToClosestTick(midAmount0, midAmount1);

      // The returned tick should be 1000 (at or below)
      expect(tick).toEqual(1000);

      // Verify: tickPrice <= inputPrice
      const tickRatio = tickToTokenRatio(tick);
      // inputPrice = midAmount1/midAmount0
      // tickPrice = tickRatio.amount1/tickRatio.amount0
      // tickPrice <= inputPrice means: tickRatio.amount1/tickRatio.amount0 <= midAmount1/midAmount0
      // Cross multiply: tickRatio.amount1 * midAmount0 <= midAmount1 * tickRatio.amount0
      expect(tickRatio.amount1 * midAmount0).toBeLessThanOrEqual(midAmount1 * tickRatio.amount0);
    });

    it("returns tick where inputPrice < (tick+1)Price", () => {
      // Test with a ratio between two ticks
      const tick1000 = tickToTokenRatio(1000);
      const tick1001 = tickToTokenRatio(1001);

      // Create a ratio halfway between tick 1000 and 1001
      const midAmount0 = tick1000.amount0 + tick1001.amount0;
      const midAmount1 = tick1000.amount1 + tick1001.amount1;

      const tick = tokenRatioToClosestTick(midAmount0, midAmount1);

      // Verify: inputPrice < nextTickPrice (unless we're at MAX_TICK)
      if (tick < MAX_TICK) {
        const nextTickRatio = tickToTokenRatio(tick + 1);
        // inputPrice < nextTickPrice means: midAmount1/midAmount0 < nextTickRatio.amount1/nextTickRatio.amount0
        // Cross multiply: midAmount1 * nextTickRatio.amount0 < midAmount1 * nextTickRatio.amount1
        expect(midAmount1 * nextTickRatio.amount0).toBeLessThan(midAmount0 * nextTickRatio.amount1);
      }
    });

    it("exact tick price returns that tick", () => {
      // When the input ratio exactly matches a tick's price, it should return that tick
      for (const targetTick of [100, 500, 1000, 5000]) {
        const ratio = tickToTokenRatio(targetTick);
        const tick = tokenRatioToClosestTick(ratio.amount0, ratio.amount1);
        expect(tick).toEqual(targetTick);
      }
    });
  });
});
