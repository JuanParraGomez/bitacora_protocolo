export type Box = { x: number; y: number; width: number; height: number };
export type NamedBox = { name: string; box: Box };
export type Overlap = { first: string; second: string };
export type PrimaryAction = { visible: boolean; primary: boolean };
export type NamedPair = [string, string];
export type WidthLimit = { maxPixels: number; maxRatio: number };
export type ScrollState = { before: number; after: number };

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

export function assertNoOverlapPairs(regions: NamedBox[], pairs: NamedPair[]): Overlap[] {
  const byName = new Map(regions.map((region) => [region.name, region]));
  return pairs.flatMap(([firstName, secondName]) => {
    const first = byName.get(firstName);
    const second = byName.get(secondName);
    if (!first || !second || !intersects(first.box, second.box)) return [];
    return [{ first: firstName, second: secondName }];
  });
}

export function countPrimaryActions(actions: PrimaryAction[]): number {
  return actions.filter((action) => action.visible && action.primary).length;
}

export function isWithinWidthLimit(box: Pick<Box, 'width'>, containerWidth: number, limit: WidthLimit): boolean {
  return box.width <= limit.maxPixels && box.width <= containerWidth * limit.maxRatio;
}

export function assertContained(inner: Box, outer: Box): boolean {
  return inner.x >= outer.x
    && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;
}

export function hasIndependentScroll(first: ScrollState, second: ScrollState): boolean {
  return (first.before !== first.after) !== (second.before !== second.after);
}

export function fitsViewportWidth(box: Pick<Box, 'x' | 'width'>, viewportWidth: number): boolean {
  return Number.isFinite(viewportWidth)
    && viewportWidth > 0
    && box.x >= 0
    && box.x + box.width <= viewportWidth;
}
