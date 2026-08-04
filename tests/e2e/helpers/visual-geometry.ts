export type Box = { x: number; y: number; width: number; height: number };
export type NamedBox = { name: string; box: Box };
export type Overlap = { first: string; second: string };
export type PrimaryAction = { visible: boolean; primary: boolean };

function intersects(first: Box, second: Box): boolean {
  return first.width > 0 && first.height > 0 && second.width > 0 && second.height > 0
    && first.x < second.x + second.width
    && first.x + first.width > second.x
    && first.y < second.y + second.height
    && first.y + first.height > second.y;
}

export function assertNoOverlap(regions: NamedBox[]): Overlap[] {
  const overlaps: Overlap[] = [];
  for (let index = 0; index < regions.length; index += 1) {
    for (let next = index + 1; next < regions.length; next += 1) {
      if (intersects(regions[index].box, regions[next].box)) {
        overlaps.push({ first: regions[index].name, second: regions[next].name });
      }
    }
  }
  return overlaps;
}

export function countPrimaryActions(actions: PrimaryAction[]): number {
  return actions.filter((action) => action.visible && action.primary).length;
}
