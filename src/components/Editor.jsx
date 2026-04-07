import { useState, useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { LeftPanel } from './LeftPanel'
import { RightPanel } from './RightPanel'
import { CanvasView } from './CanvasView'
import { useLabwareStore } from '../store/useLabwareStore'

export function Editor() {
  const [fitSignal,       setFitSignal]       = useState(0)
  const [exportPngSignal, setExportPngSignal] = useState(0)
  const { undo, redo, snapshot, removeSelectedWells, selectedWells, pendingMultiWells,
          copySelectedWells, pasteWells } = useLabwareStore()

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWells.length > 0) {
          snapshot()
          removeSelectedWells()
        }
        return
      }
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
      if (e.key === 'c') { e.preventDefault(); copySelectedWells() }
      if (e.key === 'v') { e.preventDefault(); pasteWells() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, snapshot, removeSelectedWells, selectedWells, copySelectedWells, pasteWells])

  const hasSelection = selectedWells.length > 0 || !!pendingMultiWells

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left sidebar — plate config, always visible */}
        <div className="relative z-10 flex-shrink-0 overflow-hidden border-r border-gray-200"
             style={{ width: '300px', minWidth: '300px' }}>
          <div className="absolute inset-0 overflow-y-auto bg-white">
            <LeftPanel />
          </div>
        </div>

        {/* Canvas — fills remaining space */}
        <div className="relative z-0 flex-1 min-w-0 overflow-hidden flex flex-col">

          {/* Floating toolbar — centered above canvas */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
            <Toolbar onFitView={() => setFitSignal(n => n + 1)} onExportPng={() => setExportPngSignal(n => n + 1)} />
          </div>

          <CanvasView fitSignal={fitSignal} exportPngSignal={exportPngSignal} />
        </div>

        {/* Right sidebar — selection properties, shown when wells are selected */}
        {hasSelection && (
          <div className="relative z-10 flex-shrink-0 overflow-hidden border-l border-gray-200"
               style={{ width: '280px', minWidth: '280px' }}>
            <div className="absolute inset-0 overflow-y-auto bg-white">
              <RightPanel />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
