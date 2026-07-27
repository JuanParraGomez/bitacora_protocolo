import { describe, expect, it } from 'vitest';
import { REFERENCE_SECTIONS, renderReferenceText } from '../domain/reference-content';

describe('reference content', () => {
  it('renders stable reference sections with accessible headings', async () => {
    expect(REFERENCE_SECTIONS.length).toBeGreaterThan(0);
    expect(REFERENCE_SECTIONS.every(section => section.heading.trim().length > 0 && section.id.match(/^[a-z0-9-]+$/))).toBe(true);
    expect(renderReferenceText()).toContain(REFERENCE_SECTIONS[0]!.heading);
  });

  it('does not expose raw unsafe HTML from content data', async () => {
    expect(renderReferenceText()).not.toContain('<script>');
    expect(renderReferenceText()).not.toContain('<img');
  });
});
