import { describe, expect, it } from "vitest";
import { floatIntPartPad } from "./utils";

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

  it("shouldn't include insignificant digits", () => {
    expect(floatIntPartPad(8.19999999999999, 1, 1)).toEqual("8.2");
  });

  it("should pad an int with ipart = 1 correctly", () => {
    expect(floatIntPartPad(1.0, 1, 3)).toEqual("1.000");
  });
});
