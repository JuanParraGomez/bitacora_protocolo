import { describe, expect, it } from 'vitest';
import { assertNoOverlap, countPrimaryActions, type NamedBox } from './visual-geometry';

const box = (name: string, x: number, y: number, width: number, height: number): NamedBox => ({
  name,
  box: { x, y, width, height },
});

describe('visual geometry invariants', () => {
  it('accepts adjacent boxes without overlap', () => {
    expect(assertNoOverlap([box('nav', 0, 0, 100, 100), box('canvas', 100, 0, 200, 100)])).toEqual([]);
  });

  it('reports overlapping and contained boxes with their names', () => {
    expect(assertNoOverlap([
      box('canvas', 0, 0, 300, 300),
      box('agent', 100, 100, 50, 50),
    ])).toEqual([{ first: 'canvas', second: 'agent' }]);
  });

  it('returns no false positives for zero-area boxes', () => {
    expect(assertNoOverlap([box('empty', 0, 0, 0, 10), box('region', 0, 0, 100, 100)])).toEqual([]);
  });

  it('counts only visible primary actions', () => {
    expect(countPrimaryActions([
      { visible: true, primary: true },
      { visible: true, primary: false },
      { visible: false, primary: true },
    ])).toBe(1);
    expect(countPrimaryActions([{ visible: true, primary: true }, { visible: true, primary: true }])).toBe(2);
    expect(countPrimaryActions([])).toBe(0);
  });
});
