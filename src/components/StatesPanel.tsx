import { useMemo } from "react";
import { generatePath } from "../lib/pathGenerator";
import type { StateSnapshot } from "../state/useGridState";

type Props = {
  snapshots: StateSnapshot[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onAdd: () => void;
  onDelete: (idx: number) => void;
  onRename: (idx: number, name: string) => void;
};

function Thumbnail({ snap }: { snap: StateSnapshot }) {
  const result = useMemo(
    () =>
      generatePath({
        cells: snap.grid.cells,
        columnWidths: snap.grid.columnWidths,
        rowHeights: snap.grid.rowHeights,
        radius: snap.grid.radius,
      }),
    [snap.grid.cells, snap.grid.columnWidths, snap.grid.rowHeights, snap.grid.radius],
  );

  if (!result.d) {
    return <div className="state-thumb-empty">∅</div>;
  }
  return (
    <svg
      viewBox={`0 0 ${result.width} ${result.height}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={result.d} fill="currentColor" />
    </svg>
  );
}

export function StatesPanel({
  snapshots,
  activeIdx,
  onSelect,
  onAdd,
  onDelete,
  onRename,
}: Props) {
  return (
    <div className="states">
      <div className="states-list">
        {snapshots.map((snap, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={snap.id}
              className={`state-card ${isActive ? "active" : ""}`}
              onClick={() => onSelect(idx)}
            >
              <div className="state-thumb">
                <Thumbnail snap={snap} />
              </div>
              <input
                className="state-name"
                value={snap.name}
                onChange={(e) => onRename(idx, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="state-delete"
                title="State löschen"
                disabled={snapshots.length <= 1}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
        <button type="button" className="state-add" onClick={onAdd}>
          + State hinzufügen
        </button>
      </div>
    </div>
  );
}
