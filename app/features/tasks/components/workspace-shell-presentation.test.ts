import { describe, expect, it } from 'vitest';

import { resolveWorkspaceShellMode } from './workspace-shell-presentation';

describe('workspace shell presentation breakpoints', () => {
  it.each([
    [1440, 900, 'desktop'],
    [1025, 768, 'desktop'],
    [1024, 768, 'tablet'],
    [768, 800, 'tablet'],
    [767, 800, 'mobile'],
    [390, 844, 'mobile'],
  ])('maps %dx%d to %s', (width, height, expected) => {
    expect(resolveWorkspaceShellMode(width, height)).toBe(expected);
  });

  it('falls back to mobile for invalid dimensions', () => {
    expect(resolveWorkspaceShellMode(0, 0)).toBe('mobile');
    expect(resolveWorkspaceShellMode(Number.NaN, 768)).toBe('mobile');
  });
});
