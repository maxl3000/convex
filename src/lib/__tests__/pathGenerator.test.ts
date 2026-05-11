import { describe, expect, it } from "vitest";
import { generatePath } from "../pathGenerator";

const mkUniform = (
  cols: number,
  rows: number,
  cellSize: number,
  cells: boolean[][],
  radius: number,
) =>
  generatePath({
    cells,
    columnWidths: Array(cols).fill(cellSize),
    rowHeights: Array(rows).fill(cellSize),
    radius,
  });

describe("generatePath", () => {
  it("empty grid yields empty d", () => {
    const out = generatePath({
      cells: [],
      columnWidths: [],
      rowHeights: [],
      radius: 10,
    });
    expect(out.d).toBe("");
  });

  it("all-empty grid yields empty d", () => {
    const out = mkUniform(2, 2, 100, [
      [false, false],
      [false, false],
    ], 10);
    expect(out.d).toBe("");
  });

  it("single cell produces a rounded rect (4 convex corners)", () => {
    const out = mkUniform(1, 1, 100, [[true]], 20);
    expect(out.width).toBe(100);
    expect(out.height).toBe(100);
    expect(out.d.match(/A/g)?.length).toBe(4);
    expect(out.d).toContain("A20");
    expect(out.d).toMatch(/Z$/);
  });

  it("two horizontally adjacent cells merge into one rounded rect", () => {
    const out = mkUniform(2, 1, 100, [[true, true]], 20);
    expect(out.width).toBe(200);
    expect(out.height).toBe(100);
    expect(out.d.match(/A/g)?.length).toBe(4);
  });

  it("L-shape has 5 convex + 1 concave corner", () => {
    const cells = [
      [true, true],
      [true, false],
    ];
    const out = mkUniform(2, 2, 100, cells, 20);
    const arcs = out.d.match(/A/g)?.length ?? 0;
    expect(arcs).toBe(6);
    const sweep1 = out.d.match(/A\d+\.?\d* \d+\.?\d* 0 0 1/g)?.length ?? 0;
    const sweep0 = out.d.match(/A\d+\.?\d* \d+\.?\d* 0 0 0/g)?.length ?? 0;
    expect(sweep1).toBe(5);
    expect(sweep0).toBe(1);
  });

  it("disconnected cells produce two subpaths", () => {
    const cells = [
      [true, false, true],
    ];
    const out = mkUniform(3, 1, 100, cells, 10);
    const ms = out.d.match(/M/g)?.length ?? 0;
    expect(ms).toBe(2);
    expect(out.d.match(/Z/g)?.length).toBe(2);
  });

  it("diagonal cells (saddle) produce one loop with sharp points", () => {
    const cells = [
      [true, false],
      [false, true],
    ];
    const out = mkUniform(2, 2, 100, cells, 20);
    expect(out.d.match(/M/g)?.length).toBe(1);
    expect(out.d.match(/Z/g)?.length).toBe(1);
    const arcs = out.d.match(/A/g)?.length ?? 0;
    expect(arcs).toBe(6);
    const sharpPoints = (out.d.match(/L100 100/g) || []).length;
    expect(sharpPoints).toBe(2);
  });

  it("anti-diagonal cells (saddle) also produce one connected loop", () => {
    const cells = [
      [false, true],
      [true, false],
    ];
    const out = mkUniform(2, 2, 100, cells, 20);
    expect(out.d.match(/M/g)?.length).toBe(1);
    expect(out.d.match(/Z/g)?.length).toBe(1);
  });

  it("radius gets clamped to half-cell so neighboring corners don't overlap", () => {
    const out = mkUniform(1, 1, 20, [[true]], 50);
    expect(out.d).toContain("A10");
  });

  it("returns viewBox width and height as sum of cell dims", () => {
    const out = generatePath({
      cells: [[true, true], [true, true]],
      columnWidths: [50, 150],
      rowHeights: [80, 120],
      radius: 10,
    });
    expect(out.width).toBe(200);
    expect(out.height).toBe(200);
  });

  it("variable column widths produce correctly positioned corners", () => {
    const out = generatePath({
      cells: [[true]],
      columnWidths: [200],
      rowHeights: [80],
      radius: 10,
    });
    expect(out.d).toContain("200");
    expect(out.d).toContain("80");
  });
});
