/**
 * CanvasView.jsx — Interactive SVG workspace.
 *
 * Aesthetic: Technical Blueprint — white background, black outlines.
 *
 * Coordinate mapping:
 *   OT x → SVG x  (no flip)
 *   OT y → SVG y  via  svgY = plateY + (yDim − oy) × scale
 *
 * All wells are now flat individual objects — no grid groups.
 * "Multiple Wells" tool replaces "Add Grid".
 */

import { useRef, useState, useEffect, useMemo } from 'react'
import { useLabwareStore, selKey } from '../store/useLabwareStore'
import { useLabelMap } from '../utils/useLabelMap'
import { getWellViolation } from '../utils/validation'

const MARGIN   = 80
const MIN_ZOOM = 0.12
const MAX_ZOOM = 10
const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:            '#F8F9FA',
  dotGrid:       '#D1D5DB',
  plateFill:     '#FFFFFF',
  plateBorder:   '#111827',
  well:          '#FFFFFF',
  wellStroke:    '#111827',
  wellSel:       '#DBEAFE',
  wellSelStk:    '#1D4ED8',
  wellAnchor:    '#EFF6FF',
  wellAnchorS:   '#1E40AF',
  fiduc:         '#374151',
  fiducLight:    '#9CA3AF',
  dim:           '#6B7280',
  axisLabel:     '#374151',
  marquee:       '#1D4ED8',
  marqueeF:      'rgba(29,78,216,0.06)',
  drawRect:      '#374151',
  drawRectF:     'rgba(55,65,81,0.05)',
  a1:            '#EF4444',
  // Violation colours
  vOutsideFill:  '#FEE2E2',
  vOutsideStk:   '#DC2626',
  vClippedFill:  '#FFF7ED',
  vClippedStk:   '#EA580C',
}



// ── Fiducial markers ──────────────────────────────────────────────────────────

function FiducialMarkers({ px, py, pw, ph, scale }) {
  const arm = clamp(scale * 3, 8, 16)
  const corners = [
    [px,      py,      +1, +1],
    [px + pw, py,      -1, +1],
    [px,      py + ph, +1, -1],
    [px + pw, py + ph, -1, -1],
  ]
  return (
    <g fill="none">
      <g stroke={C.fiduc} strokeWidth="1.2">
        {corners.map(([cx, cy, dx, dy], i) => (
          <g key={i}>
            <line x1={cx} y1={cy} x2={cx + dx * arm} y2={cy} />
            <line x1={cx} y1={cy} x2={cx} y2={cy + dy * arm} />
          </g>
        ))}
      </g>
      <g stroke={C.fiducLight} strokeWidth="0.6" strokeDasharray="4 3">
        <line x1={px + pw / 2} y1={py + 5}      x2={px + pw / 2} y2={py + ph - 5} />
        <line x1={px + 5}      y1={py + ph / 2}  x2={px + pw - 5} y2={py + ph / 2} />
      </g>
      <circle cx={px + pw / 2} cy={py + ph / 2} r={1.8} fill={C.fiducLight} stroke="none" />
    </g>
  )
}

// ── Dimension annotations ─────────────────────────────────────────────────────

function DimensionAnnotations({ px, py, pw, ph, xDim, yDim }) {
  const yL = py + ph + 26
  const xL = px - 26
  return (
    <g fill={C.dim} stroke={C.dim} fontFamily="Inter, system-ui, sans-serif">
      <line x1={px}      y1={yL} x2={px + pw} y2={yL} strokeWidth="0.7" />
      <line x1={px}      y1={yL - 3} x2={px}      y2={yL + 3} strokeWidth="0.7" />
      <line x1={px + pw} y1={yL - 3} x2={px + pw} y2={yL + 3} strokeWidth="0.7" />
      <text x={px + pw / 2} y={yL + 11} textAnchor="middle" fontSize="8.5" fill={C.dim} stroke="none">
        {xDim.toFixed(2)} mm
      </text>
      <line x1={xL} y1={py} x2={xL} y2={py + ph} strokeWidth="0.7" />
      <line x1={xL - 3} y1={py}      x2={xL + 3} y2={py}      strokeWidth="0.7" />
      <line x1={xL - 3} y1={py + ph} x2={xL + 3} y2={py + ph} strokeWidth="0.7" />
      <text
        x={xL - 4} y={py + ph / 2}
        textAnchor="middle" fontSize="8.5" fill={C.dim} stroke="none"
        transform={`rotate(-90, ${xL - 4}, ${py + ph / 2})`}
      >
        {yDim.toFixed(2)} mm
      </text>
    </g>
  )
}

// ── Axis labels ───────────────────────────────────────────────────────────────

function AxisLabels({ px, py, scale, yDim, flatWells }) {
  const rows = new Map()
  const cols = new Map()

  flatWells.forEach(({ label, x, y }) => {
    const letter = label.match(/^[A-Z]+/)[0]
    const num    = parseInt(label.match(/\d+/)[0], 10)
    const svgX   = px + x * scale
    const svgY   = py + (yDim - y) * scale
    if (!rows.has(letter)) rows.set(letter, svgY)
    if (!cols.has(num))    cols.set(num,    svgX)
  })

  return (
    <g fill={C.axisLabel} fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="600">
      {[...rows.entries()].map(([letter, sy]) => (
        <text key={letter} x={px - 7} y={sy + 3.5} textAnchor="end">{letter}</text>
      ))}
      {[...cols.entries()].map(([num, sx]) => (
        <text key={num} x={sx} y={py - 7} textAnchor="middle">{num}</text>
      ))}
    </g>
  )
}

// ── Well layer ────────────────────────────────────────────────────────────────
// All wells are now flat individual objects with per-well properties.

function WellLayer({ group, selectedWells, labelMap, px, py, scale, xDim, yDim, onWellMouseDown }) {
  const selKeys   = useMemo(() => new Set(selectedWells.map(selKey)), [selectedWells])
  const anchorKey = selectedWells.length > 0 ? selKey(selectedWells[0]) : null

  const toSvgX = ox => px + ox * scale
  const toSvgY = oy => py + (yDim - oy) * scale

  return (
    <g>
      {group.wells.map(w => {
        const sx       = toSvgX(w.x)
        const sy       = toSvgY(w.y)
        const wellKey  = `${group.id}::id::${w.id}`
        const isSel    = selKeys.has(wellKey)
        const isAnchor = wellKey === anchorKey && selectedWells.length > 1
        const displayLabel = labelMap?.get(wellKey) ?? ''
        const violation    = getWellViolation(w, xDim, yDim)

        // Base fill / stroke from selection state
        const fill   = isAnchor ? C.wellAnchor  : isSel ? C.wellSel    : C.well
        const stroke = isAnchor ? C.wellAnchorS : isSel ? C.wellSelStk : C.wellStroke
        const sw     = isAnchor ? 1.8 : isSel ? 1.5 : 1

        // Violation ring colours
        const vFill = violation === 'outside' ? C.vOutsideFill
                    : violation === 'clipped'  ? C.vClippedFill
                    : null
        const vStk  = violation === 'outside' ? C.vOutsideStk
                    : violation === 'clipped'  ? C.vClippedStk
                    : null

        const showLabel = w.shape === 'circular'
          ? (w.diameter * scale) >= 10
          : (Math.min(w.xDimension, w.yDimension) * scale) >= 10

        const labelSize = clamp(
          w.shape === 'circular'
            ? w.diameter * scale * 0.38
            : Math.min(w.xDimension, w.yDimension) * scale * 0.35,
          5, 9
        )

        if (w.shape === 'circular') {
          const r = Math.max(1.5, (w.diameter / 2) * scale)
          return (
            <g key={w.id} style={{ cursor: 'pointer' }}
              onMouseDown={e => onWellMouseDown(e, group, w.id, w.x, w.y)}>
              {/* Violation outer ring — rendered beneath the well */}
              {violation && (
                <circle cx={sx} cy={sy} r={r + 3} fill={vFill} stroke={vStk} strokeWidth={1.5} opacity={0.85} />
              )}
              <circle cx={sx} cy={sy} r={r} fill={fill} stroke={violation ? vStk : stroke} strokeWidth={violation ? 2 : sw} />
              {showLabel && (
                <text x={sx} y={sy + labelSize * 0.38} textAnchor="middle"
                  fontSize={labelSize} fontFamily="Inter, system-ui, sans-serif"
                  fill={isSel || isAnchor ? C.wellSelStk : '#6B7280'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >{displayLabel}</text>
              )}
            </g>
          )
        }

        const rw = w.xDimension * scale
        const rh = w.yDimension * scale
        return (
          <g key={w.id} style={{ cursor: 'pointer' }}
            onMouseDown={e => onWellMouseDown(e, group, w.id, w.x, w.y)}>
          {/* Violation outer ring */}
          {violation && (
            <rect x={sx - rw / 2 - 3} y={sy - rh / 2 - 3} width={rw + 6} height={rh + 6} rx={3}
              fill={vFill} stroke={vStk} strokeWidth={1.5} opacity={0.85} />
          )}
            <rect x={sx - rw / 2} y={sy - rh / 2} width={rw} height={rh} rx={1.5}
              fill={fill} stroke={violation ? vStk : stroke} strokeWidth={violation ? 2 : sw} />
            {showLabel && (
              <text x={sx} y={sy + labelSize * 0.38} textAnchor="middle"
                fontSize={labelSize} fontFamily="Inter, system-ui, sans-serif"
                fill={isSel || isAnchor ? C.wellSelStk : '#6B7280'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >{displayLabel}</text>
            )}
          </g>
        )
      })}
    </g>
  )
}

// ── Draw preview ──────────────────────────────────────────────────────────────

function DrawPreview({ start, end, px, py, scale, yDim, mode }) {
  const toSvgX = ox => px + ox * scale
  const toSvgY = oy => py + (yDim - oy) * scale
  const x1 = toSvgX(Math.min(start.x, end.x))
  const y1 = toSvgY(Math.max(start.y, end.y))
  const x2 = toSvgX(Math.max(start.x, end.x))
  const y2 = toSvgY(Math.min(start.y, end.y))

  const borderColor = mode === 'marquee' ? C.marquee : C.drawRect
  const fillColor   = mode === 'marquee' ? C.marqueeF : C.drawRectF

  return (
    <g>
      <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1}
        fill={fillColor} stroke={borderColor} strokeWidth={1} strokeDasharray="4 2" />
      {mode !== 'marquee' && (
        <>
          {[[x1, y1], [x2, y1], [x1, y2], [x2, y2]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r={3} fill={borderColor} />
          ))}
        </>
      )}
    </g>
  )
}

// ── Dimension lines ───────────────────────────────────────────────────────────
// Shown when exactly one well is selected. Blueprint-style dotted lines from
// the well centre to the left and front plate edges with mm measurements.

function DimensionLines({ ox, oy, px, py, scale, xDim, yDim }) {
  const cx   = px + ox * scale                 // well centre SVG x
  const cy   = py + (yDim - oy) * scale        // well centre SVG y
  const ledX = px                              // left plate edge (x = 0)
  const fedY = py + yDim * scale               // front plate edge (y = 0 OT)
  const tick = 5
  const col  = '#374151'
  const fs   = 7.5

  return (
    <g style={{ pointerEvents: 'none' }} fontFamily="Inter,ui-monospace,monospace" fontSize={fs} fill={col}>

      {/* ── Left-edge → well (X offset) ── */}
      {ox > 0.1 && (
        <g stroke={col} strokeWidth={0.5}>
          {/* Extension line down from left edge */}
          <line x1={ledX} y1={cy - tick} x2={ledX} y2={cy + tick} />
          {/* Extension line down from well */}
          <line x1={cx}   y1={cy - tick} x2={cx}   y2={cy + tick} />
          {/* Dimension line */}
          <line x1={ledX} y1={cy} x2={cx} y2={cy} strokeDasharray="3 2" />
          {/* Label */}
          <text x={(ledX + cx) / 2} y={cy - 7} textAnchor="middle" stroke="none">
            {ox.toFixed(2)} mm
          </text>
        </g>
      )}

      {/* ── Well → front edge (Y offset) ── */}
      {oy > 0.1 && (
        <g stroke={col} strokeWidth={0.5}>
          {/* Extension line left/right of front edge */}
          <line x1={cx - tick} y1={fedY} x2={cx + tick} y2={fedY} />
          {/* Extension line at well */}
          <line x1={cx - tick} y1={cy}   x2={cx + tick} y2={cy}   />
          {/* Dimension line */}
          <line x1={cx} y1={cy} x2={cx} y2={fedY} strokeDasharray="3 2" />
          {/* Label */}
          <text x={cx + 7} y={(cy + fedY) / 2 + 3} textAnchor="start" stroke="none">
            {oy.toFixed(2)} mm
          </text>
        </g>
      )}
    </g>
  )
}

// ── Bi-well dimension line ────────────────────────────────────────────────────
// Shown when exactly two wells are selected. Draws a drafted dimension line
// between the two well centres with the Euclidean distance label and dashed
// ΔX / ΔY right-angle helper lines.

function BiWellDimensionLine({ ox1, oy1, ox2, oy2, px, py, scale, yDim }) {
  const x1 = px + ox1 * scale
  const y1 = py + (yDim - oy1) * scale
  const x2 = px + ox2 * scale
  const y2 = py + (yDim - oy2) * scale

  const dx   = ox2 - ox1
  const dy   = oy2 - oy1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < 0.01) return null

  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  // Keep label angle readable (never upside-down)
  let angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
  if (angle > 90 || angle < -90) angle += 180

  const col   = '#111827'
  const ghost = '#CBD5E1'

  return (
    <g style={{ pointerEvents: 'none' }} fontFamily="Inter,ui-monospace,monospace">
      <defs>
        <marker id="bw-dim-arrow" markerWidth="7" markerHeight="6"
          refX="6.5" refY="3" orient="auto-start-reverse">
          <path d="M0,0.5 L7,3 L0,5.5 L1.5,3 Z" fill={col} />
        </marker>
      </defs>

      {/* ΔX helper (horizontal) */}
      {Math.abs(dx) > 0.5 && (
        <line x1={x1} y1={y1} x2={x2} y2={y1}
          stroke={ghost} strokeWidth={0.6} strokeDasharray="3 2" />
      )}
      {/* ΔY helper (vertical) */}
      {Math.abs(dy) > 0.5 && (
        <line x1={x2} y1={y1} x2={x2} y2={y2}
          stroke={ghost} strokeWidth={0.6} strokeDasharray="3 2" />
      )}

      {/* Main dimension line with arrowheads */}
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={col} strokeWidth={1}
        markerStart="url(#bw-dim-arrow)"
        markerEnd="url(#bw-dim-arrow)" />

      {/* Distance label — white pill, rotated along the line */}
      <g transform={`translate(${mx},${my}) rotate(${angle})`}>
        <rect x={-26} y={-12} width={52} height={13} rx={2}
          fill="white" stroke={col} strokeWidth={0.5} />
        <text x={0} y={-1.5} textAnchor="middle"
          fill={col} fontSize={8} fontWeight="600">
          {dist.toFixed(2)} mm
        </text>
      </g>
    </g>
  )
}

// ── Background dot grid ───────────────────────────────────────────────────────

function BackgroundGrid() {
  return (
    <>
      <defs>
        <pattern id="bg-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.8" fill={C.dotGrid} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg-dots)" />
    </>
  )
}

// ── Empty-state overlay ───────────────────────────────────────────────────────
// Shown on the canvas when no wells have been placed yet.

function EmptyStateOverlay({ wellGroups, plateX, plateY, plateW, plateH, zoom }) {
  const totalWells = wellGroups.reduce((n, g) => n + g.wells.length, 0)
  if (totalWells > 0) return null

  // Position the card centred on the plate in screen space
  const cx = plateX + plateW / 2
  const cy = plateY + plateH / 2

  const steps = [
    { n: '1', text: 'Select a labware type from the left panel.' },
    { n: '2', text: 'Define the footprint dimensions.' },
    { n: '3', text: 'Use "Add Well/Tip/Tube" or "Add Grid" to place them.' },
    { n: '4', text: 'Select a well, tip, or tube to edit its properties in the right panel.' },
    { n: '5', text: 'Export your design as a JSON file.' },
  ]

  // Scale font/size with zoom so it stays legible but not overwhelming
  const scale = clamp(zoom, 0.5, 1.4)

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Frosted card background */}
      <foreignObject
        x={cx - 180 * scale}
        y={cy - 110 * scale}
        width={360 * scale}
        height={220 * scale}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: '100%', height: '100%',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid #E5E7EB',
            borderRadius: 12 * scale,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: `${20 * scale}px ${24 * scale}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * scale,
          }}
        >
          <div style={{ fontSize: 13 * scale, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', fontFamily: 'Inter, system-ui, sans-serif' }}>
            Start your design
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 * scale }}>
            {steps.map(({ n, text }) => (
              <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 * scale }}>
                <div style={{
                  width: 18 * scale, height: 18 * scale, borderRadius: '50%',
                  background: '#111827', color: '#fff',
                  fontSize: 9 * scale, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontFamily: 'Inter, system-ui, sans-serif',
                }}>
                  {n}
                </div>
                <span style={{ fontSize: 10.5 * scale, color: '#6B7280', lineHeight: 1.45, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </foreignObject>
    </g>
  )
}

// ── Violation overlay ─────────────────────────────────────────────────────────
// Shows a badge summary when any wells violate the plate boundary.

function ViolationOverlay({ wellGroups, xDim, yDim }) {
  let outside = 0
  let clipped = 0
  wellGroups.forEach(g => g.wells.forEach(w => {
    const v = getWellViolation(w, xDim, yDim)
    if (v === 'outside') outside++
    else if (v === 'clipped') clipped++
  }))

  if (outside === 0 && clipped === 0) return null

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
      {outside > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-300 bg-red-50 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-red-700">
            {outside} well{outside !== 1 ? 's' : ''} outside plate bounds
          </span>
        </div>
      )}
      {clipped > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-300 bg-orange-50 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
          <span className="text-[11px] font-semibold text-orange-700">
            {clipped} well{clipped !== 1 ? 's' : ''} partially outside bounds
          </span>
        </div>
      )}
    </div>
  )
}

// ── Status bar ────────────────────────────────────────────────────────────────

function StatusBar({ zoom, xDim, yDim, activeTool, selCount }) {
  const hints = {
    addWell:       '+ Click to place well',
    multipleWells: '⊞ Drag to place multiple wells',
    reservoir:     '▬ Drag to place reservoir',
    erase:         '✕ Click well to delete',
    select:        selCount > 0 ? `${selCount} well${selCount > 1 ? 's' : ''} selected` : '',
  }
  const hint = hints[activeTool] || ''

  return (
    <div className="absolute bottom-2.5 right-3 flex items-center gap-2 pointer-events-none">
      <span className="text-[10px] font-mono bg-white/80 border border-gray-200 text-gray-500 px-2 py-0.5 rounded shadow-sm">
        {(zoom * 100).toFixed(0)}%
      </span>
      <span className="text-[10px] font-mono bg-white/80 border border-gray-200 text-gray-500 px-2 py-0.5 rounded shadow-sm">
        {xDim.toFixed(2)} × {yDim.toFixed(2)} mm
      </span>
      {hint && (
        <span className={
          'text-[10px] font-mono px-2 py-0.5 rounded shadow-sm border ' +
          (activeTool === 'select' && selCount > 0
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-gray-900/80 border-gray-700 text-white animate-pulse')
        }>
          {hint}
        </span>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CanvasView({ fitSignal, exportPngSignal, exportSvgSignal }) {
  const containerRef = useRef()
  const svgRef       = useRef()
  const panRef       = useRef(null)
  const dragRef      = useRef(null)
  const marqueeRef   = useRef(null)

  const [size,              setSize]              = useState({ w: 800, h: 600 })
  const [zoom,              setZoom]              = useState(1)
  const [pan,               setPan]               = useState({ x: 0, y: 0 })
  const [drawRect,          setDrawRect]          = useState(null)
  const [marquee,           setMarquee]           = useState(null)

  const {
    labwareConfig, wellGroups,
    activeTool, selectedGroupId, selectedWells,
    addWellGroup, addManualWell, addMultipleWells,
    moveManualWell, moveSelectedWells,
    removeManualWell, removeSelectedWells, selectGroup,
    setActiveTool, setSelectedWells,
    clearSelection, toggleWellSelection, addWellsToSelection,
    snapshot, setPendingMultiWells, clearPendingMultiWells,
  } = useLabwareStore()

  const { xDimension: xDim, yDimension: yDim } = labwareConfig

  // Global label map — updates reactively whenever any well moves
  const { labelMap, flatWells } = useLabelMap()

  // Resolve single selected well for edge dimension lines
  const singleWell = (() => {
    if (selectedWells.length !== 1 || !selectedWells[0].wellId) return null
    const sel = selectedWells[0]
    const g = wellGroups.find(g => g.id === sel.groupId)
    return g?.wells.find(w => w.id === sel.wellId) ?? null
  })()

  // Resolve two selected wells for bi-well dimension line
  const twoWells = (() => {
    if (selectedWells.length !== 2 || !selectedWells[0].wellId || !selectedWells[1].wellId) return null
    const s0 = selectedWells[0], s1 = selectedWells[1]
    const w0 = wellGroups.find(g => g.id === s0.groupId)?.wells.find(w => w.id === s0.wellId)
    const w1 = wellGroups.find(g => g.id === s1.groupId)?.wells.find(w => w.id === s1.wellId)
    return (w0 && w1) ? [w0, w1] : null
  })()

  // ── Resize observer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([e]) =>
      setSize({ w: e.contentRect.width, h: e.contentRect.height })
    )
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // ── Scale + plate geometry ──────────────────────────────────────────────────
  const baseScale = Math.min(
    (size.w - 2 * MARGIN) / xDim,
    (size.h - 2 * MARGIN) / yDim
  )
  const scale  = baseScale * zoom
  const plateW = xDim * scale
  const plateH = yDim * scale
  const plateX = (size.w - plateW) / 2 + pan.x
  const plateY = (size.h - plateH) / 2 + pan.y

  // ── Coordinate helpers ───────────────────────────────────────────────────────
  const toSvgX    = ox => plateX + ox * scale
  const toSvgY    = oy => plateY + (yDim - oy) * scale
  const toOtX     = sx => (sx - plateX) / scale
  const toOtY     = sy => yDim - (sy - plateY) / scale
  const getSvgXY  = e  => { const r = svgRef.current.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] }
  const clampOT   = (ox, oy) => ({ x: clamp(ox, 0, xDim), y: clamp(oy, 0, yDim) })
  const isOnPlate = (sx, sy) => sx >= plateX && sx <= plateX + plateW && sy >= plateY && sy <= plateY + plateH

  // ── Fit to screen ───────────────────────────────────────────────────────────
  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }) }, [fitSignal])

  // ── Shared SVG builder ───────────────────────────────────────────────────────
  function buildExportSvg() {
    const PX_PER_MM = 6
    const PAD       = 24
    const SW        = 1.5

    const W = xDim * PX_PER_MM + PAD * 2
    const H = yDim * PX_PER_MM + PAD * 2

    const toX = ox =>  PAD + ox * PX_PER_MM
    const toY = oy =>  PAD + (yDim - oy) * PX_PER_MM

    const wellParts = wellGroups.flatMap(group =>
      group.wells.map(w => {
        const cx    = toX(w.x)
        const cy    = toY(w.y)
        const key   = `${group.id}::id::${w.id}`
        const label = labelMap?.get(key) ?? ''

        const minDim    = w.shape === 'circular' ? w.diameter : Math.min(w.xDimension, w.yDimension)
        const fontSize  = Math.min(Math.max(minDim * PX_PER_MM * 0.32, 4), 11)
        const showLabel = minDim * PX_PER_MM >= 10

        const textEl = showLabel && label
          ? `<text x="${cx}" y="${cy + fontSize * 0.38}" text-anchor="middle" font-size="${fontSize}" font-family="Inter, system-ui, sans-serif" fill="#6B7280" style="pointer-events:none">${label}</text>`
          : ''

        if (w.shape === 'circular') {
          const r = (w.diameter / 2) * PX_PER_MM
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#111827" stroke-width="${SW}"/>${textEl}`
        }
        const rw = w.xDimension * PX_PER_MM
        const rh = w.yDimension * PX_PER_MM
        return `<rect x="${cx - rw / 2}" y="${cy - rh / 2}" width="${rw}" height="${rh}" rx="2" fill="#fff" stroke="#111827" stroke-width="${SW}"/>${textEl}`
      })
    )

    return {
      svgStr: [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
        `<rect width="${W}" height="${H}" fill="#ffffff"/>`,
        `<rect x="${PAD}" y="${PAD}" width="${xDim * PX_PER_MM}" height="${yDim * PX_PER_MM}" rx="4" fill="#ffffff" stroke="#111827" stroke-width="${SW}"/>`,
        ...wellParts,
        `</svg>`,
      ].join('\n'),
      W, H,
    }
  }

  // ── Export SVG ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exportSvgSignal) return
    const { svgStr } = buildExportSvg()
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${labwareConfig.loadName || 'labware_design'}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }, [exportSvgSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Export PNG ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!exportPngSignal) return
    const { svgStr, W, H } = buildExportSvg()
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const img  = new Image()
    img.onload = () => {
      const canvas  = document.createElement('canvas')
      canvas.width  = W
      canvas.height = H
      canvas.getContext('2d').drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(pngBlob => {
        const a    = document.createElement('a')
        a.href     = URL.createObjectURL(pngBlob)
        a.download = `${labwareConfig.loadName || 'labware_design'}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }, 'image/png')
    }
    img.src = url
  }, [exportPngSignal]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Wheel zoom ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const handler = e => {
      e.preventDefault()
      setZoom(z => clamp(z * (e.deltaY < 0 ? 1.1 : 0.9), MIN_ZOOM, MAX_ZOOM))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // ── SVG mousedown ───────────────────────────────────────────────────────────
  function handleMouseDown(e) {
    const [sx, sy] = getSvgXY(e)

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      e.preventDefault()
      panRef.current = { startX: sx, startY: sy, origPan: { ...pan } }
      return
    }
    if (e.button !== 0) return

    const onPlate = isOnPlate(sx, sy)
    const ot      = clampOT(toOtX(sx), toOtY(sy))

    if (activeTool === 'addWell' && onPlate) {
      // Use properties of the first selected well as a template, or defaults
      let wellProps = {}
      if (selectedWells.length > 0) {
        const g = wellGroups.find(g => g.id === selectedWells[0].groupId)
        const t = g?.wells.find(w => w.id === selectedWells[0].wellId)
        if (t) wellProps = { shape: t.shape, diameter: t.diameter, xDimension: t.xDimension, yDimension: t.yDimension, depth: t.depth, totalLiquidVolume: t.totalLiquidVolume, bottomShape: t.bottomShape }
      }
      let targetId = selectedGroupId
      if (!wellGroups.find(g => g.id === targetId)) {
        addWellGroup()
        targetId = useLabwareStore.getState().selectedGroupId
      }
      snapshot()
      addManualWell(targetId, ot.x, ot.y, wellProps)
      return
    }

    if ((activeTool === 'multipleWells' || activeTool === 'reservoir') && onPlate) {
      setDrawRect({ start: ot, end: ot })
      return
    }

    if (activeTool === 'select') {
      if (onPlate) {
        marqueeRef.current = { start: ot, additive: e.shiftKey }
        setMarquee({ start: ot, end: ot })
        if (!e.shiftKey) clearSelection()
      } else {
        panRef.current = { startX: sx, startY: sy, origPan: { ...pan } }
      }
    }
  }

  // ── Well mousedown ──────────────────────────────────────────────────────────
  function handleWellMouseDown(e, group, wellId, ox, oy) {
    e.stopPropagation()

    if (activeTool === 'erase') {
      snapshot()
      const clickedIsSelected = selectedWells.some(
        w => w.groupId === group.id && w.wellId === wellId
      )
      if (clickedIsSelected && selectedWells.length > 1) {
        removeSelectedWells()
      } else {
        removeManualWell(group.id, wellId)
      }
      return
    }
    if (activeTool !== 'select') return

    clearPendingMultiWells()
    selectGroup(group.id)
    const label = labelMap?.get(`${group.id}::id::${wellId}`) ?? ''
    const well  = { groupId: group.id, name: label, wellId }

    if (e.shiftKey) {
      toggleWellSelection(well)
    } else {
      const isAlreadySel = selectedWells.some(w => selKey(w) === selKey(well))
      if (!isAlreadySel) setSelectedWells([well])
    }

    const [sx, sy] = getSvgXY(e)
    dragRef.current = {
      groupId: group.id, wellId,
      startSx: sx, startSy: sy,
      lastSx: sx, lastSy: sy,
      origOtX: ox, origOtY: oy,
      moved: false,
      snapshotted: false,
    }
  }

  // ── SVG mousemove ───────────────────────────────────────────────────────────
  function handleMouseMove(e) {
    const [sx, sy] = getSvgXY(e)

    if (panRef.current) {
      const { startX, startY, origPan } = panRef.current
      setPan({ x: origPan.x + sx - startX, y: origPan.y + sy - startY })
      return
    }

    if (drawRect) {
      setDrawRect(prev => ({ ...prev, end: clampOT(toOtX(sx), toOtY(sy)) }))
      return
    }

    if (marquee && marqueeRef.current) {
      setMarquee(prev => ({ ...prev, end: clampOT(toOtX(sx), toOtY(sy)) }))
      return
    }

    if (dragRef.current) {
      const d = dragRef.current

      if (!d.snapshotted) {
        snapshot()
        d.snapshotted = true
      }

      d.moved = true

      const hasMultiSel = selectedWells.length > 1 &&
        selectedWells.some(w => w.groupId === d.groupId && w.wellId === d.wellId)

      if (hasMultiSel) {
        // Use incremental per-frame delta to avoid accumulated displacement
        const dOtX =  (sx - d.lastSx) / scale
        const dOtY = -(sy - d.lastSy) / scale
        moveSelectedWells(dOtX, dOtY, xDim, yDim)
      } else {
        // Single-well: absolute from origin — no accumulation issue
        const dOtX =  (sx - d.startSx) / scale
        const dOtY = -(sy - d.startSy) / scale
        moveManualWell(d.groupId, d.wellId,
          clamp(d.origOtX + dOtX, 0, xDim),
          clamp(d.origOtY + dOtY, 0, yDim)
        )
      }

      d.lastSx = sx
      d.lastSy = sy
    }
  }

  // ── SVG mouseup ─────────────────────────────────────────────────────────────
  function handleMouseUp(e) {
    panRef.current  = null
    dragRef.current = null

    if (drawRect) {
      const dx = Math.abs(drawRect.end.x - drawRect.start.x)
      const dy = Math.abs(drawRect.end.y - drawRect.start.y)
      if (dx > 2 || dy > 2) {
        setPendingMultiWells({
          x1: Math.min(drawRect.start.x, drawRect.end.x),
          y1: Math.min(drawRect.start.y, drawRect.end.y),
          x2: Math.max(drawRect.start.x, drawRect.end.x),
          y2: Math.max(drawRect.start.y, drawRect.end.y),
        })
      }
      setDrawRect(null)
      return
    }

    if (marquee && marqueeRef.current) {
      const { start, end } = marquee
      const { additive }   = marqueeRef.current
      marqueeRef.current   = null
      setMarquee(null)

      const x1 = Math.min(start.x, end.x)
      const x2 = Math.max(start.x, end.x)
      const y1 = Math.min(start.y, end.y)
      const y2 = Math.max(start.y, end.y)
      if (x2 - x1 < 0.5 && y2 - y1 < 0.5) return

      const captured = []
      wellGroups.forEach(group => {
        group.wells.forEach(w => {
          if (w.x >= x1 && w.x <= x2 && w.y >= y1 && w.y <= y2) {
            const lbl = labelMap?.get(`${group.id}::id::${w.id}`) ?? ''
            captured.push({ groupId: group.id, name: lbl, wellId: w.id })
          }
        })
      })

      if (additive) addWellsToSelection(captured)
      else          setSelectedWells(captured)
    }
  }

  // ── Cursor ──────────────────────────────────────────────────────────────────
  const cursorMap = {
    select: 'default', addWell: 'crosshair',
    multipleWells: 'crosshair', reservoir: 'crosshair', erase: 'not-allowed',
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 overflow-hidden"
      style={{ background: C.bg, cursor: cursorMap[activeTool] || 'default' }}
    >
      <svg
        ref={svgRef}
        width={size.w}
        height={size.h}
        style={{ display: 'block', userSelect: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <BackgroundGrid />

        <rect x={plateX + 2} y={plateY + 2} width={plateW} height={plateH}
          rx={3} fill="rgba(0,0,0,0.06)" />
        <rect x={plateX} y={plateY} width={plateW} height={plateH}
          rx={2} fill={C.plateFill} stroke={C.plateBorder} strokeWidth={1.5} />

        <FiducialMarkers px={plateX} py={plateY} pw={plateW} ph={plateH} scale={scale} />
        <DimensionAnnotations px={plateX} py={plateY} pw={plateW} ph={plateH} xDim={xDim} yDim={yDim} />
        <AxisLabels px={plateX} py={plateY} scale={scale} yDim={yDim} flatWells={flatWells} />

        <EmptyStateOverlay
          wellGroups={wellGroups}
          plateX={plateX} plateY={plateY}
          plateW={plateW} plateH={plateH}
          zoom={zoom}
        />

        {wellGroups.map(group => (
          <WellLayer
            key={group.id}
            group={group}
            selectedWells={selectedWells}
            labelMap={labelMap}
            px={plateX} py={plateY}
            scale={scale} xDim={xDim} yDim={yDim}
            onWellMouseDown={handleWellMouseDown}
          />
        ))}

        {singleWell && (
          <DimensionLines
            ox={singleWell.x} oy={singleWell.y}
            px={plateX} py={plateY}
            scale={scale} xDim={xDim} yDim={yDim}
          />
        )}

        {twoWells && (
          <BiWellDimensionLine
            ox1={twoWells[0].x} oy1={twoWells[0].y}
            ox2={twoWells[1].x} oy2={twoWells[1].y}
            px={plateX} py={plateY} scale={scale} yDim={yDim}
          />
        )}

        {drawRect && (
          <DrawPreview start={drawRect.start} end={drawRect.end}
            px={plateX} py={plateY} scale={scale} yDim={yDim} mode="draw" />
        )}
        {marquee && (
          <DrawPreview start={marquee.start} end={marquee.end}
            px={plateX} py={plateY} scale={scale} yDim={yDim} mode="marquee" />
        )}
      </svg>

      <ViolationOverlay wellGroups={wellGroups} xDim={xDim} yDim={yDim} />
      <StatusBar zoom={zoom} xDim={xDim} yDim={yDim} activeTool={activeTool} selCount={selectedWells.length} />

      <AxisIndicator />
    </div>
  )
}

// ── Axis orientation indicator ────────────────────────────────────────────────
// Fixed bottom-left corner; does not move with pan/zoom.
// Shows the Opentrons XY coordinate system: +X right, +Y toward back (up).

function AxisIndicator() {
  const L  = 28  // arrow length
  const ox = 16  // origin x within the svg
  const oy = 54  // origin y within the svg (leaves room above for BACK label + Y arrow)

  return (
    <svg
      className="absolute bottom-3 left-3 pointer-events-none select-none"
      width={ox + L + 22}
      height={oy + 18}
      overflow="visible"
    >
      <defs>
        <marker id="ax-head" markerWidth="5" markerHeight="5"
          refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 L1,2.5 Z" fill="#9CA3AF" />
        </marker>
      </defs>

      {/* +X axis — points right */}
      <line x1={ox} y1={oy} x2={ox + L} y2={oy}
        stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ax-head)" />
      <text x={ox + L + 5} y={oy + 3.5}
        fill="#9CA3AF" fontSize="9" fontFamily="Inter,system-ui,sans-serif"
        fontWeight="700">X</text>

      {/* +Y axis — points up (Opentrons +Y = back = screen up) */}
      <line x1={ox} y1={oy} x2={ox} y2={oy - L}
        stroke="#9CA3AF" strokeWidth="1.5" markerEnd="url(#ax-head)" />
      <text x={ox} y={oy - L - 5}
        fill="#9CA3AF" fontSize="9" fontFamily="Inter,system-ui,sans-serif"
        fontWeight="700" textAnchor="middle">Y</text>

      {/* Origin dot */}
      <circle cx={ox} cy={oy} r={2.5} fill="#9CA3AF" />

    </svg>
  )
}
