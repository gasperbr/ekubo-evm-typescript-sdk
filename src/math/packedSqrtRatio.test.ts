import { describe, expect, it } from "vitest";
import {
  packSqrtRatio,
  unpackSqrtRatio,
  MIN_SQRT_RATIO_PACKED,
  MAX_SQRT_RATIO_PACKED,
} from "./packedSqrtRatio";

describe("sqrtRatio conversions", () => {
  describe("unpackSqrtRatio", () => {
    it("min sqrt ratio", () => {
      const packed = MIN_SQRT_RATIO_PACKED;
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(18447191164202170524n);
    });

    it("max sqrt ratio", () => {
      const packed = MAX_SQRT_RATIO_PACKED;
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(6276949602062853172742588666607187473671941430179807625216n);
    });

    // 0.126 format (MSB bits: 00)
    it("small value - 0.126 format", () => {
      const packed = 0x100000000000000000000000n; // Example small packed value
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(19807040628566084398385987584n);
    });

    // 0.94 format (MSB bits: 01)
    it("medium value - 0.94 format", () => {
      const packed = 0x500000000000000000000000n; // Example with 01 MSBs
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(85070591730234615865843651857942052864n);
    });

    // 32.62 format (MSB bits: 10)
    it("large value - 32.62 format", () => {
      const packed = 0x900000000000000000000000n; // Example with 10 MSBs
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(365375409332725729550921208179070754913983135744n);
    });

    // 64.30 format (MSB bits: 11)
    it("very large value - 64.30 format", () => {
      const packed = 0xd00000000000000000000000n; // Example with 11 MSBs
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(1569275433846670190958947355801916604025588861116008628224n);
    });

    // Invalid inputs
    it("handles zero packed value", () => {
      const packed = 0n;
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(0n);
    });

    it("handles packed value below MIN_SQRT_RATIO", () => {
      const packed = MIN_SQRT_RATIO_PACKED - 1n;
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(18447191164202170520n);
    });

    it("handles packed value above MAX_SQRT_RATIO", () => {
      const packed = MAX_SQRT_RATIO_PACKED + 1n;
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(6276949602062853172742588666924100123728998780553983426560n);
    });

    it("handles max uint96 value", () => {
      const packed = 0xffffffffffffffffffffffffn; // Max uint96
      const unpacked = unpackSqrtRatio(packed);
      expect(unpacked).toEqual(6277101735386680763835789422890753766045298094089858711552n);
    });
  });

  describe("packSqrtRatio", () => {
    describe("roundUp = false", () => {
      it("very small value -> 0.126 format", () => {
        const unpacked = 0x400000000000000000000000n; // 2^94
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(4951760157141521099596496896n);
      });

      it("small value -> 0.94 format", () => {
        const unpacked = 0x100000000000000000000000000000000n; // 2^128
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(39614081261743854815199363072n);
      });

      it("medium value -> 32.62 format", () => {
        const unpacked = 0x10000000000000000000000000000000000000000n; // 2^160
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(59421121890309939213585350656n);
      });

      it("large value -> 64.30 format", () => {
        const unpacked = 0x800000000000000000000000000000000000000000000000n; // 2^191
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(69324642199981295394350956544n);
      });
    });

    describe("roundUp = true", () => {
      it("value with remainder rounds up", () => {
        const unpacked = 0x400000000000000000000001n; // Needs rounding
        const packed = packSqrtRatio(unpacked, true);
        expect(packed).toEqual(4951760157141521099596496897n);
      });

      it("value without remainder", () => {
        const unpacked = 0x400000000000000000000000n; // No rounding needed
        const packed = packSqrtRatio(unpacked, true);
        expect(packed).toEqual(4951760157141521099596496896n);
      });
    });

    describe("edge cases", () => {
      it("throws on overflow", () => {
        const unpacked = 0x10000000000000000000000000000000000000000000000000n; // Too large
        expect(() => packSqrtRatio(unpacked, false)).toThrow(
          "ValueOverflowsSqrtRatioContainer",
        );
      });

      it("handles zero value", () => {
        const unpacked = 0n;
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(0n);
      });

      // Format transition boundaries
      it("handles value at 2^96 boundary (transition to 0.94 format)", () => {
        const at2pow96 = 0x1000000000000000000000000n; // Exactly 2^96
        const packed = packSqrtRatio(at2pow96, false);
        expect(packed).toEqual(19807040633177770416813375488n);
      });

      it("handles value just below 2^96 boundary", () => {
        const below2pow96 = 0xffffffffffffffffffffffffn; // 2^96 - 1
        const packed = packSqrtRatio(below2pow96, false);
        expect(packed).toEqual(19807040628566084398385987583n);
      });

      it("handles value at 2^128 boundary (transition to 32.62 format)", () => {
        const at2pow128 = 0x100000000000000000000000000000000n; // Exactly 2^128
        const packed = packSqrtRatio(at2pow128, false);
        expect(packed).toEqual(39614081261743854815199363072n);
      });

      it("handles value just below 2^128 boundary", () => {
        const below2pow128 = 0xffffffffffffffffffffffffffffffffn; // 2^128 - 1
        const packed = packSqrtRatio(below2pow128, false);
        expect(packed).toEqual(39614081257132168796771975167n);
      });

      it("handles value at 2^160 boundary (transition to 64.30 format)", () => {
        const at2pow160 = 0x10000000000000000000000000000000000000000n; // Exactly 2^160
        const packed = packSqrtRatio(at2pow160, false);
        expect(packed).toEqual(59421121890309939213585350656n);
      });

      it("handles value just below 2^160 boundary", () => {
        const below2pow160 = 0xffffffffffffffffffffffffffffffffffffffffn; // 2^160 - 1
        const packed = packSqrtRatio(below2pow160, false);
        expect(packed).toEqual(59421121885698253195157962751n);
      });
    });
  });

  describe("roundtrip conversions", () => {
    describe("pack then unpack", () => {
      it("preserves 2^94 exactly (0.126 format)", () => {
        const original = 0x400000000000000000000000n; // 2^94
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(original);
      });

      it("loses precision for 2^94 + 1", () => {
        const original = 0x400000000000000000000001n; // 2^94 + 1
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(19807040628566084398385987584n);
        expect(unpacked).not.toEqual(original); // Should lose precision
      });

      it("preserves 2^128 exactly (0.94 format)", () => {
        const original = 0x100000000000000000000000000000000n; // 2^128
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(original);
      });

      it("loses precision for 2^128 + small value", () => {
        const original = 0x100000000000000000000000000000001n; // 2^128 + 1
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(340282366920938463463374607431768211456n);
        expect(unpacked).not.toEqual(original); // Should lose precision
      });

      it("preserves 2^160 exactly (32.62 format)", () => {
        const original = 0x10000000000000000000000000000000000000000n; // 2^160
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(original);
      });

      it("preserves 2^191 exactly (64.30 format)", () => {
        const original = 0x800000000000000000000000000000000000000000000000n; // 2^191
        const packed = packSqrtRatio(original, false);
        const unpacked = unpackSqrtRatio(packed);
        expect(unpacked).toEqual(original);
      });

      it("roundUp affects unpacked result", () => {
        const original = 0x400000000000000000000001n; // 2^94 + 1
        const packedDown = packSqrtRatio(original, false);
        const packedUp = packSqrtRatio(original, true);
        const unpackedDown = unpackSqrtRatio(packedDown);
        const unpackedUp = unpackSqrtRatio(packedUp);
        expect(unpackedDown).toEqual(19807040628566084398385987584n);
        expect(unpackedUp).toEqual(19807040628566084398385987588n);
        expect(unpackedUp).toBeGreaterThanOrEqual(unpackedDown);
      });
    });

    describe("unpack then pack", () => {
      it("preserves MIN_SQRT_RATIO", () => {
        const original = MIN_SQRT_RATIO_PACKED;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });

      it("preserves MAX_SQRT_RATIO", () => {
        const original = MAX_SQRT_RATIO_PACKED;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });

      it("preserves arbitrary packed value (0.126 format)", () => {
        const original = 0x100000000000000000000000n;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });

      it("preserves arbitrary packed value (0.94 format)", () => {
        const original = 0x500000000000000000000000n;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });

      it("preserves arbitrary packed value (32.62 format)", () => {
        const original = 0x900000000000000000000000n;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });

      it("preserves arbitrary packed value (64.30 format)", () => {
        const original = 0xd00000000000000000000000n;
        const unpacked = unpackSqrtRatio(original);
        const packed = packSqrtRatio(unpacked, false);
        expect(packed).toEqual(original);
      });
    });
  });
});
