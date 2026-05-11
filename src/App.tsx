import { ControlPanel } from "./components/ControlPanel";
import { GridEditor } from "./components/GridEditor";
import { OutputPanel } from "./components/OutputPanel";
import { ShapePreview } from "./components/ShapePreview";
import { StatesPanel } from "./components/StatesPanel";
import { useGridState } from "./state/useGridState";

export default function App() {
  const grid = useGridState();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Convex Path Curves</h1>
        <p>
          Klicke Zellen an, um die Form zu bauen. Konsistente Radien, alles im rechten Winkel,
          responsive via viewBox.
        </p>
      </header>

      <main className="app-grid">
        <section className="panel panel-editor">
          <h2>Grid Editor</h2>
          <GridEditor
            state={grid.state}
            totalWidth={grid.totalWidth}
            totalHeight={grid.totalHeight}
            onSetCell={grid.setCell}
            onSetColumnWidth={grid.setColumnWidth}
            onSetRowHeight={grid.setRowHeight}
          />
        </section>

        <section className="panel panel-preview">
          <h2>Vorschau</h2>
          <ShapePreview state={grid.state} />
        </section>

        <section className="panel panel-controls">
          <h2>Einstellungen</h2>
          <ControlPanel
            state={grid.state}
            totalWidth={grid.totalWidth}
            totalHeight={grid.totalHeight}
            onCols={grid.setCols}
            onRows={grid.setRows}
            onRadius={grid.setRadius}
            onUniformMode={grid.setUniformMode}
            onClear={grid.clearCells}
            onFill={grid.fillCells}
          />
        </section>

        <section className="panel panel-states">
          <h2>States</h2>
          <StatesPanel
            snapshots={grid.snapshots}
            activeIdx={grid.activeIdx}
            onSelect={grid.selectState}
            onAdd={grid.addState}
            onDelete={grid.deleteState}
            onRename={grid.renameState}
          />
        </section>

        <section className="panel panel-output">
          <h2>Output</h2>
          <OutputPanel snapshots={grid.snapshots} activeIdx={grid.activeIdx} />
        </section>
      </main>
    </div>
  );
}
