import { describe, expect, it } from 'vitest';

import { LEGACY_PROJECT_ID, repairProjectCollection } from './project.schema';

describe('project collection schema', () => {
  it('defaults an empty collection to legacy project', () => {
    const collection = repairProjectCollection({});
    expect(collection.projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: LEGACY_PROJECT_ID }),
      ]),
    );
    expect(collection.activeProjectId).toBe(LEGACY_PROJECT_ID);
    expect(collection.schemaVersion).toBe(1);
  });

  it('keeps legacy when explicitly requested and normalizes duplicate ids', () => {
    const collection = repairProjectCollection({
      projects: [
        { id: 'p1', name: 'A', description: '', status: 'active', lastActiveTaskId: null, createdAt: 1, updatedAt: 2 },
        { id: 'p1', name: 'B', description: '', status: 'archived', lastActiveTaskId: null, createdAt: 3, updatedAt: 4 },
        { id: 'legacy', name: 'Legacy', description: '', status: 'active', lastActiveTaskId: null, createdAt: 5, updatedAt: 6 },
      ],
      activeProjectId: 'p1',
    }, new Set(['p1']));
    expect(collection.projects.filter((project) => project.id === 'p1')).toHaveLength(1);
    expect(collection.projects.find((project) => project.id === LEGACY_PROJECT_ID)).toBeDefined();
    expect(collection.activeProjectId).toBe('p1');
  });

  it('repairs invalid archive statuses to active and keeps legacy even if absent', () => {
    const collection = repairProjectCollection({ projects: [{ id: 'broken', status: 'gone', name: 'X', description: '', lastActiveTaskId: null, createdAt: 1, updatedAt: 2 }] });
    expect(collection.projects[0].status).toBe('active');
    expect(collection.projects).toContainEqual(expect.objectContaining({ id: LEGACY_PROJECT_ID }));
    expect(collection.activeProjectId).toBe('broken');
  });

  it('repairs invalid recent active task ids to the first active project', () => {
    const collection = repairProjectCollection({
      projects: [
        { id: 'p1', status: 'active', name: 'A', description: '', lastActiveTaskId: 'missing-task', createdAt: 1, updatedAt: 2 },
        { id: 'p2', status: 'active', name: 'B', description: '', lastActiveTaskId: null, createdAt: 1, updatedAt: 2 },
      ],
      activeProjectId: 'missing',
    }, new Set(['t1']));
    const active = collection.projects.find((project) => project.id === 'p1');
    expect(active?.lastActiveTaskId).toBeNull();
    expect(collection.activeProjectId).toBe('p1');
  });

  it('normalizes malformed fields and preserves a usable active project', () => {
    const collection = repairProjectCollection({
      schemaVersion: 'wrong',
      projects: [
        { id: 'p1', name: 0 as unknown as string, description: null as unknown as string, status: 'unknown', lastActiveTaskId: 123 as unknown as string, createdAt: '1' as unknown as number, updatedAt: -1 },
        { id: 'p1', name: 'Duplicado', description: 'Se duplica', status: 'archived', lastActiveTaskId: null, createdAt: 10, updatedAt: 11 },
        { id: 'legacy', name: 'Legacy', description: 'Legacy', status: 'active', lastActiveTaskId: 'missing', createdAt: 12, updatedAt: 13 },
      ],
      activeProjectId: 10 as unknown as string,
    }, new Set(['legacy']));
    const active = collection.projects.find((project) => project.id === collection.activeProjectId);
    expect(collection.projects.filter((project) => project.id === 'p1')).toHaveLength(1);
    expect(collection.schemaVersion).toBe(1);
    expect(active?.status).toBe('active');
    expect(active?.name).toBeTruthy();
    expect(active?.lastActiveTaskId).toBeNull();
  });

  it('keeps legacy as default active project when all projects are archived', () => {
    const collection = repairProjectCollection({
      projects: [
        { id: 'legacy', name: 'Legacy', description: 'archivado', status: 'archived', lastActiveTaskId: null, createdAt: 1, updatedAt: 2 },
      ],
      activeProjectId: 'legacy',
    }, new Set());
    expect(collection.projects.some((project) => project.id === LEGACY_PROJECT_ID)).toBe(true);
    expect(collection.activeProjectId).toBe(collection.projects[0]?.id);
  });
});
