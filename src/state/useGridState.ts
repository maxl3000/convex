import { useCallback, useMemo, useState } from "react";
import type { Cells, GridState } from "../types";

const DEFAULT_TOTAL = 1000;
const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 6;
const DEFAULT_RADIUS = 40;

function makeCells(rows: number, cols: number, fill = false): Cells {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function uniformWidths(count: number, total: number): number[] {
  return Array(count).fill(total / count);
}

function buildInitial(): GridState {
  return {
    cols: DEFAULT_COLS,
    rows: DEFAULT_ROWS,
    columnWidths: uniformWidths(DEFAULT_COLS, DEFAULT_TOTAL),
    rowHeights: uniformWidths(DEFAULT_ROWS, DEFAULT_TOTAL * 0.6),
    cells: makeCells(DEFAULT_ROWS, DEFAULT_COLS, false),
    radius: DEFAULT_RADIUS,
    uniformMode: true,
  };
}

export function useGridState() {
  const [state, setState] = useState<GridState>(buildInitial);

  const totalWidth = useMemo(
    () => state.columnWidths.reduce((a, b) => a + b, 0),
    [state.columnWidths],
  );
  const totalHeight = useMemo(
    () => state.rowHeights.reduce((a, b) => a + b, 0),
    [state.rowHeights],
  );

  const toggleCell = useCallback((r: number, c: number) => {
    setState((s) => {
      const cells = s.cells.map((row, ri) =>
        ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row,
      );
      return { ...s, cells };
    });
  }, []);

  const setCell = useCallback((r: number, c: number, value: boolean) => {
    setState((s) => {
      if (s.cells[r][c] === value) return s;
      const cells = s.cells.map((row, ri) =>
        ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row,
      );
      return { ...s, cells };
    });
  }, []);

  const setCols = useCallback((cols: number) => {
    setState((s) => {
      const clamped = Math.max(1, Math.min(30, cols));
      if (clamped === s.cols) return s;
      const newCells = makeCells(s.rows, clamped, false);
      for (let r = 0; r < s.rows; r++) {
        for (let c = 0; c < Math.min(clamped, s.cols); c++) {
          newCells[r][c] = s.cells[r][c];
        }
      }
      const total = s.columnWidths.reduce((a, b) => a + b, 0);
      return {
        ...s,
        cols: clamped,
        cells: newCells,
        columnWidths: uniformWidths(clamped, total),
      };
    });
  }, []);

  const setRows = useCallback((rows: number) => {
    setState((s) => {
      const clamped = Math.max(1, Math.min(30, rows));
      if (clamped === s.rows) return s;
      const newCells = makeCells(clamped, s.cols, false);
      for (let r = 0; r < Math.min(clamped, s.rows); r++) {
        for (let c = 0; c < s.cols; c++) {
          newCells[r][c] = s.cells[r][c];
        }
      }
      const total = s.rowHeights.reduce((a, b) => a + b, 0);
      return {
        ...s,
        rows: clamped,
        cells: newCells,
        rowHeights: uniformWidths(clamped, total),
      };
    });
  }, []);

  const setRadius = useCallback((radius: number) => {
    setState((s) => ({ ...s, radius: Math.max(0, radius) }));
  }, []);

  const setUniformMode = useCallback((uniformMode: boolean) => {
    setState((s) => {
      if (uniformMode === s.uniformMode) return s;
      if (uniformMode) {
        const tw = s.columnWidths.reduce((a, b) => a + b, 0);
        const th = s.rowHeights.reduce((a, b) => a + b, 0);
        return {
          ...s,
          uniformMode: true,
          columnWidths: uniformWidths(s.cols, tw),
          rowHeights: uniformWidths(s.rows, th),
        };
      }
      return { ...s, uniformMode: false };
    });
  }, []);

  const setColumnWidth = useCallback((idx: number, width: number) => {
    setState((s) => {
      const widths = [...s.columnWidths];
      const neighbor = idx + 1 < widths.length ? idx + 1 : idx - 1;
      const minSize = 20;
      const combined = widths[idx] + widths[neighbor];
      const clamped = Math.max(minSize, Math.min(combined - minSize, width));
      widths[idx] = clamped;
      widths[neighbor] = combined - clamped;
      return { ...s, columnWidths: widths };
    });
  }, []);

  const setRowHeight = useCallback((idx: number, height: number) => {
    setState((s) => {
      const heights = [...s.rowHeights];
      const neighbor = idx + 1 < heights.length ? idx + 1 : idx - 1;
      const minSize = 20;
      const combined = heights[idx] + heights[neighbor];
      const clamped = Math.max(minSize, Math.min(combined - minSize, height));
      heights[idx] = clamped;
      heights[neighbor] = combined - clamped;
      return { ...s, rowHeights: heights };
    });
  }, []);

  const clearCells = useCallback(() => {
    setState((s) => ({ ...s, cells: makeCells(s.rows, s.cols, false) }));
  }, []);

  const fillCells = useCallback(() => {
    setState((s) => ({ ...s, cells: makeCells(s.rows, s.cols, true) }));
  }, []);

  return {
    state,
    totalWidth,
    totalHeight,
    toggleCell,
    setCell,
    setCols,
    setRows,
    setRadius,
    setUniformMode,
    setColumnWidth,
    setRowHeight,
    clearCells,
    fillCells,
  };
}
