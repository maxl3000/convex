import type { Cells, Direction } from "../types";
import { cellAt, isSaddle, neighborsAtVertex } from "./corners";

export type GridVertex = { i: number; j: number };

export type GridEdge = {
  from: GridVertex;
  to: GridVertex;
  dir: Direction;
};

export type Loop = GridEdge[];

const vKey = (v: GridVertex): string => `${v.i},${v.j}`;
const eKey = (e: GridEdge): string =>
  `${e.from.i},${e.from.j}->${e.to.i},${e.to.j}`;

export function leftTurn(d: Direction): Direction {
  switch (d) {
    case "right":
      return "up";
    case "up":
      return "left";
    case "left":
      return "down";
    case "down":
      return "right";
  }
}

export function rightTurn(d: Direction): Direction {
  switch (d) {
    case "right":
      return "down";
    case "down":
      return "left";
    case "left":
      return "up";
    case "up":
      return "right";
  }
}

export function dirVector(d: Direction): { dx: number; dy: number } {
  switch (d) {
    case "right":
      return { dx: 1, dy: 0 };
    case "left":
      return { dx: -1, dy: 0 };
    case "down":
      return { dx: 0, dy: 1 };
    case "up":
      return { dx: 0, dy: -1 };
  }
}

export function extractEdges(cells: Cells): Map<string, GridEdge[]> {
  const rows = cells.length;
  const cols = rows > 0 ? cells[0].length : 0;
  const outgoing = new Map<string, GridEdge[]>();

  const add = (edge: GridEdge) => {
    const k = vKey(edge.from);
    const list = outgoing.get(k);
    if (list) list.push(edge);
    else outgoing.set(k, [edge]);
  };

  for (let j = 0; j <= rows; j++) {
    for (let c = 0; c < cols; c++) {
      const above = cellAt(cells, j - 1, c);
      const below = cellAt(cells, j, c);
      if (above === below) continue;
      if (below) {
        add({ from: { i: c, j }, to: { i: c + 1, j }, dir: "right" });
      } else {
        add({ from: { i: c + 1, j }, to: { i: c, j }, dir: "left" });
      }
    }
  }

  for (let i = 0; i <= cols; i++) {
    for (let r = 0; r < rows; r++) {
      const left = cellAt(cells, r, i - 1);
      const right = cellAt(cells, r, i);
      if (left === right) continue;
      if (right) {
        add({ from: { i, j: r + 1 }, to: { i, j: r }, dir: "up" });
      } else {
        add({ from: { i, j: r }, to: { i, j: r + 1 }, dir: "down" });
      }
    }
  }

  return outgoing;
}

export function isSaddleVertex(cells: Cells, v: GridVertex): boolean {
  return isSaddle(neighborsAtVertex(cells, v.i, v.j));
}

export function traceLoops(
  outgoing: Map<string, GridEdge[]>,
  cells: Cells,
): Loop[] {
  const loops: Loop[] = [];
  const visited = new Set<string>();

  for (const [, edges] of outgoing) {
    for (const startEdge of edges) {
      if (visited.has(eKey(startEdge))) continue;

      const loop: Loop = [];
      let cur: GridEdge = startEdge;
      let guard = 0;
      while (true) {
        if (guard++ > 100000) throw new Error("Loop trace runaway");
        visited.add(eKey(cur));
        loop.push(cur);

        const nextK = vKey(cur.to);
        const candidates = outgoing.get(nextK) ?? [];
        if (candidates.length === 0) {
          throw new Error("Boundary discontinuity at " + nextK);
        }

        let next: GridEdge;
        if (candidates.length === 1) {
          next = candidates[0];
        } else if (candidates.length === 2 && isSaddleVertex(cells, cur.to)) {
          const wantDir = leftTurn(cur.dir);
          const match = candidates.find((e) => e.dir === wantDir);
          if (!match) throw new Error("Saddle pairing failed");
          next = match;
        } else {
          throw new Error(
            `Unexpected vertex degree ${candidates.length} at ${nextK}`,
          );
        }

        if (visited.has(eKey(next))) break;
        cur = next;
      }
      loops.push(loop);
    }
  }

  return loops;
}
