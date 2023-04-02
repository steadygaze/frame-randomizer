function naiveFuzzySearch(searchText, text) {
  let searchTextIndex = 0
  let matchStartIndex = 0
  let matchState = false
  const result = []
  for (let index = 0; index < text.length; ++index) {
    if (text.charAt(index) === searchText.charAt(searchTextIndex)) {
      if (!matchState) {
        matchState = true
        matchStartIndex = index
      }
      ++searchTextIndex
    } else if (matchState) {
      matchState = false
      result.push({ start: matchStartIndex, end: index })
    }
  }
  if (matchState) {
    result.push({ start: matchStartIndex, end: text.length })
  }
  return result
}

function naiveFuzzySearchParts(searchText, text) {
  if (!searchText.length) {
    return {
      matchingCharacterCount: text.length,
      parts: [{ part: text, matching: true }],
    }
  }
  if (!text.length) {
    return {
      matchingCharacterCount: 0,
      parts: [{ part: '', matching: false }],
    }
  }

  let searchTextIndex = 0
  let matchStartIndex = 0
  let matchEndIndex = 0
  let matchState = text.charAt(0) === searchText.charAt(0)
  const parts = []
  for (
    let index = 0;
    index < text.length && searchTextIndex <= searchText.length;
    ++index
  ) {
    if (text.charAt(index) === searchText.charAt(searchTextIndex)) {
      if (!matchState) {
        matchState = true
        matchStartIndex = index
        if (index) {
          parts.push({
            part: text.substring(matchEndIndex, index),
            matching: false,
          })
        }
        matchEndIndex = index
      }
      ++searchTextIndex
    } else if (matchState) {
      matchState = false
      matchEndIndex = index
      if (index) {
        parts.push({
          part: text.substring(matchStartIndex, index),
          matching: true,
        })
      }
      matchStartIndex = index
    }
  }

  if (searchTextIndex < searchText.length) {
    return {
      matchingCharacterCount: 0,
      parts: [{ part: text, matching: false }],
    }
  }

  if (matchState) {
    parts.push({
      part: text.substring(matchEndIndex, text.length),
      matching: true,
    })
  } else {
    parts.push({
      part: text.substring(matchStartIndex, text.length),
      matching: false,
    })
  }

  return {
    parts,
    matchingCharacterCount: searchTextIndex,
  }
}

export { naiveFuzzySearch, naiveFuzzySearchParts }
