import { describe, it, expect } from 'vitest';
import { escapeLikePattern, safeJsonParse } from './utils';

describe('escapeLikePattern', () => {
  it('escapes % character', () => {
    expect(escapeLikePattern('100%')).toBe('100\\%');
  });

  it('escapes _ character', () => {
    expect(escapeLikePattern('some_thing')).toBe('some\\_thing');
  });

  it('escapes backslash character', () => {
    expect(escapeLikePattern('path\\to')).toBe('path\\\\to');
  });

  it('escapes multiple special characters', () => {
    expect(escapeLikePattern('%_\\')).toBe('\\%\\_\\\\');
  });

  it('returns the same string when no special characters', () => {
    expect(escapeLikePattern('hello world')).toBe('hello world');
  });

  it('handles empty string', () => {
    expect(escapeLikePattern('')).toBe('');
  });
});

describe('safeJsonParse', () => {
  it('returns parsed value for valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns parsed array for valid JSON array', () => {
    expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
  });

  it('returns fallback for invalid JSON', () => {
    expect(safeJsonParse('not json', 'default')).toBe('default');
  });

  it('returns fallback for null', () => {
    expect(safeJsonParse(null, [])).toEqual([]);
  });

  it('returns fallback for undefined', () => {
    expect(safeJsonParse(undefined, {})).toEqual({});
  });

  it('returns fallback for empty string', () => {
    expect(safeJsonParse('', 'fallback')).toBe('fallback');
  });
});
