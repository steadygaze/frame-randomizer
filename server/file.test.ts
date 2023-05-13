import { describe, expect, it } from "vitest";
import { PublicRuntimeConfig, RuntimeConfig } from "nuxt/schema";
import {
  generateSkipRanges,
  imagePathForId,
  offsetTimeBySkipRanges,
} from "./file";

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

describe("offsetTimeBySkipRanges", () => {
  it("should return time unmodified if skip ranges is empty", () => {
    expect(offsetTimeBySkipRanges(100, [])).toEqual(100);
  });

  it("should return time unmodified if skip range is after time", () => {
    expect(offsetTimeBySkipRanges(10, [{ start: 123, length: 18 }])).toEqual(
      10
    );
  });

  it("should offset by one skip range", () => {
    expect(offsetTimeBySkipRanges(10, [{ start: 5, length: 8 }])).toEqual(18);
  });

  it("should offset by multiple skip ranges", () => {
    expect(
      offsetTimeBySkipRanges(100, [
        { start: 5, length: 8 },
        { start: 27, length: 3 },
        { start: 70, length: 6 },
      ])
    ).toEqual(100 + 8 + 3 + 6);
  });

  it("should stop offsetting by later irrelevant skip ranges", () => {
    expect(
      offsetTimeBySkipRanges(30, [
        { start: 5, length: 8 },
        { start: 27, length: 3 },
        { start: 70, length: 6 },
      ])
    ).toEqual(30 + 8 + 3);
  });
});

describe("imagePathForId", () => {
  it("should generate the expected format", () => {
    expect(
      imagePathForId(
        {
          frameOutputDir: "/path/to/output/dir",
          public: { imageOutputExtension: "webp" } as PublicRuntimeConfig,
        } as RuntimeConfig,
        "01234567-89ab-cdef-0123-456789abcdef"
      )
    );
  });
});
