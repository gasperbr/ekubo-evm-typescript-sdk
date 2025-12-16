import { describe, expect, it } from "vitest";
import {
  calculateFeeFromPercentage,
  calculateTickSpacingFromPercentage,
  toPoolConfig,
  parseConfig,
} from "./calculateConfig";

const TWO_POW_64 = 2n ** 64n;

describe(calculateFeeFromPercentage, () => {
  it("returns 0 for 0%", () => {
    expect(calculateFeeFromPercentage(0)).toBe(0n);
  });

  it("returns 2^64 for 100%", () => {
    expect(calculateFeeFromPercentage(100)).toBe(TWO_POW_64);
  });

  it("returns half of 2^64 for 50%", () => {
    expect(calculateFeeFromPercentage(50)).toBe(TWO_POW_64 / 2n);
  });

  it("works for 0.3%", () => {
    expect(calculateFeeFromPercentage(0.3)).toBe(55340232221128656n);
  });

  it("works for 0.02%", () => {
    expect(calculateFeeFromPercentage(0.02)).toBe(3689348814741910n);
  });
});

describe(calculateTickSpacingFromPercentage, () => {
  it("returns 9950 for 1%", () => {
    expect(calculateTickSpacingFromPercentage(1)).toBe(9950);
  });

  it("returns 4988 for 0.5%", () => {
    expect(calculateTickSpacingFromPercentage(0.5)).toBe(4988);
  });
});

describe(toPoolConfig, () => {
  it("encodes config correctly", () => {
    const fee = calculateFeeFromPercentage(0.3);
    const tickSpacing = 60;
    const extension = "0x0000000000000000000000000000000000000000";

    const config = toPoolConfig(fee, tickSpacing, extension);
    expect(config).toMatchInlineSnapshot(
      `"0x000000000000000000000000000000000000000000c49ba5e353f7d00000003c"`
    );
  });

  it("throws for fee > 2^64 - 1", () => {
    expect(() => toPoolConfig(TWO_POW_64, 1, "0x0000000000000000000000000000000000000000")).toThrow(
      "Invalid fee"
    );
  });
});

describe(parseConfig, () => {
  it("roundtrips with toPoolConfig", () => {
    const fee = calculateFeeFromPercentage(0.3);
    const tickSpacing = 60;
    const extension = "0x0000000000000000000000000000000000000000";

    const config = toPoolConfig(fee, tickSpacing, extension);
    const parsed = parseConfig(config);

    expect(parsed.fee).toBe(fee);
    expect(parsed.tickSpacing).toBe(tickSpacing);
    expect(parsed.extension).toBe(extension);
  });
});
