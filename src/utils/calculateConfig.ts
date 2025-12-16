const TWO_POW_64 = 2n ** 64n;

export function calculateFeeFromPercentage(percentage: number): bigint {
  return BigInt(Math.floor((percentage / 100) * Number(TWO_POW_64)));
}

const BASE_LN = Math.log(1.000001);

export function calculateTickSpacingFromPercentage(percentage: number): number {
  return Math.round(Math.log(1 + percentage / 100) / BASE_LN);
}

export function toPoolConfig(
  fee: bigint,
  tickSpacing: number,
  extension: `0x${string}`
): `0x${string}` {
  if (fee > TWO_POW_64 - 1n) throw new Error("Invalid fee");

  const result =
    BigInt(tickSpacing) + (fee << 32n) + (BigInt(extension) << 96n);
  return `0x${result.toString(16).padStart(64, "0")}` as `0x${string}`;
}

export function parseConfig(config: `0x${string}`): {
  fee: bigint;
  tickSpacing: number;
  extension: `0x${string}`;
} {
  const n = BigInt(config);
  const tickSpacing = Number(n & 0xffffffffn);
  const fee = (n >> 32n) & (TWO_POW_64 - 1n);
  const extensionBigInt = n >> 96n;
  const extension = `0x${extensionBigInt.toString(16).padStart(40, "0")}` as `0x${string}`;

  return { fee, tickSpacing, extension };
}

/* 

export const BASE = new Decimal(1.000001);

export function percentToSpacing(tickSpacingPercent: number) {
  return Math.round(
    new Decimal(tickSpacingPercent)
      .div(100)
      .add(1)
      .ln()
      .div(BASE.ln())
      .toNumber()
  );
}

*/