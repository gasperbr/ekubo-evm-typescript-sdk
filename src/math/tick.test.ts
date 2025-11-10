import { describe, expect, it } from "vitest";
import {
  approximateNumberOfTickSpacingsCrossed,
  MAX_SQRT_RATIO,
  MAX_TICK,
  MIN_SQRT_RATIO,
  MIN_TICK,
  sqrtRatioToTick,
  tickToSqrtRatio,
} from "./tick";

describe(tickToSqrtRatio, () => {
  it("min tick", () => {
    expect(tickToSqrtRatio(MIN_TICK)).toEqual(MIN_SQRT_RATIO);
  });
  it("max tick", () => {
    expect(tickToSqrtRatio(MAX_TICK)).toEqual(MAX_SQRT_RATIO);
  });
  it("zero", () => {
    expect(tickToSqrtRatio(0)).toEqual(1n << 128n);
  });

  it("snapshots", () => {
    expect(tickToSqrtRatio(1e6)).toMatchInlineSnapshot(
      `561030636129153856579134353873645338624n`,
    );
    expect(tickToSqrtRatio(1e7)).toMatchInlineSnapshot(
      `50502254805927926084423855178401471004672n`,
    );
    expect(tickToSqrtRatio(-1e6)).toMatchInlineSnapshot(
      `206391740095027370700312310528859963392n`,
    );
    expect(tickToSqrtRatio(-1e7)).toMatchInlineSnapshot(
      `2292810285051363400276741630355046400n`,
    );
  });
});

describe(approximateNumberOfTickSpacingsCrossed, () => {
  it("same price", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(1n << 128n, 1n << 128n, 1),
    ).toEqual(0);
  });
  it("price doubling 1 tick spacing", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(1n << 128n, 1n << 129n, 1),
    ).toMatchInlineSnapshot(`5523`);
  });
  it("price doubling 1000 tick spacing", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(1n << 128n, 1n << 129n, 1000),
    ).toMatchInlineSnapshot(`5`);
  });
  it("max to min", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(MAX_SQRT_RATIO, MIN_SQRT_RATIO, 1),
    ).toMatchInlineSnapshot(`706954`);
  });
  it("min to max", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(MIN_SQRT_RATIO, MAX_SQRT_RATIO, 1),
    ).toMatchInlineSnapshot(`706954`);
  });
  it("min to max 1k tick spacing", () => {
    expect(
      approximateNumberOfTickSpacingsCrossed(
        MIN_SQRT_RATIO,
        MAX_SQRT_RATIO,
        1000,
      ),
    ).toMatchInlineSnapshot(`706`);
  });
});

describe(sqrtRatioToTick, () => {
  describe("roundtrip conversions", () => {
    it("min tick", () => {
      const sqrtRatio = tickToSqrtRatio(MIN_TICK);
      expect(sqrtRatioToTick(sqrtRatio)).toEqual(MIN_TICK);
    });

    it("max tick", () => {
      const sqrtRatio = tickToSqrtRatio(MAX_TICK);
      expect(sqrtRatioToTick(sqrtRatio)).toEqual(MAX_TICK);
    });

    it("tick 0", () => {
      const sqrtRatio = tickToSqrtRatio(0);
      expect(sqrtRatioToTick(sqrtRatio)).toEqual(0);
    });

    it("positive ticks", () => {
      for (const tick of [1, 100, 1000, 10000, 100000, 1000000]) {
        const sqrtRatio = tickToSqrtRatio(tick);
        expect(sqrtRatioToTick(sqrtRatio)).toEqual(tick);
      }
    });

    it("negative ticks", () => {
      for (const tick of [-1, -100, -1000, -10000, -100000, -1000000]) {
        const sqrtRatio = tickToSqrtRatio(tick);
        expect(sqrtRatioToTick(sqrtRatio)).toEqual(tick);
      }
    });
  });

  it("returns closest tick for arbitrary sqrt ratios", () => {
    // Test with MIN_SQRT_RATIO
    expect(sqrtRatioToTick(MIN_SQRT_RATIO)).toEqual(MIN_TICK);

    // Test with MAX_SQRT_RATIO
    expect(sqrtRatioToTick(MAX_SQRT_RATIO)).toEqual(MAX_TICK);

    // Test with 2^128 (tick 0)
    expect(sqrtRatioToTick(1n << 128n)).toEqual(0);
  });

  it("reverses tickToSqrtRatio snapshots", () => {
    // Use the exact sqrt ratios from tickToSqrtRatio snapshots
    expect(sqrtRatioToTick(561030636129153856579134353873645338624n)).toEqual(1e6);
    expect(sqrtRatioToTick(50502254805927926084423855178401471004672n)).toEqual(1e7);
    expect(sqrtRatioToTick(206391740095027370700312310528859963392n)).toEqual(-1e6);
    expect(sqrtRatioToTick(2292810285051363400276741630355046400n)).toEqual(-1e7);
  });
});
