import { describe, expect, it } from "vitest";
import { chunkMatchText } from "./fuzzy";

describe("chunkMatchText (match text chunker)", () => {
  it("should chunk a match at the start of the text", () => {
    expect(
      chunkMatchText({
        indices: [[0, 2]],
        value: "Old Man's War",
        key: "title",
      })
    ).toEqual([
      { part: "Old", matching: true },
      { part: " Man's War", matching: false },
    ]);
  });

  it("should chunk a match at the end of the text", () => {
    expect(
      chunkMatchText({
        indices: [[10, 12]],
        value: "Old Man's War",
        key: "title",
      })
    ).toEqual([
      { part: "Old Man's ", matching: false },
      { part: "War", matching: true },
    ]);
  });

  it("should chunk multiple matches in the middle of the text", () => {
    expect(
      chunkMatchText({
        indices: [
          [4, 4],
          [13, 14],
        ],
        value: "The DaVinci Code",
        key: "title",
      })
    ).toEqual([
      { part: "The ", matching: false },
      { part: "D", matching: true },
      { part: "aVinci C", matching: false },
      { part: "od", matching: true },
      { part: "e", matching: false },
    ]);
  });

  it("should chunk matches at both start and end of the text", () => {
    expect(
      chunkMatchText({
        indices: [
          [0, 4],
          [14, 15],
        ],
        value: "The DaVinci Code",
        key: "title",
      })
    ).toEqual([
      { part: "The D", matching: true },
      { part: "aVinci Co", matching: false },
      { part: "de", matching: true },
    ]);
  });

  it("should chunk matches in start, middle, and end of the text", () => {
    expect(
      chunkMatchText({
        indices: [
          [0, 4],
          [6, 9],
          [14, 15],
        ],
        value: "The DaVinci Code",
        key: "title",
      })
    ).toEqual([
      { part: "The D", matching: true },
      { part: "a", matching: false },
      { part: "Vinc", matching: true },
      { part: "i Co", matching: false },
      { part: "de", matching: true },
    ]);
  });
});
