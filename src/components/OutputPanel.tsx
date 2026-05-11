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
