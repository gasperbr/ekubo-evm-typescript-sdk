import { describe, expect, it } from "vitest";
import { CoreSwapped, decodeSwapEvent, floatSqrtRatioToFixed, decodeLegacySwapEvent } from "./decodeSwapEvent";

describe(decodeLegacySwapEvent, () => {
  it("works for example", () => {
    expect(
      decodeLegacySwapEvent(
        "0x9995855c00494d039ab6792f18e368e530dff93112f9571ed354b82e74b3b03938d2d7d26c61897be74024a7170b8052743de8b9000000000000000000b1a2bc2ec50000fffffffffffffffffffffffff86e62730000000000000000000004114007e32b4000a01a8f32a3986eab505efec98825",
      ),
    ).toMatchInlineSnapshot(`
      {
        "delta0": 50000000000000000n,
        "delta1": -126983565n,
        "liquidityAfter": 4472135213867n,
        "locker": "0x9995855c00494d039ab6792f18e368e530dff931",
        "poolId": "0x12f9571ed354b82e74b3b03938d2d7d26c61897be74024a7170b8052743de8b9",
        "sqrtRatioAfter": 12989159145539564760192658383568896n,
        "tickAfter": -20346843,
      }
    `);
  });
  it("works for example 2", () => {
    expect(
      decodeLegacySwapEvent(
        "0x85cdb1e5cf646550e25c4d587ef02bcf5a2b7d277d7ee01726b349da3cf2c5af88a965579f3f241693e4c63b19dcbb02ed3c6ff30000000000000000000000021f3fe7f3fffffffffffffffffffffffde0881f40000000000000000000009fce1f0d7441800000004002f419f7d06ec000000168",
      ),
    ).toMatchInlineSnapshot(`
      {
        "delta0": 9114216435n,
        "delta1": -9117884608n,
        "liquidityAfter": 175707633054785n,
        "locker": "0x85cdb1e5cf646550e25c4d587ef02bcf5a2b7d27",
        "poolId": "0x7d7ee01726b349da3cf2c5af88a965579f3f241693e4c63b19dcbb02ed3c6ff3",
        "sqrtRatioAfter": 340343709157175265534930593900321046528n,
        "tickAfter": 360,
      }
    `);
  });
  it("works for example 3", () => {
    expect(
      decodeLegacySwapEvent(
        "0x85cdb1e5cf646550e25c4d587ef02bcf5a2b7d270e647f6d174aa84c22fddeef0af92262b878ba6f86094e54dbec558c0a53ab79fffffffffffffffffffffffde0c0180d0000000000000000000000021f6ef97d00000000000000000002ce813a757e1c800000004002a97abf1a21af00000144",
      ),
    ).toMatchInlineSnapshot(`
      {
        "delta0": -9114216435n,
        "delta1": 9117301117n,
        "liquidityAfter": 790004380302876n,
        "locker": "0x85cdb1e5cf646550e25c4d587ef02bcf5a2b7d27",
        "poolId": "0x0e647f6d174aa84c22fddeef0af92262b878ba6f86094e54dbec558c0a53ab79",
        "sqrtRatioAfter": 340337655104615029628450329723475591168n,
        "tickAfter": 324,
      }
    `);
  });
});

describe(decodeSwapEvent, () => {
  it("works for example", () => {
    expect(
      decodeSwapEvent(
        "0x11111111111111111111111111111111111111112222222222222222222222222222222222222222222222222222222222222222000000000000000000b1a2bc2ec50000fffffffffffffffffffffffff86e6273000123456789abcdef012345fec988250000000000000000000004114007e32b"
      ),
    ).toMatchInlineSnapshot(`
      {
        "delta0": 50000000000000000n,
        "delta1": -126983565n,
        "liquidityAfter": 4472135213867n,
        "locker": "0x1111111111111111111111111111111111111111",
        "poolId": "0x2222222222222222222222222222222222222222222222222222222222222222",
        "sqrtRatioAfter": 5501955730157245594635540n,
        "tickAfter": -20346843,
      }
    `);
  });
});
