import { useMemo, useState } from "react";
import { generatePath } from "../lib/pathGenerator";
import { downloadSvg, toCssClipPath, toPathD, toSvgMarkup } from "../lib/output";
import type { GridState } from "../types";

type Props = {
  state: GridState;
};

type TabId = "svg" | "css" | "d";

const TABS: { id: TabId; label: string }[] = [
  { id: "svg", label: "SVG (Webflow Embed)" },
  { id: "css", label: "CSS clip-path" },
  { id: "d", label: "Pfad d" },
];

export function OutputPanel({ state }: Props) {
  const [tab, setTab] = useState<TabId>("svg");
  const [copied, setCopied] = useState(false);

  const sourceW = useMemo(
    () => state.columnWidths.reduce((a, b) => a + b, 0),
    [state.columnWidths],
  );
  const sourceH = useMemo(
    () => state.rowHeights.reduce((a, b) => a + b, 0),
    [state.rowHeights],
  );

  const [customSize, setCustomSize] = useState(false);
  const [exportW, setExportW] = useState<number>(sourceW);
  const [exportH, setExportH] = useState<number>(sourceH);

  const result = useMemo(() => {
    if (!customSize || sourceW === 0 || sourceH === 0) {
      return generatePath({
        cells: state.cells,
        columnWidths: state.columnWidths,
        rowHeights: state.rowHeights,
        radius: state.radius,
      });
    }
    const scaleW = exportW / sourceW;
    const scaleH = exportH / sourceH;
    return generatePath({
      cells: state.cells,
      columnWidths: state.columnWidths.map((w) => w * scaleW),
      rowHeights: state.rowHeights.map((h) => h * scaleH),
      radius: state.radius,
    });
  }, [
    customSize,
    state.cells,
    state.columnWidths,
    state.rowHeights,
    state.radius,
    sourceW,
    sourceH,
    exportW,
    exportH,
  ]);

  const text = useMemo(() => {
    if (!result.d) return "";
    switch (tab) {
      case "svg":
        return toSvgMarkup(result, { fill: "#3E87FF" });
      case "css":
        return toCssClipPath(result);
      case "d":
        return toPathD(result);
    }
  }, [tab, result]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleDownload = () => {
    if (!result.d) return;
    downloadSvg(result, "convex-shape.svg");
  };

  return (
    <div className="output">
      <div className="output-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="export-size">
        <label className="checkbox">
          <input
            type="checkbox"
            checked={customSize}
            onChange={(e) => setCustomSize(e.target.checked)}
          />
          Export-Größe anpassen (viewBox)
        </label>
        {customSize && (
          <div className="export-size-inputs">
            <label>
              Breite
              <input
                type="number"
                min={1}
                value={exportW}
                onChange={(e) => setExportW(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label>
              Höhe
              <input
                type="number"
                min={1}
                value={exportH}
                onChange={(e) => setExportH(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setExportW(sourceW);
                setExportH(sourceH);
              }}
            >
              Auf Quelle zurücksetzen
            </button>
          </div>
        )}
      </div>
      <textarea readOnly value={text} placeholder="Keine Form ausgewählt" />
      <div className="output-actions">
        <button onClick={handleCopy} disabled={!text}>
          {copied ? "Kopiert ✓" : "In Zwischenablage"}
        </button>
        <button onClick={handleDownload} disabled={!result.d}>
          SVG herunterladen
        </button>
      </div>
    </div>
  );
}
