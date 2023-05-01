import { describe, expect, it } from "vitest";
import { generateSkipRanges } from "./file";

describe("generateSkipRanges", () => {
  it("should convert episode skip ranges", () => {
    expect(
      generateSkipRanges(
        0,
        { skipRanges: [{ start: "1:01", end: "1:08" }] },
        undefined
      )
    ).toEqual([{ start: 61, length: 7 }]);
  });

  it("should sort episode skip ranges", () => {
    expect(
      generateSkipRanges(
        0,
        {
          skipRanges: [
            { start: "0:50", length: 10 },
            { start: "0:10", length: 9 },
          ],
        },
        undefined
      )
    ).toEqual([
      { start: 10, length: 9 },
      { start: 50, length: 10 },
    ]);
  });

  it("should convert common skip ranges", () => {
    expect(
      generateSkipRanges(0, undefined, {
        skipRanges: [{ start: "1:01", end: "1:08" }],
      })
    ).toEqual([{ start: 61, length: 7 }]);
  });

  it("should complain on invalid skip ranges", () => {
    expect(() =>
      generateSkipRanges(0, { skipRanges: [{ start: "0:01" }] }, undefined)
    ).toThrowError("required");
  });

  it("should generate skip range for intro", () => {
    expect(
      generateSkipRanges(0, { openingIntro: { end: "0:08" } }, undefined)
    ).toEqual([{ start: 0, length: 8 }]);
  });

  it("should generate skip range for cold open", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introEnd: "0:28" } },
        undefined
      )
    ).toEqual([{ start: 8, length: 20 }]);
  });

  it("should fill in cold open intro length from common timings", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:07" } },
        { coldOpen: { introLength: "0:55" } }
      )
    ).toEqual([{ start: 7, length: 55 }]);
  });

  it("should prefer episode data when generating skip range for cold open", () => {
    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introEnd: "0:28" } },
        { coldOpen: { introLength: "0:17" } }
      )
    ).toEqual([{ start: 8, length: 20 }]);

    expect(
      generateSkipRanges(
        0,
        { coldOpen: { introStart: "0:08", introLength: "0:17" } },
        { coldOpen: { introEnd: "0:28" } }
      )
    ).toEqual([{ start: 8, length: 17 }]);
  });

  it("should generate skip range for credits", () => {
    expect(
      generateSkipRanges(130, undefined, { endCredits: { start: "1:58" } })
    ).toEqual([{ start: 118, length: 12 }]);
  });

  it("should generate multiple skip ranges for everything", () => {
    expect(
      generateSkipRanges(
        130,
        {
          coldOpen: { introStart: "0:08", introEnd: "0:28" },
          endCredits: { start: "1:58" },
        },
        undefined
      )
    ).toEqual([
      { start: 8, length: 20 },
      { start: 118, length: 12 },
    ]);
  });
});
