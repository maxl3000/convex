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

export type StateSnapshot = {
  id: string;
  name: string;
  grid: GridState;
};

function cloneGrid(g: GridState): GridState {
  return {
    cols: g.cols,
    rows: g.rows,
    columnWidths: [...g.columnWidths],
    rowHeights: [...g.rowHeights],
    cells: g.cells.map((row) => [...row]),
    radius: g.radius,
    uniformMode: g.uniformMode,
  };
}

function buildInitialGrid(): GridState {
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

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `s${Date.now().toString(36)}${idCounter}`;
}

function buildInitialSnapshots(): StateSnapshot[] {
  return [{ id: nextId(), name: "State 1", grid: buildInitialGrid() }];
}

export function useGridState() {
  const [snapshots, setSnapshots] = useState<StateSnapshot[]>(buildInitialSnapshots);
  const [activeIdx, setActiveIdx] = useState(0);

  const state = snapshots[activeIdx]?.grid ?? buildInitialGrid();

  const totalWidth = useMemo(
    () => state.columnWidths.reduce((a, b) => a + b, 0),
    [state.columnWidths],
  );
  const totalHeight = useMemo(
    () => state.rowHeights.reduce((a, b) => a + b, 0),
    [state.rowHeights],
  );

  const updateActive = useCallback(
    (mut: (g: GridState) => GridState) => {
      setSnapshots((prev) =>
        prev.map((s, i) => (i === activeIdx ? { ...s, grid: mut(s.grid) } : s)),
      );
    },
    [activeIdx],
  );

  const toggleCell = useCallback(
    (r: number, c: number) => {
      updateActive((g) => ({
        ...g,
        cells: g.cells.map((row, ri) =>
          ri === r ? row.map((v, ci) => (ci === c ? !v : v)) : row,
        ),
      }));
    },
    [updateActive],
  );

  const setCell = useCallback(
    (r: number, c: number, value: boolean) => {
      updateActive((g) => {
        if (g.cells[r][c] === value) return g;
        return {
          ...g,
          cells: g.cells.map((row, ri) =>
            ri === r ? row.map((v, ci) => (ci === c ? value : v)) : row,
          ),
        };
      });
    },
    [updateActive],
  );

  const setCols = useCallback(
    (cols: number) => {
      updateActive((g) => {
        const clamped = Math.max(1, Math.min(30, cols));
        if (clamped === g.cols) return g;
        const newCells = makeCells(g.rows, clamped, false);
        for (let r = 0; r < g.rows; r++) {
          for (let c = 0; c < Math.min(clamped, g.cols); c++) {
            newCells[r][c] = g.cells[r][c];
          }
        }
        const total = g.columnWidths.reduce((a, b) => a + b, 0);
        return {
          ...g,
          cols: clamped,
          cells: newCells,
          columnWidths: uniformWidths(clamped, total),
        };
      });
    },
    [updateActive],
  );

  const setRows = useCallback(
    (rows: number) => {
      updateActive((g) => {
        const clamped = Math.max(1, Math.min(30, rows));
        if (clamped === g.rows) return g;
        const newCells = makeCells(clamped, g.cols, false);
        for (let r = 0; r < Math.min(clamped, g.rows); r++) {
          for (let c = 0; c < g.cols; c++) {
            newCells[r][c] = g.cells[r][c];
          }
        }
        const total = g.rowHeights.reduce((a, b) => a + b, 0);
        return {
          ...g,
          rows: clamped,
          cells: newCells,
          rowHeights: uniformWidths(clamped, total),
        };
      });
    },
    [updateActive],
  );

  const setRadius = useCallback(
    (radius: number) => {
      updateActive((g) => ({ ...g, radius: Math.max(0, radius) }));
    },
    [updateActive],
  );

  const setUniformMode = useCallback(
    (uniformMode: boolean) => {
      updateActive((g) => {
        if (uniformMode === g.uniformMode) return g;
        if (uniformMode) {
          const tw = g.columnWidths.reduce((a, b) => a + b, 0);
          const th = g.rowHeights.reduce((a, b) => a + b, 0);
          return {
            ...g,
            uniformMode: true,
            columnWidths: uniformWidths(g.cols, tw),
            rowHeights: uniformWidths(g.rows, th),
          };
        }
        return { ...g, uniformMode: false };
      });
    },
    [updateActive],
  );

  const setColumnWidth = useCallback(
    (idx: number, width: number) => {
      updateActive((g) => {
        const widths = [...g.columnWidths];
        const neighbor = idx + 1 < widths.length ? idx + 1 : idx - 1;
        const minSize = 20;
        const combined = widths[idx] + widths[neighbor];
        const clamped = Math.max(minSize, Math.min(combined - minSize, width));
        widths[idx] = clamped;
        widths[neighbor] = combined - clamped;
        return { ...g, columnWidths: widths };
      });
    },
    [updateActive],
  );

  const setRowHeight = useCallback(
    (idx: number, height: number) => {
      updateActive((g) => {
        const heights = [...g.rowHeights];
        const neighbor = idx + 1 < heights.length ? idx + 1 : idx - 1;
        const minSize = 20;
        const combined = heights[idx] + heights[neighbor];
        const clamped = Math.max(minSize, Math.min(combined - minSize, height));
        heights[idx] = clamped;
        heights[neighbor] = combined - clamped;
        return { ...g, rowHeights: heights };
      });
    },
    [updateActive],
  );

  const clearCells = useCallback(() => {
    updateActive((g) => ({ ...g, cells: makeCells(g.rows, g.cols, false) }));
  }, [updateActive]);

  const fillCells = useCallback(() => {
    updateActive((g) => ({ ...g, cells: makeCells(g.rows, g.cols, true) }));
  }, [updateActive]);

  const addState = useCallback(() => {
    setSnapshots((prev) => {
      const base = prev[activeIdx]?.grid ?? buildInitialGrid();
      return [
        ...prev,
        { id: nextId(), name: `State ${prev.length + 1}`, grid: cloneGrid(base) },
      ];
    });
    setActiveIdx(snapshots.length);
  }, [activeIdx, snapshots.length]);

  const deleteState = useCallback(
    (idx: number) => {
      setSnapshots((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((_, i) => i !== idx);
      });
      setActiveIdx((cur) => {
        if (snapshots.length <= 1) return cur;
        if (cur > idx) return cur - 1;
        if (cur === idx) return Math.max(0, cur - 1);
        return cur;
      });
    },
    [snapshots.length],
  );

  const selectState = useCallback((idx: number) => {
    setActiveIdx(idx);
  }, []);

  const renameState = useCallback((idx: number, name: string) => {
    setSnapshots((prev) => prev.map((s, i) => (i === idx ? { ...s, name } : s)));
  }, []);

  return {
    state,
    totalWidth,
    totalHeight,
    snapshots,
    activeIdx,
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
    addState,
    deleteState,
    selectState,
    renameState,
  };
}
