import type { Cells, Direction } from "../types";
import {
  dirVector,
  extractEdges,
  isSaddleVertex,
  leftTurn,
  rightTurn,
  traceLoops,
  type GridEdge,
  type GridVertex,
  type Loop,
} from "./boundary";

export type PathInput = {
  cells: Cells;
  columnWidths: number[];
  rowHeights: number[];
  radius: number;
};

export type PathResult = {
  d: string;
  width: number;
  height: number;
};

function cumulative(arr: number[]): number[] {
  const out = [0];
  for (let i = 0; i < arr.length; i++) out.push(out[i] + arr[i]);
  return out;
}

function fmt(n: number): string {
  if (Math.abs(n) < 1e-9) return "0";
  const rounded = Math.round(n * 1000) / 1000;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toString();
}

function edgeLength(
  edge: GridEdge,
  xs: number[],
  ys: number[],
): number {
  if (edge.dir === "left" || edge.dir === "right") {
    return Math.abs(xs[edge.to.i] - xs[edge.from.i]);
  }
  return Math.abs(ys[edge.to.j] - ys[edge.from.j]);
}

function vertexPos(v: GridVertex, xs: number[], ys: number[]) {
  return { x: xs[v.i], y: ys[v.j] };
}

export function generatePathFromLoop(
  loop: Loop,
  cells: Cells,
  xs: number[],
  ys: number[],
  radius: number,
): string {
  const n = loop.length;
  if (n === 0) return "";

  // Find first non-straight corner as start
  let startIdx = 0;
  for (let k = 0; k < n; k++) {
    const prev = loop[(k - 1 + n) % n];
    if (prev.dir !== loop[k].dir) {
      startIdx = k;
      break;
    }
  }

  // Per-corner effective radius: min(radius, half of each adjacent edge length).
  // Saddle vertices force radius = 0.
  const effectiveR = (idx: number): number => {
    const cur = loop[idx];
    const prev = loop[(idx - 1 + n) % n];
    if (isSaddleVertex(cells, cur.from)) return 0;
    const prevLen = edgeLength(prev, xs, ys);
    const curLen = edgeLength(cur, xs, ys);
    return Math.min(radius, prevLen / 2, curLen / 2);
  };

  const parts: string[] = [];

  // Starting point: at the start corner, offset r along outgoing direction.
  const startVertex = loop[startIdx].from;
  const startDir = loop[startIdx].dir;
  const startR = effectiveR(startIdx);
  const sv = vertexPos(startVertex, xs, ys);
  const sdir = dirVector(startDir);
  const startX = sv.x + startR * sdir.dx;
  const startY = sv.y + startR * sdir.dy;
  parts.push(`M${fmt(startX)} ${fmt(startY)}`);

  for (let step = 0; step < n; step++) {
    const i = (startIdx + step) % n;
    const next = (i + 1) % n;

    const inEdge = loop[i];
    const outEdge = loop[next];
    const cornerVertex = inEdge.to;
    const dirIn: Direction = inEdge.dir;
    const dirOut: Direction = outEdge.dir;

    if (dirIn === dirOut) continue;

    const cv = vertexPos(cornerVertex, xs, ys);
    const inVec = dirVector(dirIn);
    const outVec = dirVector(dirOut);
    const r = effectiveR(next);
    const saddle = isSaddleVertex(cells, cornerVertex);

    if (saddle || r === 0) {
      parts.push(`L${fmt(cv.x)} ${fmt(cv.y)}`);
      continue;
    }

    const beforeX = cv.x - r * inVec.dx;
    const beforeY = cv.y - r * inVec.dy;
    const afterX = cv.x + r * outVec.dx;
    const afterY = cv.y + r * outVec.dy;

    parts.push(`L${fmt(beforeX)} ${fmt(beforeY)}`);

    const isRightTurn = rightTurn(dirIn) === dirOut;
    const isLeft = leftTurn(dirIn) === dirOut;
    let sweep = 0;
    if (isRightTurn) sweep = 1;
    else if (isLeft) sweep = 0;
    parts.push(`A${fmt(r)} ${fmt(r)} 0 0 ${sweep} ${fmt(afterX)} ${fmt(afterY)}`);
  }

  parts.push("Z");
  return parts.join(" ");
}

export function generatePath(input: PathInput): PathResult {
  const { cells, columnWidths, rowHeights, radius } = input;
  const xs = cumulative(columnWidths);
  const ys = cumulative(rowHeights);
  const width = xs[xs.length - 1];
  const height = ys[ys.length - 1];

  if (cells.length === 0 || cells[0].length === 0) {
    return { d: "", width, height };
  }

  const outgoing = extractEdges(cells);
  if (outgoing.size === 0) {
    return { d: "", width, height };
  }

  const loops = traceLoops(outgoing, cells);
  const d = loops
    .map((loop) => generatePathFromLoop(loop, cells, xs, ys, radius))
    .filter(Boolean)
    .join(" ");

  return { d, width, height };
}
