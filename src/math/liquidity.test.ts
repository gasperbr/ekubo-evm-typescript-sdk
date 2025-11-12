import { describe, expect, it } from "vitest";
import {
  getLiquidityForAmount0,
  getLiquidityForAmount1,
  getLiquidityForAmounts,
  getAmountsForLiquidity,
} from "./liquidity";

describe("getLiquidityForAmount0", () => {
  it("Should return expected value #1", () => {
    const sqrtRatioA = 339942424496442021441932674757011200255n;
    const sqrtRatioB = 0x100000000000000000000000000000000n;
    const amount0 = 1000n;

    // Get liquidity from amount0
    const recoveredLiquidity = getLiquidityForAmount0(
      sqrtRatioA,
      sqrtRatioB,
      amount0,
    );

    // Expected from Solidity: 999999
    expect(recoveredLiquidity).toEqual(999999n);
  });

  it("Should return expected value #2", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 34028236692093846346337460743176821145n + (1n << 128n);
    const amount0 = 90909090909090909n;

    // Get liquidity from amount0
    const recoveredLiquidity = getLiquidityForAmount0(
      sqrtRatioA,
      sqrtRatioB,
      amount0,
    );

    // Expected from Solidity: 999999999999999999
    expect(recoveredLiquidity).toEqual(999999999999999999n);
  });

  it("returns 0 for 0 amount", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 34028236692093846346337460743176821145n + (1n << 128n);

    expect(getLiquidityForAmount0(sqrtRatioA, sqrtRatioB, 0n)).toEqual(0n);
  });

  it("returns 0 for equal prices", () => {
    const sqrtRatio = 0x100000000000000000000000000000000n;

    expect(getLiquidityForAmount0(sqrtRatio, sqrtRatio, 100n)).toEqual(0n);
  });

  it("works with reversed price order", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 34028236692093846346337460743176821145n + (1n << 128n);
    const amount0 = 100n;

    const liquidity1 = getLiquidityForAmount0(sqrtRatioA, sqrtRatioB, amount0);
    const liquidity2 = getLiquidityForAmount0(sqrtRatioB, sqrtRatioA, amount0);

    expect(liquidity1).toEqual(liquidity2);
  });
});

describe("getLiquidityForAmount1", () => {
  it("Should return expected value #1", () => {
    const sqrtRatioA = 339942424496442021441932674757011200255n;
    const sqrtRatioB = 0x100000000000000000000000000000000n;
    const amount1 = 999n;

    // Get liquidity from amount1
    const recoveredLiquidity = getLiquidityForAmount1(
      sqrtRatioA,
      sqrtRatioB,
      amount1,
    );

    // Expected from Solidity: 999998
    expect(recoveredLiquidity).toEqual(999998n);
  });

  it("Should return expected value  #2", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 340622989910849312776150758189957120n + (1n << 128n);
    const amount1 = 1001n;

    // Get liquidity from amount1
    const recoveredLiquidity = getLiquidityForAmount1(
      sqrtRatioA,
      sqrtRatioB,
      amount1,
    );

    // Expected from Solidity: 999999
    expect(recoveredLiquidity).toEqual(999999n);
  });

  it("returns 0 for 0 amount", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 309347606291762239512158734028880192232n;

    expect(getLiquidityForAmount1(sqrtRatioA, sqrtRatioB, 0n)).toEqual(0n);
  });

  it("returns 0 for equal prices", () => {
    const sqrtRatio = 0x100000000000000000000000000000000n;

    expect(getLiquidityForAmount1(sqrtRatio, sqrtRatio, 100n)).toEqual(0n);
  });

  it("works with reversed price order", () => {
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 309347606291762239512158734028880192232n;
    const amount1 = 100n;

    const liquidity1 = getLiquidityForAmount1(sqrtRatioA, sqrtRatioB, amount1);
    const liquidity2 = getLiquidityForAmount1(sqrtRatioB, sqrtRatioA, amount1);

    expect(liquidity1).toEqual(liquidity2);
  });
});

describe("getLiquidityForAmounts", () => {
  it("price below range - only uses token0", () => {
    const sqrtRatioCurrent = 0x100000000000000000000000000000000n;
    const sqrtRatioA = 0x200000000000000000000000000000000n;
    const sqrtRatioB = 0x300000000000000000000000000000000n;

    const liquidity = getLiquidityForAmounts(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      1000n,
      1000n,
    );

    // Should only use amount0
    const expectedLiquidity = getLiquidityForAmount0(
      sqrtRatioA,
      sqrtRatioB,
      1000n,
    );
    expect(liquidity).toEqual(expectedLiquidity);
  });

  it("price above range - only uses token1", () => {
    const sqrtRatioCurrent = 0x400000000000000000000000000000000n;
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 0x200000000000000000000000000000000n;

    const liquidity = getLiquidityForAmounts(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      1000n,
      1000n,
    );

    // Should only use amount1
    const expectedLiquidity = getLiquidityForAmount1(
      sqrtRatioA,
      sqrtRatioB,
      1000n,
    );
    expect(liquidity).toEqual(expectedLiquidity);
  });

  it("price inside range - uses minimum of both", () => {
    const sqrtRatioCurrent = 0x200000000000000000000000000000000n;
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 0x300000000000000000000000000000000n;

    const liquidity = getLiquidityForAmounts(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      1000n,
      1000n,
    );

    // Should use both tokens, taking minimum
    const liquidity0 = getLiquidityForAmount0(
      sqrtRatioCurrent,
      sqrtRatioB,
      1000n,
    );
    const liquidity1 = getLiquidityForAmount1(
      sqrtRatioA,
      sqrtRatioCurrent,
      1000n,
    );

    expect(liquidity).toEqual(liquidity0 < liquidity1 ? liquidity0 : liquidity1);
  });
});

describe("getAmountsForLiquidity", () => {
  it("price below range - only returns amount0", () => {
    const sqrtRatioCurrent = 0x100000000000000000000000000000000n;
    const sqrtRatioA = 0x200000000000000000000000000000000n;
    const sqrtRatioB = 0x300000000000000000000000000000000n;
    const liquidity = 1000n;

    const { amount0, amount1 } = getAmountsForLiquidity(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      liquidity,
    );

    expect(amount0).toBeGreaterThan(0n);
    expect(amount1).toEqual(0n);
  });

  it("price above range - only returns amount1", () => {
    const sqrtRatioCurrent = 0x400000000000000000000000000000000n;
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 0x200000000000000000000000000000000n;
    const liquidity = 1000n;

    const { amount0, amount1 } = getAmountsForLiquidity(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      liquidity,
    );

    expect(amount0).toEqual(0n);
    expect(amount1).toBeGreaterThan(0n);
  });

  it("price inside range - returns both amounts", () => {
    const sqrtRatioCurrent = 0x200000000000000000000000000000000n;
    const sqrtRatioA = 0x100000000000000000000000000000000n;
    const sqrtRatioB = 0x300000000000000000000000000000000n;
    const liquidity = 1000n;

    const { amount0, amount1 } = getAmountsForLiquidity(
      sqrtRatioCurrent,
      sqrtRatioA,
      sqrtRatioB,
      liquidity,
    );

    expect(amount0).toBeGreaterThan(0n);
    expect(amount1).toBeGreaterThan(0n);
  });

});

describe("getLiquidityForAmounts - Boundary Cases", () => {
  it("current price at lower bound", () => {
    const sqrtRatioLower = 0x100000000000000000000000000000000n;
    const sqrtRatioUpper = 0x200000000000000000000000000000000n;

    const liquidity = getLiquidityForAmounts(
      sqrtRatioLower,
      sqrtRatioLower,
      sqrtRatioUpper,
      1000000n,
      1000000n,
    );
    expect(liquidity).toEqual(2000000n);
    const amount0Liquidity = getLiquidityForAmount0(sqrtRatioLower, sqrtRatioUpper, 1000000n);
    expect(liquidity).toEqual(amount0Liquidity);
  });
  
  it("current price at upper bound", () => {
    const sqrtRatioLower = 0x100000000000000000000000000000000n;
    const sqrtRatioUpper = 0x200000000000000000000000000000000n;
    
    const liquidity = getLiquidityForAmounts(
      sqrtRatioUpper,
      sqrtRatioLower,
      sqrtRatioUpper,
      1000000n,
      1000000n,
      );
    const amount1Liquidity = getLiquidityForAmount1(sqrtRatioLower, sqrtRatioUpper, 1000000n);
    expect(liquidity).toEqual(amount1Liquidity);
  });
});

describe("getAmountsForLiquidity - Boundary Cases", () => {
  it("current price at boundaries", () => {
    const sqrtRatioLower = 0x100000000000000000000000000000000n;
    const sqrtRatioUpper = 0x200000000000000000000000000000000n;

    const atLower = getAmountsForLiquidity(
      sqrtRatioLower,
      sqrtRatioLower,
      sqrtRatioUpper,
      1000000n,
    );
    expect(atLower.amount0).toEqual(500000n);
    expect(atLower.amount1).toEqual(0n);

    const belowUpper = getAmountsForLiquidity(
      sqrtRatioUpper - 1n,
      sqrtRatioLower,
      sqrtRatioUpper,
      1000000n,
    );
    expect(belowUpper.amount0).toEqual(0n);
    expect(belowUpper.amount1).toEqual(999999n);
  });

});