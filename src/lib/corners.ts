import type { Cells } from "../types";

export type CornerNeighbors = {
  tl: boolean;
  tr: boolean;
  br: boolean;
  bl: boolean;
};

export function cellAt(cells: Cells, r: number, c: number): boolean {
  if (r < 0 || c < 0) return false;
  if (r >= cells.length || c >= cells[0].length) return false;
  return cells[r][c];
}

export function neighborsAtVertex(
  cells: Cells,
  i: number,
  j: number,
): CornerNeighbors {
  return {
    tl: cellAt(cells, j - 1, i - 1),
    tr: cellAt(cells, j - 1, i),
    br: cellAt(cells, j, i),
    bl: cellAt(cells, j, i - 1),
  };
}

export function filledCount(n: CornerNeighbors): number {
  return (n.tl ? 1 : 0) + (n.tr ? 1 : 0) + (n.br ? 1 : 0) + (n.bl ? 1 : 0);
}

export function isSaddle(n: CornerNeighbors): boolean {
  return (n.tl && n.br && !n.tr && !n.bl) || (n.tr && n.bl && !n.tl && !n.br);
}
