import { useMemo } from "react";
import { generatePath } from "../lib/pathGenerator";
import type { GridState } from "../types";

type Props = {
  state: GridState;
};

export function ShapePreview({ state }: Props) {
  const result = useMemo(
    () =>
      generatePath({
        cells: state.cells,
        columnWidths: state.columnWidths,
        rowHeights: state.rowHeights,
        radius: state.radius,
      }),
    [state.cells, state.columnWidths, state.rowHeights, state.radius],
  );

  const hasShape = result.d.length > 0;

  return (
    <div className="preview">
      <div className="preview-frame">
        {hasShape ? (
          <svg
            viewBox={`0 0 ${result.width} ${result.height}`}
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d={result.d} fill="#3E87FF" />
          </svg>
        ) : (
          <div className="preview-empty">Wähle Zellen, um eine Form zu erzeugen</div>
        )}
      </div>
    </div>
  );
}
