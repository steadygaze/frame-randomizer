import Fuse from "fuse.js";

export function naiveFuzzySearch(searchText: string, text: string) {
  let searchTextIndex = 0;
  let matchStartIndex = 0;
  let matchState = false;
  const result = [];
  for (let index = 0; index < text.length; ++index) {
    if (text.charAt(index) === searchText.charAt(searchTextIndex)) {
      if (!matchState) {
        matchState = true;
        matchStartIndex = index;
      }
      ++searchTextIndex;
    } else if (matchState) {
      matchState = false;
      result.push({ start: matchStartIndex, end: index });
    }
  }
  if (matchState) {
    result.push({ start: matchStartIndex, end: text.length });
  }
  return result;
}

export interface SearchPart {
  part: string;
  matching: boolean;
}

export interface FuzzySearchResult {
  matchingCharacterCount: number;
  parts: SearchPart[];
}

export function naiveFuzzySearchParts(
  searchText: string,
  text: string
): FuzzySearchResult {
  if (!searchText.length) {
    return {
      matchingCharacterCount: text.length,
      parts: [{ part: text, matching: true }],
    };
  }
  if (!text.length) {
    return {
      matchingCharacterCount: 0,
      parts: [{ part: "", matching: false }],
    };
  }

  let searchTextIndex = 0;
  let matchStartIndex = 0;
  let matchEndIndex = 0;
  let matchState = text.charAt(0) === searchText.charAt(0);
  const parts = [];
  for (
    let index = 0;
    index < text.length && searchTextIndex <= searchText.length;
    ++index
  ) {
    if (text.charAt(index) === searchText.charAt(searchTextIndex)) {
      if (!matchState) {
        matchState = true;
        matchStartIndex = index;
        if (index) {
          parts.push({
            part: text.substring(matchEndIndex, index),
            matching: false,
          });
        }
        matchEndIndex = index;
      }
      ++searchTextIndex;
    } else if (matchState) {
      matchState = false;
      matchEndIndex = index;
      if (index) {
        parts.push({
          part: text.substring(matchStartIndex, index),
          matching: true,
        });
      }
      matchStartIndex = index;
    }
  }

  if (searchTextIndex < searchText.length) {
    return {
      matchingCharacterCount: 0,
      parts: [{ part: text, matching: false }],
    };
  }

  if (matchState) {
    parts.push({
      part: text.substring(matchEndIndex, text.length),
      matching: true,
    });
  } else {
    parts.push({
      part: text.substring(matchStartIndex, text.length),
      matching: false,
    });
  }

  return {
    parts,
    matchingCharacterCount: searchTextIndex,
  };
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