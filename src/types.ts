export type Cells = boolean[][];

export type GridState = {
  cols: number;
  rows: number;
  columnWidths: number[];
  rowHeights: number[];
  cells: Cells;
  radius: number;
  uniformMode: boolean;
};

export type Point = { x: number; y: number };

export type Direction = "right" | "down" | "left" | "up";

export type CornerType = "convex" | "concave" | "straight" | "saddle" | "none";

export type BoundaryEdge = {
  from: Point;
  to: Point;
  dir: Direction;
};
