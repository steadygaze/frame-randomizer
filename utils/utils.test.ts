import { describe, expect, it } from "vitest";
import { floatIntPartPad, timerText } from "./utils";

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

describe("timerText", () => {
  it("should work for <1s", () => {
    expect(timerText(101, 1)).toEqual("00:00.1");
    expect(timerText(101, 3)).toEqual("00:00.101");

    expect(timerText(789, 1)).toEqual("00:00.8");
    expect(timerText(789, 3)).toEqual("00:00.789");
  });

  it("should work for <60s", () => {
    expect(timerText(4101, 1)).toEqual("00:04.1");
    expect(timerText(4101, 3)).toEqual("00:04.101");

    expect(timerText(54861, 1)).toEqual("00:54.9");
    expect(timerText(54861, 3)).toEqual("00:54.861");
  });

  it("should work for >60s", () => {
    expect(timerText(98107, 1)).toEqual("01:38.1");
    expect(timerText(98107, 3)).toEqual("01:38.107");

    expect(timerText(98877, 1)).toEqual("01:38.9");
    expect(timerText(98877, 3)).toEqual("01:38.877");
  });

  it("should work for >60m", () => {
    expect(timerText(8198107, 1)).toEqual("2:16:38.1");
    expect(timerText(8198107, 3)).toEqual("2:16:38.107");

    expect(timerText(8198877, 1)).toEqual("2:16:38.9");
    expect(timerText(8198877, 3)).toEqual("2:16:38.877");
  });
});
