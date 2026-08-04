export type WorkspaceShellMode = 'desktop' | 'tablet' | 'mobile';

export const WORKSPACE_SHELL_BREAKPOINTS = {
  desktopMin: 1025,
  tabletMin: 768,
  tabletMax: 1024,
  mobileMax: 767,
} as const;

export function resolveWorkspaceShellMode(width: number, _height = 0): WorkspaceShellMode {
  if (!Number.isFinite(width) || width <= 0) return 'mobile';
  if (width >= WORKSPACE_SHELL_BREAKPOINTS.desktopMin) return 'desktop';
  if (width >= WORKSPACE_SHELL_BREAKPOINTS.tabletMin) return 'tablet';
  return 'mobile';
}
