import { describe, expect, it } from "vitest";
import { floatIntPartPad } from "./utils";

describe("floatIntPartPad", () => {
  it("should pad a float <10", () => {
    expect(floatIntPartPad(1.234), "01.234");
  });

  it("shouldn't pad a float >=10", () => {
    expect(floatIntPartPad(12.345), "12.345");
  });

  it("should pad a ipart and fpart at the same time", () => {
    expect(floatIntPartPad(1), "01.000");
  });

  it("should partially pad out fpart", () => {
    expect(floatIntPartPad(12.1), "12.100");
  });

  it("shouldn't pad fpart or add decimal point if fPartPlaces <0", () => {
    expect(floatIntPartPad(12, 2, 0), "1");
  });
});
