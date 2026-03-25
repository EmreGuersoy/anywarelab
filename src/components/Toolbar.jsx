/**
 * Toolbar.jsx — CAD tool strip above the canvas.
 * B&W style: white background, black active state, clean borders.
 */

import { useEffect, useRef } from 'react'
import { useLabwareStore } from '../store/useLabwareStore'
import { downloadSchema } from '../utils/schemaExport'
import { parseLabwareJSON } from '../utils/schemaImport'

const TOOLS = [
  { id: 'select',        label: 'Select',   icon: '↖', key: 'v', tip: 'Select / drag  [V]' },
  { id: 'addWell',       label: 'Add Well', icon: '⊕', key: 'w', tip: 'Click to place a well  [W]' },
  { id: 'multipleWells', label: 'Multi',    icon: '⊞', key: 'g', tip: 'Drag to place multiple wells  [G]' },
  { id: 'reservoir',     label: 'Reservoir',icon: '▬', key: 'r', tip: 'Click to place a reservoir  [R]' },
  { id: 'erase',         label: 'Erase',    icon: '✕', key: 'e', tip: 'Click a well to delete  [E]' },
]

export function Toolbar({ onFitView }) {
  const {
    activeTool, setActiveTool,
    labwareConfig, wellGroups,
    loadFromSchema,
    undo, redo,
    past, future,
  } = useLabwareStore()

  const fileInputRef = useRef(null)

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target.result)
        const result = parseLabwareJSON(json)
        loadFromSchema(result)
      } catch (err) {
        alert(`Import failed: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const t = TOOLS.find(t => t.key === e.key.toLowerCase())
      if (t) setActiveTool(t.id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setActiveTool])

  return (
    <div className="flex items-center gap-px px-3 py-1.5 bg-white border-b border-gray-200 flex-shrink-0 flex-wrap">

      {/* ── Cursor tools ── */}
      <ToolGroup>
        {TOOLS.map(t => (
          <ToolBtn
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={activeTool === t.id}
            title={t.tip}
            onClick={() => setActiveTool(t.id)}
          />
        ))}
      </ToolGroup>

      <Divider />

      {/* ── View ── */}
      <ToolGroup>
        <button
          onClick={onFitView}
          title="Fit plate to screen"
          className="px-2 py-1 rounded text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent transition-colors"
        >
          ⊡ Fit
        </button>
      </ToolGroup>

      <div className="flex-1" />

      {/* ── Undo / Redo ── */}
      <ToolGroup>
        <button
          onClick={undo}
          disabled={past.length === 0}
          title="Undo  [Ctrl+Z]"
          className="px-2 py-1 rounded text-xs border border-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 hover:bg-gray-100 enabled:hover:border-gray-200"
        >
          ↩ Undo
        </button>
        <button
          onClick={redo}
          disabled={future.length === 0}
          title="Redo  [Ctrl+Y]"
          className="px-2 py-1 rounded text-xs border border-transparent transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 hover:text-gray-900 hover:bg-gray-100 enabled:hover:border-gray-200"
        >
          ↪ Redo
        </button>
      </ToolGroup>

      <Divider />

      {/* ── Import / Export ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded border border-gray-300 transition-colors mr-1"
      >
        ↑ Import JSON
      </button>
      <button
        onClick={() => downloadSchema(labwareConfig, wellGroups)}
        className="flex items-center gap-1.5 px-3 py-1 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold rounded transition-colors"
      >
        ↓ Export JSON
      </button>
    </div>
  )
}

function ToolGroup({ children }) {
  return <div className="flex items-center gap-px">{children}</div>
}

function Divider() {
  return <div className="w-px h-4 bg-gray-200 mx-2" />
}

function ToolBtn({ icon, label, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={
        'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ' +
        (active
          ? 'bg-gray-900 text-white border-gray-900 font-semibold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent')
      }
    >
      <span className="text-sm leading-none">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

