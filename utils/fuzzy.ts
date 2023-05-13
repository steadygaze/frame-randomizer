import Fuse from "fuse.js";

export interface SearchPart {
  part: string;
  matching: boolean;
}

export interface FuseMatch {
  indices: number[][];
  value: string;
  key: string;
}

export function chunkMatchText(match: Fuse.FuseResultMatch): SearchPart[] {
  if (match.indices.length <= 0) {
    throw new Error("No matches");
  }

  const parts = [];
  for (let index = 0; index < match.indices.length; ++index) {
    const [start, end] = match.indices[index];
    if (index === 0) {
      if (start !== 0) {
        // First matched range starts after zero, meaning there is an unmatched
        // range at the beginning of the text.
        parts.push({
          part: match.value?.substring(0, start) || "",
          matching: false,
        });
      } // Else, matched range starts from beginning.
    } else {
      const [, prevEnd] = match.indices[index - 1];
      parts.push({
        part: match.value?.substring(prevEnd + 1, start) || "",
        matching: false,
      });
    }
    parts.push({
      part: match.value?.substring(start, end + 1) || "",
      matching: true,
    });
  }
  const [, lastEnd] = match.indices[match.indices.length - 1];
  if (lastEnd + 1 !== match.value?.length) {
    // Last matched range doesn't end at the end, meaning there is an unmatched
    // range at the end of the text.
    parts.push({
      part: match.value?.substring(lastEnd + 1, match.value?.length) || "",
      matching: false,
    });
  }

  return parts;
}
