import { sqrt } from "./twamm";
import { tickToSqrtRatio, sqrtRatioToTick } from "./tick";

/**
 * Encodes a token ratio (amount1/amount0) into a sqrt ratio in 64.128 fixed point format
 * @param amount0 The denominator (token0 amount)
 * @param amount1 The numerator (token1 amount)
 * @returns The sqrt ratio in 64.128 format
 */
function encodeSqrtRatio(amount0: bigint, amount1: bigint): bigint {
  const numerator = amount1 << 256n;
  const ratioX256 = numerator / amount0;
  const result = sqrt(ratioX256);
  return result;
}

/**
 * Converts a tick to a token amount ratio
 * @param tick The tick to convert
 * @returns An object with amount0 and amount1 where price = amount1/amount0
 */
export function tickToTokenRatio(tick: number): {
  amount0: bigint;
  amount1: bigint;
} {
  const sqrtRatio = tickToSqrtRatio(tick); // 64.128 format
  const ratio256 = sqrtRatio * sqrtRatio; // 128.256 format
  const ratio128 = ratio256 >> 128n; // 128.128 format

  return {
    amount0: 1n << 128n, // 2^128
    amount1: ratio128,
  };
}

/**
 * Returns the highest tick whose price is at or below the given token ratio
 * @param amount0 The denominator amount (token0)
 * @param amount1 The numerator amount (token1)
 * @returns The tick where tickPrice <= price < (tick+1)Price, where price = amount1/amount0
 */
export function tokenRatioToClosestTick(
  amount0: bigint,
  amount1: bigint,
): number {
  const sqrtRatio = encodeSqrtRatio(amount0, amount1);
  let tick = sqrtRatioToTick(sqrtRatio);

  // Check if tick+1 is closer (following Uniswap's approach)
  // But avoid going out of bounds
  const MIN_TICK = -88722835;
  const MAX_TICK = 88722835;
  if (tick >= MIN_TICK && tick < MAX_TICK) {
    const nextTickRatio = tickToTokenRatio(tick + 1);

    // If price >= nextTickPrice, use tick+1
    // price = amount1/amount0
    // nextTickPrice = nextTickRatio.amount1/nextTickRatio.amount0
    // price >= nextTickPrice means: amount1/amount0 >= nextTickRatio.amount1/nextTickRatio.amount0
    // Cross multiply: amount1 * nextTickRatio.amount0 >= amount0 * nextTickRatio.amount1
    if (amount1 * nextTickRatio.amount0 >= amount0 * nextTickRatio.amount1) {
      tick++;
    }
  }

  return tick;
}
