import { MAX_U256 } from "./constants";
import { amount0Delta, amount1Delta } from "./delta";

/**
 * Computes the maximum amount of liquidity received for a given amount of token0
 * and price range. This is the inverse of amount0Delta.
 *
 * Follows Solidity implementation:
 * L = amount0 * (sqrtRatioLower * sqrtRatioUpper / 2^128) / (sqrtRatioUpper - sqrtRatioLower)
 *
 * @param sqrtRatioA The sqrt price at one end of the range (can be lower or upper)
 * @param sqrtRatioB The sqrt price at the other end of the range (can be lower or upper)
 * @param amount0 The amount of token0 being provided
 * @returns The maximum amount of liquidity for the given amount of token0
 */
export function getLiquidityForAmount0(
  sqrtRatioA: bigint,
  sqrtRatioB: bigint,
  amount0: bigint,
): bigint {
  if (amount0 === 0n || sqrtRatioA === sqrtRatioB) return 0n;

  const [lower, upper] =
    sqrtRatioA < sqrtRatioB
      ? [sqrtRatioA, sqrtRatioB]
      : [sqrtRatioB, sqrtRatioA];

  // First compute: lower * upper / 2^128
  const numerator1 = (lower * upper) >> 128n;

  // Then: amount0 * numerator1 / (upper - lower)
  const liquidity = (amount0 * numerator1) / (upper - lower);

  if (liquidity > MAX_U256) {
    throw new Error("LIQUIDITY_OVERFLOW_U256");
  }

  return liquidity;
}

/**
 * Computes the maximum amount of liquidity received for a given amount of token1
 * and price range. This is the inverse of amount1Delta.
 *
 * Follows Solidity implementation:
 * L = (amount1 * 2^128) / (sqrtRatioUpper - sqrtRatioLower)
 *
 * @param sqrtRatioA The sqrt price at one end of the range (can be lower or upper)
 * @param sqrtRatioB The sqrt price at the other end of the range (can be lower or upper)
 * @param amount1 The amount of token1 being provided
 * @returns The maximum amount of liquidity for the given amount of token1
 */
export function getLiquidityForAmount1(
  sqrtRatioA: bigint,
  sqrtRatioB: bigint,
  amount1: bigint,
): bigint {
  if (amount1 === 0n || sqrtRatioA === sqrtRatioB) return 0n;

  const [lower, upper] =
    sqrtRatioA < sqrtRatioB
      ? [sqrtRatioA, sqrtRatioB]
      : [sqrtRatioB, sqrtRatioA];

  const liquidity = (amount1 << 128n) / (upper - lower);

  if (liquidity > MAX_U256) {
    throw new Error("LIQUIDITY_OVERFLOW_U256");
  }

  return liquidity;
}

/**
 * Computes the maximum amount of liquidity received for given amounts of token0 and token1
 * and the current price. This is the function to use when adding liquidity with both tokens.
 *
 * The liquidity amount is the minimum of the liquidity calculated from amount0 and amount1,
 * depending on where the current price falls within the range.
 *
 * @param sqrtRatioCurrent The current sqrt price of the pool
 * @param sqrtRatioA The sqrt price at one end of the range (can be lower or upper)
 * @param sqrtRatioB The sqrt price at the other end of the range (can be lower or upper)
 * @param amount0 The amount of token0 being provided
 * @param amount1 The amount of token1 being provided
 * @returns The maximum liquidity that can be provided with the given token amounts
 */
export function getLiquidityForAmounts(
  sqrtRatioCurrent: bigint,
  sqrtRatioA: bigint,
  sqrtRatioB: bigint,
  amount0: bigint,
  amount1: bigint,
): bigint {
  const [lower, upper] =
    sqrtRatioA < sqrtRatioB
      ? [sqrtRatioA, sqrtRatioB]
      : [sqrtRatioB, sqrtRatioA];

  if (sqrtRatioCurrent <= lower) {
    // Current price is below the range - only token0 needed
    return getLiquidityForAmount0(lower, upper, amount0);
  } else if (sqrtRatioCurrent < upper) {
    // Current price is within the range - both tokens needed
    const liquidity0 = getLiquidityForAmount0(sqrtRatioCurrent, upper, amount0);
    const liquidity1 = getLiquidityForAmount1(lower, sqrtRatioCurrent, amount1);

    // Return the minimum - this ensures we don't exceed either token amount
    return liquidity0 < liquidity1 ? liquidity0 : liquidity1;
  } else {
    // Current price is above the range - only token1 needed
    return getLiquidityForAmount1(lower, upper, amount1);
  }
}

/**
 * Computes the token0 and token1 amounts for a given amount of liquidity and price range
 * This is a convenience wrapper around the existing amount0Delta and amount1Delta functions
 *
 * @param sqrtRatioCurrent The current sqrt price of the pool
 * @param sqrtRatioA The sqrt price at one end of the range (can be lower or upper)
 * @param sqrtRatioB The sqrt price at the other end of the range (can be lower or upper)
 * @param liquidity The amount of liquidity
 * @param roundUp Whether to round up (true for calculating amounts owed, false for amounts received)
 * @returns An object containing amount0 and amount1
 */
export function getAmountsForLiquidity(
  sqrtRatioCurrent: bigint,
  sqrtRatioA: bigint,
  sqrtRatioB: bigint,
  liquidity: bigint,
  roundUp: boolean = false,
): { amount0: bigint; amount1: bigint } {
  const [lower, upper] =
    sqrtRatioA < sqrtRatioB
      ? [sqrtRatioA, sqrtRatioB]
      : [sqrtRatioB, sqrtRatioA];

  let amount0 = 0n;
  let amount1 = 0n;

  if (sqrtRatioCurrent <= lower) {
    // Current price is below the range - only token0 will be used
    amount0 = amount0Delta(lower, upper, liquidity, roundUp);
  } else if (sqrtRatioCurrent < upper) {
    // Current price is within the range - both tokens will be used
    amount0 = amount0Delta(sqrtRatioCurrent, upper, liquidity, roundUp);
    amount1 = amount1Delta(lower, sqrtRatioCurrent, liquidity, roundUp);
  } else {
    // Current price is above the range - only token1 will be used
    amount1 = amount1Delta(lower, upper, liquidity, roundUp);
  }

  return { amount0, amount1 };
}
