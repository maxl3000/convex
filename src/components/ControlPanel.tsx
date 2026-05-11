import type { GridState } from "../types";

type Props = {
  state: GridState;
  totalWidth: number;
  totalHeight: number;
  onCols: (n: number) => void;
  onRows: (n: number) => void;
  onRadius: (n: number) => void;
  onUniformMode: (v: boolean) => void;
  onClear: () => void;
  onFill: () => void;
};

export function ControlPanel({
  state,
  totalWidth,
  totalHeight,
  onCols,
  onRows,
  onRadius,
  onUniformMode,
  onClear,
  onFill,
}: Props) {
  const minCellSide = Math.min(
    Math.min(...state.columnWidths),
    Math.min(...state.rowHeights),
  );
  const maxRadius = Math.floor(minCellSide / 2);

  return (
    <div className="controls">
      <div className="control-row">
        <label>
          Spalten
          <input
            type="number"
            min={1}
            max={30}
            value={state.cols}
            onChange={(e) => onCols(parseInt(e.target.value || "1", 10))}
          />
        </label>
        <label>
          Reihen
          <input
            type="number"
            min={1}
            max={30}
            value={state.rows}
            onChange={(e) => onRows(parseInt(e.target.value || "1", 10))}
          />
        </label>
      </div>

      <div className="control-row">
        <label className="full">
          Radius: {state.radius}
          <input
            type="range"
            min={0}
            max={Math.max(10, maxRadius)}
            value={Math.min(state.radius, maxRadius)}
            onChange={(e) => onRadius(parseInt(e.target.value, 10))}
          />
        </label>
      </div>

      <div className="control-row">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={state.uniformMode}
            onChange={(e) => onUniformMode(e.target.checked)}
          />
          Gleichgroße Zellen
        </label>
      </div>

      <div className="control-row buttons">
        <button onClick={onClear}>Alle löschen</button>
        <button onClick={onFill}>Alle füllen</button>
      </div>

      <div className="control-row meta">
        <small>
          viewBox: {Math.round(totalWidth)} × {Math.round(totalHeight)}
        </small>
      </div>
    </div>
  );
}
