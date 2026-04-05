/**
 * Toolbar.jsx — CAD tool strip above the canvas.
 * B&W style: white background, black active state, clean borders.
 */

import { useEffect, useRef, useState } from 'react'
import { useLabwareStore } from '../store/useLabwareStore'
import { downloadSchema } from '../utils/schemaExport'
import { parseLabwareJSON } from '../utils/schemaImport'
import { validateLabware } from '../utils/validation'

const TOOLS = [
  { id: 'select', label: 'Select', icon: '↖', key: 'v', tip: 'Select / drag  [V]' },
  { id: 'erase',  label: 'Erase',  icon: '✕', key: 'e', tip: 'Click a well to delete  [E]' },
]

export function Toolbar({ onFitView, onExportPng }) {
  const {
    activeTool, setActiveTool,
    labwareConfig, wellGroups,
    loadFromSchema,
    undo, redo,
    past, future,
  } = useLabwareStore()

  const fileInputRef   = useRef(null)
  const exportMenuRef  = useRef(null)
  const [exportOpen,   setExportOpen]   = useState(false)
  const [validation,   setValidation]   = useState(null)  // null | { errors, warnings }

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

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
      <div ref={exportMenuRef} className="relative">
        <button
          onClick={() => setExportOpen(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded transition-colors"
        >
          ↓ Export ▾
        </button>
        {exportOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[130px] overflow-hidden">
            <button
              onClick={() => {
                setExportOpen(false)
                const result = validateLabware(labwareConfig, wellGroups)
                if (result.errors.length > 0 || result.warnings.length > 0) {
                  setValidation(result)
                } else {
                  downloadSchema(labwareConfig, wellGroups)
                }
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100"
            >
              ↓ JSON file
            </button>
            <button
              onClick={() => { onExportPng(); setExportOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ↓ PNG image
            </button>
          </div>
        )}
      </div>
      {/* ── Export validation modal ── */}
      {validation && (
        <ExportValidationModal
          errors={validation.errors}
          warnings={validation.warnings}
          onExport={() => { downloadSchema(labwareConfig, wellGroups); setValidation(null) }}
          onClose={() => setValidation(null)}
        />
      )}
    </div>
  )
}

function ExportValidationModal({ errors, warnings, onExport, onClose }) {
  const hasErrors = errors.length > 0
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className={`px-5 py-4 border-b border-gray-100 flex items-center gap-3 ${hasErrors ? 'bg-red-50' : 'bg-orange-50'}`}>
          <span className={`text-lg ${hasErrors ? 'text-red-500' : 'text-orange-500'}`}>
            {hasErrors ? '✕' : '⚠'}
          </span>
          <div>
            <div className={`text-sm font-semibold ${hasErrors ? 'text-red-900' : 'text-orange-900'}`}>
              {hasErrors ? 'Export blocked' : 'Export with warnings'}
            </div>
            <div className={`text-[11px] mt-0.5 ${hasErrors ? 'text-red-600' : 'text-orange-600'}`}>
              {hasErrors
                ? 'Fix the following errors before exporting.'
                : 'Review the following warnings before proceeding.'}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
          {errors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-red-500">Errors</div>
              {errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <span className="text-red-500 flex-shrink-0 text-[11px] mt-px font-bold">✕</span>
                  <span className="text-[11px] text-red-800 leading-snug">{e}</span>
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Warnings</div>
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  <span className="text-orange-500 flex-shrink-0 text-[11px] mt-px font-bold">⚠</span>
                  <span className="text-[11px] text-orange-800 leading-snug">{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {hasErrors ? 'Close' : 'Cancel'}
          </button>
          {!hasErrors && (
            <button
              onClick={onExport}
              className="px-4 py-1.5 rounded bg-gray-700 text-white text-xs font-semibold hover:bg-gray-600 transition-colors"
            >
              Export anyway
            </button>
          )}
        </div>
      </div>
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
          ? 'bg-gray-700 text-white border-gray-700 font-semibold'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-transparent')
      }
    >
      <span className="text-sm leading-none">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

