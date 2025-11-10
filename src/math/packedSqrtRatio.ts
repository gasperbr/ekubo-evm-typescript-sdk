/**
 * Ekubo's packed SqrtRatio format - a dynamic fixed point number that stores a shifting 94-bit view
 * of the underlying 64.128 fixed point value, compressed into 96 bits.
 *
 * The most significant 2 bits determine the format:
 * - 11: 64.30 format (shifted right by 98 bits from 64.128)
 * - 10: 32.62 format (shifted right by 66 bits from 64.128)
 * - 01: 0.94 format (shifted right by 34 bits from 64.128)
 * - 00: 0.126 format (shifted right by 2 bits from 64.128, always less than 2^-32)
 */

// Constants for the packed 96-bit format
const TWO_POW_95 = 0x800000000000000000000000n;
const TWO_POW_94 = 0x400000000000000000000000n;
const BIT_MASK = 0xc00000000000000000000000n; // TWO_POW_95 | TWO_POW_94

// Min/max for packed sqrt ratios
export const MIN_SQRT_RATIO_PACKED = 4611797791050542631n;
export const MAX_SQRT_RATIO_PACKED = 79227682466138141934206691491n;

/**
 * Converts a packed 96-bit sqrt ratio to the full 64.128 fixed point representation
 * @param packedSqrtRatio The packed sqrt ratio (96 bits)
 * @returns The 64.128 fixed point representation (up to 192 bits)
 */
export function unpackSqrtRatio(packedSqrtRatio: bigint): bigint {
  // Extract the 2 MSBs to determine shift amount
  const msbits = packedSqrtRatio & BIT_MASK;
  const shiftMultiplier = msbits >> 89n; // Results in 0, 32, 64, or 96
  const shiftAmount = 2n + shiftMultiplier;

  // Extract mantissa (clear the 2 MSBs)
  const mantissa = packedSqrtRatio & ~BIT_MASK;

  // Shift left to reconstruct 64.128
  return mantissa << shiftAmount;
}

/**
 * Converts a 64.128 fixed point value into the compact 96-bit packed sqrt ratio
 * @param sqrtRatio The 64.128 fixed point sqrt ratio
 * @param roundUp Whether to round up during conversion
 * @returns The packed 96-bit sqrt ratio
 * @throws Error if the value overflows the 96-bit container
 */
export function packSqrtRatio(sqrtRatio: bigint, roundUp: boolean): bigint {
  let addend: bigint;

  // Check if < 2**96 (after potential rounding up)
  addend = roundUp ? 0x3n : 0n;
  if (sqrtRatio < 0x1000000000000000000000000n - addend) {
    return (sqrtRatio + addend) >> 2n;
  }

  // Check if < 2**128 (after potential rounding up)
  addend = roundUp ? 0x3fffffffffn : 0n;
  if (sqrtRatio < 0x100000000000000000000000000000000n - addend) {
    return TWO_POW_94 | ((sqrtRatio + addend) >> 34n);
  }

  // Check if < 2**160 (after potential rounding up)
  addend = roundUp ? 0x3fffffffffffffffn : 0n;
  if (sqrtRatio < 0x10000000000000000000000000000000000000000n - addend) {
    return TWO_POW_95 | ((sqrtRatio + addend) >> 66n);
  }

  // Check if < 2**192 (after potential rounding up)
  addend = roundUp ? 0x3fffffffffffffffffffffffn : 0n;
  if (
    sqrtRatio <
    0x1000000000000000000000000000000000000000000000000n - addend
  ) {
    return BIT_MASK | ((sqrtRatio + addend) >> 98n);
  }

  throw new Error("ValueOverflowsSqrtRatioContainer");
}
