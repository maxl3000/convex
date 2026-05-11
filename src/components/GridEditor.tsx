import { useCallback, useRef, useState } from "react";
import type { GridState } from "../types";

type Props = {
  state: GridState;
  totalWidth: number;
  totalHeight: number;
  onSetCell: (r: number, c: number, value: boolean) => void;
  onSetColumnWidth: (idx: number, width: number) => void;
  onSetRowHeight: (idx: number, height: number) => void;
};

export function GridEditor({
  state,
  totalWidth,
  totalHeight,
  onSetCell,
  onSetColumnWidth,
  onSetRowHeight,
}: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [paintMode, setPaintMode] = useState<null | boolean>(null);

  const handlePointerDown = useCallback(
    (r: number, c: number, ev: React.PointerEvent) => {
      ev.preventDefault();
      const newVal = !state.cells[r][c];
      setPaintMode(newVal);
      onSetCell(r, c, newVal);
      (ev.target as HTMLElement).setPointerCapture?.(ev.pointerId);
    },
    [state.cells, onSetCell],
  );

  const handlePointerEnter = useCallback(
    (r: number, c: number) => {
      if (paintMode === null) return;
      onSetCell(r, c, paintMode);
    },
    [paintMode, onSetCell],
  );

  const handlePointerUp = useCallback(() => {
    setPaintMode(null);
  }, []);

  const cumWidths: number[] = [0];
  for (const w of state.columnWidths) cumWidths.push(cumWidths.at(-1)! + w);
  const cumHeights: number[] = [0];
  for (const h of state.rowHeights) cumHeights.push(cumHeights.at(-1)! + h);

  const handleColDrag = (idx: number, ev: React.PointerEvent) => {
    ev.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const scale = totalWidth / rect.width;
    const startX = ev.clientX;
    const startWidth = state.columnWidths[idx];

    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);

    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX - startX) * scale;
      onSetColumnWidth(idx, startWidth + dx);
    };
    const onUp = (e: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      (ev.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleRowDrag = (idx: number, ev: React.PointerEvent) => {
    ev.preventDefault();
    const grid = gridRef.current;
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const scale = totalHeight / rect.height;
    const startY = ev.clientY;
    const startHeight = state.rowHeights[idx];

    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);

    const onMove = (e: PointerEvent) => {
      const dy = (e.clientY - startY) * scale;
      onSetRowHeight(idx, startHeight + dy);
    };
    const onUp = (e: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      (ev.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: state.columnWidths.map((w) => `${w}fr`).join(" "),
    gridTemplateRows: state.rowHeights.map((h) => `${h}fr`).join(" "),
    aspectRatio: `${totalWidth} / ${totalHeight}`,
  };

  return (
    <div className="grid-editor" ref={gridRef} style={gridStyle} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
      {state.cells.map((row, r) =>
        row.map((filled, c) => (
          <div
            key={`${r}-${c}`}
            className={`cell ${filled ? "filled" : ""}`}
            style={{ gridRow: r + 1, gridColumn: c + 1 }}
            onPointerDown={(ev) => handlePointerDown(r, c, ev)}
            onPointerEnter={() => handlePointerEnter(r, c)}
          />
        )),
      )}
      {!state.uniformMode &&
        state.columnWidths.slice(0, -1).map((_, idx) => {
          const leftPct = (cumWidths[idx + 1] / totalWidth) * 100;
          return (
            <div
              key={`vh-${idx}`}
              className="handle handle-v"
              style={{ left: `${leftPct}%` }}
              onPointerDown={(ev) => handleColDrag(idx, ev)}
            />
          );
        })}
      {!state.uniformMode &&
        state.rowHeights.slice(0, -1).map((_, idx) => {
          const topPct = (cumHeights[idx + 1] / totalHeight) * 100;
          return (
            <div
              key={`hh-${idx}`}
              className="handle handle-h"
              style={{ top: `${topPct}%` }}
              onPointerDown={(ev) => handleRowDrag(idx, ev)}
            />
          );
        })}
    </div>
  );
}
