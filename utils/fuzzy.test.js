import { describe, expect, it } from 'vitest'
import { naiveFuzzySearch, naiveFuzzySearchParts } from './fuzzy'

describe('fuzzy search', () => {
  it('should not match empty', () => {
    expect(naiveFuzzySearch('', '')).toHaveLength(0)
  })

  it('should be able to match the whole text', () => {
    expect(naiveFuzzySearch('hello', 'hello')).toEqual([{ start: 0, end: 5 }])
  })

  it('should be able to match a single character', () => {
    expect(naiveFuzzySearch('h', 'h')).toEqual([{ start: 0, end: 1 }])
  })

  it('should be able to match a prefix', () => {
    expect(naiveFuzzySearch('he', 'hello')).toEqual([{ start: 0, end: 2 }])
  })

  it('should be able to match a suffix', () => {
    expect(naiveFuzzySearch('nk', 'think')).toEqual([{ start: 3, end: 5 }])
  })

  it('should be able to match multiple parts', () => {
    expect(
      naiveFuzzySearch('hello', 'thinking, he drops below the low bridge')
    ).toEqual([
      { start: 1, end: 2 },
      { start: 11, end: 12 },
      { start: 21, end: 22 },
      { start: 29, end: 31 },
    ])
  })
})

describe('fuzzy search (parts output)', () => {
  it('should match entire empty pattern', () => {
    expect(naiveFuzzySearchParts('', '')).toEqual({
      matchingCharacterCount: 0,
      parts: [{ part: '', matching: true }],
    })
  })

  it('should be able to match the whole text', () => {
    expect(naiveFuzzySearchParts('hello', 'hello')).toEqual({
      matchingCharacterCount: 5,
      parts: [{ part: 'hello', matching: true }],
    })
  })

  it('should be able to match a single character', () => {
    expect(naiveFuzzySearchParts('h', 'h')).toEqual({
      matchingCharacterCount: 1,
      parts: [{ part: 'h', matching: true }],
    })
  })

  it('should be able to match a prefix', () => {
    expect(naiveFuzzySearchParts('he', 'hello')).toEqual({
      matchingCharacterCount: 2,
      parts: [
        { part: 'he', matching: true },
        { part: 'llo', matching: false },
      ],
    })
  })

  it('should be able to match a suffix', () => {
    expect(naiveFuzzySearchParts('nk', 'think')).toEqual({
      matchingCharacterCount: 2,
      parts: [
        { part: 'thi', matching: false },
        { part: 'nk', matching: true },
      ],
    })
  })

  it('should stop when search text is exhausted', () => {
    expect(naiveFuzzySearchParts('mmm', 'hmmmmmmmm')).toEqual({
      matchingCharacterCount: 3,
      parts: [
        { part: 'h', matching: false },
        { part: 'mmm', matching: true },
        { part: 'mmmmm', matching: false },
      ],
    })
  })

  it('should be able to match multiple parts', () => {
    expect(
      naiveFuzzySearchParts('hello', 'thinking, he drops below the low bridge')
    ).toEqual({
      matchingCharacterCount: 5,
      parts: [
        { part: 't', matching: false },
        { part: 'h', matching: true },
        { part: 'inking, h', matching: false },
        { part: 'e', matching: true },
        { part: ' drops be', matching: false },
        { part: 'l', matching: true },
        { part: 'ow the ', matching: false },
        { part: 'lo', matching: true },
        { part: 'w bridge', matching: false },
      ],
    })
  })
})
