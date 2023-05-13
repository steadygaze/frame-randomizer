import { describe, expect, it } from "vitest";
import { floatIntPartPad, timecodeToSec, checkKeys } from "./utils";

describe("floatIntPartPad", () => {
  it("should pad a float <10", () => {
    expect(floatIntPartPad(1.234)).toEqual("01.234");
  });

  it("shouldn't pad a float >=10", () => {
    expect(floatIntPartPad(12.345)).toEqual("12.345");
  });

  it("should pad a ipart and fpart at the same time", () => {
    expect(floatIntPartPad(1)).toEqual("01.000");
  });

  it("should partially pad out fpart", () => {
    expect(floatIntPartPad(12.1)).toEqual("12.100");
  });

  it("shouldn't pad fpart or add decimal point if fPartPlaces <0", () => {
    expect(floatIntPartPad(12, 2, 0)).toEqual("12");
  });
});

describe("timecodeToSec", () => {
  it("should change undefined to zero", () => {
    expect(timecodeToSec(undefined)).toEqual(0);
  });

  it("should change null to zero", () => {
    expect(timecodeToSec(null)).toEqual(0);
  });

  it("should change null to zero", () => {
    expect(() => timecodeToSec(undefined, true)).toThrow("required");
  });

  it("should return an int unmodified", () => {
    expect(timecodeToSec(12)).toEqual(12);
  });

  it("should return a float unmodified", () => {
    expect(timecodeToSec(12.345)).toEqual(12.345);
  });

  it("should parse a M:SS timecode", () => {
    expect(timecodeToSec("1:23.45")).toEqual(83.45);
  });

  it("should parse a Mm:SSs timecode", () => {
    expect(timecodeToSec("1m23.45s")).toEqual(83.45);
  });

  it("should parse a MM:SS timecode", () => {
    expect(timecodeToSec("12:23.45")).toEqual(743.45);
  });

  it("should parse a MMmSSs timecode", () => {
    expect(timecodeToSec("12m23.45s")).toEqual(743.45);
  });

  it("should parse a H:MM:SS timecode", () => {
    expect(timecodeToSec("1:12:23.45")).toEqual(4343.45);
  });

  it("should parse a H:MM:SS timecode", () => {
    expect(timecodeToSec("1h12m23.45s")).toEqual(4343.45);
  });

  it("should parse a HH:MM:SS timecode", () => {
    expect(timecodeToSec("21:12:23.45")).toEqual(76343.45);
  });

  it("should parse a HH:MM:SS timecode", () => {
    expect(timecodeToSec("21h12m23.45s")).toEqual(76343.45);
  });
});

describe("checkKeys", () => {
  it("should do nothing for empty input", () => {
    expect(checkKeys([], { k1: "str", k2: "str", k3: "str" })).toEqual(
      undefined
    );
  });

  it("should do nothing for empty input and empty object", () => {
    expect(checkKeys([], {})).toEqual(undefined);
  });

  it("should do nothing if all keys are present", () => {
    expect(
      checkKeys(["k1", "k2", "k3"], { k1: "str", k2: "str", k3: "str" })
    ).toEqual(undefined);
  });

  it("should do nothing if all keys are present from a subset", () => {
    expect(checkKeys(["k1"], { k1: "str", k2: "str", k3: "str" })).toEqual(
      undefined
    );
  });

  it("should detect a missing key", () => {
    expect(() => checkKeys(["k1"], { k2: "str", k3: "str" })).toThrow("k1");
  });

  it("should detect an empty key", () => {
    expect(() => checkKeys(["k1"], { k1: "", k2: "str", k3: "str" })).toThrow(
      "k1"
    );
  });

  it("should detect and list multiple missing keys", () => {
    expect(() => checkKeys(["k1", "k2", "k3"], { k3: "str" })).toThrow(
      /k1.*k2/
    );
  });
});
