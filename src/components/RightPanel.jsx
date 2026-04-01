/**
 * RightPanel.jsx — Selection-driven property panel (right sidebar).
 * Appears when one or more wells are selected.
 * Contains: Align & Distribute, Well Properties, Measurement, Spacing to Neighbor.
 */

import { useState, useEffect, useRef } from 'react'
import { useLabwareStore, selKey } from '../store/useLabwareStore'
import { useLabelMap } from '../utils/useLabelMap'

// ── Shared primitives ──────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
      <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500">
        {children}
      </span>
    </div>
  )
}

function Field({ label, unit, children }) {
  return (
    <div className="flex items-center justify-between gap-1.5 py-0.5">
      <label className="text-[10px] text-gray-500 flex-shrink-0 w-[80px] leading-none">
        {label}
      </label>
      <div className="flex items-center gap-1 min-w-0 flex-1">
        {children}
        {unit && <span className="text-[9px] text-gray-400 flex-shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

const inp =
  'w-full bg-white border border-gray-900 rounded px-2 py-0.5 text-[11px] ' +
  'text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-2 ' +
  'focus:ring-blue-200 transition-colors'

function NumInput({ value, onChange, onFocus: onFocusCb, min = 0, max, step = 0.1 }) {
  const [str, setStr] = useState(String(value))
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) setStr(String(value))
  }, [value])

  function commit(raw) {
    const v = parseFloat(raw)
    if (isNaN(v) || !isFinite(v)) return false
    const safe = max !== undefined ? Math.min(max, v) : v
    onChange(safe)
    return true
  }

  return (
    <input
      type="number"
      className={inp}
      value={str}
      min={min}
      max={max}
      step={step}
      onFocus={() => { isFocused.current = true; onFocusCb?.() }}
      onChange={e => setStr(e.target.value)}
      onBlur={e => {
        isFocused.current = false
        if (!commit(e.target.value)) setStr(String(value))
      }}
    />
  )
}

function Seg({ options, value, onChange }) {
  return (
    <div className="flex rounded overflow-hidden border border-gray-300 w-full">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            'flex-1 text-[10px] py-0.5 px-1 transition-colors truncate ' +
            (value === o.value
              ? 'bg-gray-900 text-white font-semibold'
              : 'bg-white text-gray-600 hover:bg-gray-100')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function SelectEl({ value, onChange, options }) {
  return (
    <select
      className={inp + ' cursor-pointer'}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

const opBtnCls = ok =>
  'py-1.5 rounded border text-[10px] font-medium transition-colors ' +
  (ok
    ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-700'
    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed')

function nextRowLetter(row) {
  const chars = row.split('')
  let i = chars.length - 1
  while (i >= 0) {
    if (chars[i] < 'Z') { chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1); break }
    chars[i] = 'A'
    i--
  }
  if (i < 0) chars.unshift('A')
  return chars.join('')
}

// ── Section: Align & Distribute ───────────────────────────────────────────────

function AlignSection() {
  const {
    selectedWells, alignH, alignV, distributeH, distributeV, clearSelection,
    copySelectedWells, pasteWells, clipboard,
    alignToPlateLeft, alignToPlateCenterH, alignToPlateRight,
    alignToPlateTop, alignToPlateCenterV, alignToPlateBottom,
    snapshot,
  } = useLabwareStore()
  const [gapStr, setGapStr] = useState('')
  const { labelMap } = useLabelMap()

  if (selectedWells.length < 1) return null

  const anchor      = selectedWells[0]
  const anchorLabel = anchor ? (labelMap.get(selKey(anchor)) ?? anchor.name) : '—'

  const canMulti      = selectedWells.filter(w => w.wellId !== null).length >= 2
  const gapValue      = gapStr === '' ? null : parseFloat(gapStr)
  const gapValid      = gapStr === '' || (!isNaN(gapValue) && gapValue >= 0)

  const plateBtnCls = 'flex-1 py-1.5 rounded border text-[10px] font-medium transition-colors ' +
    'border-gray-900 bg-gray-900 text-white hover:bg-gray-700'

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>Align &amp; Distribute</SectionHeader>
      <div className="px-3 py-2.5 space-y-2.5">

        {/* Selection count + copy/paste/clear */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-600">
            <span className="font-semibold text-gray-900">{selectedWells.length}</span> well{selectedWells.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={copySelectedWells}
              title="Copy selected wells  [Ctrl+C]"
              className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >⎘ Copy</button>
            {clipboard && (
              <button
                onClick={pasteWells}
                title="Paste wells (+5 mm offset)  [Ctrl+V]"
                className="text-[9px] px-1.5 py-0.5 rounded border border-gray-900 bg-gray-900 text-white hover:bg-gray-700 transition-colors"
              >⎘ Paste</button>
            )}
            <button onClick={clearSelection} className="text-[9px] text-gray-400 hover:text-gray-700 transition-colors">
              ✕ Clear
            </button>
          </div>
        </div>

        {/* Align to plate */}
        <div>
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Align to Plate</div>
          <div className="grid grid-cols-3 gap-1.5">
            <button onClick={() => { snapshot(); alignToPlateLeft() }}    className={plateBtnCls} title="Align left edges to plate left edge">⇤ Left</button>
            <button onClick={() => { snapshot(); alignToPlateCenterH() }} className={plateBtnCls} title="Center on horizontal axis">↔ Center</button>
            <button onClick={() => { snapshot(); alignToPlateRight() }}   className={plateBtnCls} title="Align right edges to plate right edge">⇥ Right</button>
            <button onClick={() => { snapshot(); alignToPlateTop() }}     className={plateBtnCls} title="Align top edges to plate back edge">⤒ Top</button>
            <button onClick={() => { snapshot(); alignToPlateCenterV() }} className={plateBtnCls} title="Center on vertical axis">↕ Middle</button>
            <button onClick={() => { snapshot(); alignToPlateBottom() }}  className={plateBtnCls} title="Align bottom edges to plate front edge">⤓ Bottom</button>
          </div>
        </div>

        {/* Align / Distribute (multi-select only) */}
        {canMulti && (
          <>
            <div className="text-[9px] bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-500">
              Anchor: <span className="font-semibold text-gray-800">{anchorLabel}</span>
              <span className="text-gray-400"> (first selected)</span>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Align to Each Other</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={alignH} className={opBtnCls(true)}>↔ Align H</button>
                <button onClick={alignV} className={opBtnCls(true)}>↕ Align V</button>
              </div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1.5">Distribute</div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex items-center gap-1 flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
                  <span className="text-[9px] text-gray-500 flex-shrink-0">Gap</span>
                  <input
                    type="number" min="0" step="0.1" placeholder="auto"
                    value={gapStr} onChange={e => setGapStr(e.target.value)}
                    className={'flex-1 bg-transparent text-[11px] text-right focus:outline-none ' + (gapValid ? 'text-gray-800' : 'text-red-500')}
                  />
                  <span className="text-[9px] text-gray-400 flex-shrink-0">mm</span>
                </div>
                {gapStr !== '' && (
                  <button onClick={() => setGapStr('')} className="text-[9px] text-gray-400 hover:text-gray-700 flex-shrink-0" title="Reset to symmetric">✕</button>
                )}
              </div>
              <div className="text-[9px] text-gray-400 mb-1.5">
                {gapStr === '' ? 'Symmetric — equal center spacing between outermost' : `Fixed ${gapValue >= 0 ? gapValue?.toFixed(2) : '?'} mm edge-to-edge gap`}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => { if (gapValid) distributeH(gapValue) }} disabled={!gapValid} className={opBtnCls(gapValid)}>⟺ Dist. H</button>
                <button onClick={() => { if (gapValid) distributeV(gapValue) }} disabled={!gapValid} className={opBtnCls(gapValid)}>⟷ Dist. V</button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

// ── Section: Well Properties ───────────────────────────────────────────────────

function WellPropertiesSection() {
  const {
    wellGroups, selectedWells,
    updateSelectedWells, moveSelectedWells,
    labwareConfig, snapshot,
  } = useLabwareStore()
  const { labelMap } = useLabelMap()

  // Anchor index: which selected well the edge-offset inputs reference
  const [anchorIdx, setAnchorIdx] = useState(0)

  // Reset anchor when the selection identity changes
  const selFingerprint = selectedWells.map(w => w.wellId).join(',')
  useEffect(() => { setAnchorIdx(0) }, [selFingerprint]) // eslint-disable-line react-hooks/exhaustive-deps

  if (selectedWells.length === 0) return null

  const count    = selectedWells.length
  const isMulti  = count > 1
  const safeIdx  = Math.min(anchorIdx, count - 1)

  // Reference well for shape/depth/volume display (always first)
  const firstSel   = selectedWells[0]
  const firstGroup = wellGroups.find(g => g.id === firstSel.groupId)
  const firstWell  = firstGroup?.wells.find(w => w.id === firstSel.wellId)

  // Anchor well for edge-offset inputs (user-chosen)
  const anchorSel   = selectedWells[safeIdx]
  const anchorGroup = wellGroups.find(g => g.id === anchorSel.groupId)
  const anchorWell  = anchorGroup?.wells.find(w => w.id === anchorSel.wellId)

  if (!firstWell || !anchorWell) return null

  function patch(p) { updateSelectedWells(p) }

  // Moving the anchor moves all selected wells by the same delta
  function setX(newX) {
    const dx = newX - anchorWell.x
    moveSelectedWells(dx, 0, labwareConfig.xDimension, labwareConfig.yDimension)
  }
  function setY(newY) {
    const dy = newY - anchorWell.y
    moveSelectedWells(0, dy, labwareConfig.xDimension, labwareConfig.yDimension)
  }

  // Build label options for the anchor selector
  const anchorOptions = selectedWells.map((sw, i) => {
    const key   = `${sw.groupId}::id::${sw.wellId}`
    const label = labelMap.get(key) ?? sw.name ?? `Well ${i + 1}`
    return { value: String(i), label }
  })

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>
        Well Properties{isMulti && <span className="ml-1 normal-case font-normal text-gray-400">({count} selected)</span>}
      </SectionHeader>
      <div className="px-3 py-2 space-y-1.5">

        <Field label="Shape">
          <Seg
            value={firstWell.shape}
            onChange={v => { snapshot(); patch({ shape: v }) }}
            options={[
              { label: '○ Circular',  value: 'circular'     },
              { label: '□ Rect',      value: 'rectangular'  },
            ]}
          />
        </Field>

        {firstWell.shape === 'circular' ? (
          <Field label="Diameter" unit="mm">
            <NumInput value={firstWell.diameter} onChange={v => patch({ diameter: v })} onFocus={snapshot} min={0} />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-x-1">
            <Field label="W" unit="mm">
              <NumInput value={firstWell.xDimension} onChange={v => patch({ xDimension: v })} onFocus={snapshot} min={0} />
            </Field>
            <Field label="H" unit="mm">
              <NumInput value={firstWell.yDimension} onChange={v => patch({ yDimension: v })} onFocus={snapshot} min={0} />
            </Field>
          </div>
        )}

        <Field label="Depth" unit="mm">
          <NumInput value={firstWell.depth} onChange={v => patch({ depth: v })} onFocus={snapshot} min={0} />
        </Field>

        <Field label="Volume" unit="µL">
          <NumInput value={firstWell.totalLiquidVolume} onChange={v => patch({ totalLiquidVolume: v })} onFocus={snapshot} min={0} step={1} />
        </Field>

        <Field label="Bottom">
          <SelectEl
            value={firstWell.bottomShape}
            onChange={v => { snapshot(); patch({ bottomShape: v }) }}
            options={[
              { label: 'Flat',     value: 'flat' },
              { label: 'U-bottom', value: 'u'    },
              { label: 'V-bottom', value: 'v'    },
            ]}
          />
        </Field>

        {/* Edge Offsets — anchor-relative when multi-select */}
        <div className="border-t border-gray-100 pt-1.5 space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-gray-400">
            Edge Offsets
          </div>

          {isMulti && (
            <Field label="Anchor well">
              <SelectEl
                value={String(safeIdx)}
                onChange={v => setAnchorIdx(parseInt(v))}
                options={anchorOptions}
              />
            </Field>
          )}

          <Field label="Left edge" unit="mm">
            <NumInput value={+anchorWell.x.toFixed(3)} onChange={setX} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <Field label="Front edge" unit="mm">
            <NumInput value={+anchorWell.y.toFixed(3)} onChange={setY} onFocus={snapshot} min={0} step={0.01} />
          </Field>

          {isMulti ? (
            <div className="text-[9px] text-gray-400 pt-0.5">
              Moving anchor shifts all {count} wells by the same delta
            </div>
          ) : (
            <div className="text-[9px] text-gray-400 pt-0.5">
              X = dist. from left plate edge · Y = dist. from front
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Section: Measurement (2 wells selected) ───────────────────────────────────

function MeasurementSection() {
  const { wellGroups, selectedWells, snapshot, applyRelativeDelta, setWellPositions } = useLabwareStore()
  const { labelMap, flatWells } = useLabelMap()

  const origTargetRef = useRef({ x: 0, y: 0 })

  const isActive = selectedWells.length === 2
    && !!selectedWells[0]?.wellId && !!selectedWells[1]?.wellId

  const sel0 = selectedWells[0] ?? null
  const sel1 = selectedWells[1] ?? null

  const anchor = isActive
    ? (wellGroups.find(g => g.id === sel0.groupId)?.wells.find(w => w.id === sel0.wellId) ?? null)
    : null
  const target = isActive
    ? (wellGroups.find(g => g.id === sel1.groupId)?.wells.find(w => w.id === sel1.wellId) ?? null)
    : null

  const selPairKey = isActive ? `${sel0.wellId}::${sel1.wellId}` : ''

  useEffect(() => {
    if (isActive && target) {
      origTargetRef.current = { x: target.x, y: target.y }
    }
  }, [selPairKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!anchor || !target) return null

  const anchorKey   = `${sel0.groupId}::id::${sel0.wellId}`
  const targetKey   = `${sel1.groupId}::id::${sel1.wellId}`
  const anchorLabel = labelMap.get(anchorKey) ?? '—'
  const targetLabel = labelMap.get(targetKey) ?? '—'

  const dx   = target.x - anchor.x
  const dy   = target.y - anchor.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  function setDX(newDX) {
    snapshot()
    applyRelativeDelta(sel0.groupId, sel0.wellId, sel1.groupId, sel1.wellId, 'x', newDX)
  }
  function setDY(newDY) {
    snapshot()
    applyRelativeDelta(sel0.groupId, sel0.wellId, sel1.groupId, sel1.wellId, 'y', newDY)
  }

  function applyDXToRow() {
    const rowMatch = targetLabel.match(/^([A-Z]+)/)
    if (!rowMatch) return
    const rowLetter = rowMatch[1]
    const shiftX = target.x - origTargetRef.current.x
    if (Math.abs(shiftX) < 0.001) return
    const updates = flatWells
      .filter(fw => fw.label.match(/^([A-Z]+)/)?.[1] === rowLetter && fw.key !== targetKey)
      .map(fw => { const [gid, wid] = fw.key.split('::id::'); return { groupId: gid, wellId: wid, x: fw.x + shiftX } })
    snapshot()
    setWellPositions(updates)
    origTargetRef.current.x = target.x
  }

  function applyDYToColumn() {
    const colMatch = targetLabel.match(/(\d+)$/)
    if (!colMatch) return
    const colNum = colMatch[1]
    const shiftY = target.y - origTargetRef.current.y
    if (Math.abs(shiftY) < 0.001) return
    const updates = flatWells
      .filter(fw => fw.label.match(/(\d+)$/)?.[1] === colNum && fw.key !== targetKey)
      .map(fw => { const [gid, wid] = fw.key.split('::id::'); return { groupId: gid, wellId: wid, y: fw.y + shiftY } })
    snapshot()
    setWellPositions(updates)
    origTargetRef.current.y = target.y
  }

  const statRow = (label, value) => (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[10px] text-gray-500 w-[80px] flex-shrink-0">{label}</span>
      <span className="text-[11px] font-mono font-semibold text-gray-900">{value}</span>
    </div>
  )

  const applyBtn = 'mt-1 w-full py-1 text-[10px] font-semibold rounded border border-gray-900 ' +
    'bg-white text-gray-900 hover:bg-gray-900 hover:text-white transition-colors'

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>Measurement</SectionHeader>
      <div className="px-3 py-2.5 space-y-2.5">

        <div className="flex gap-2 text-[9px]">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <div className="text-gray-400 uppercase tracking-widest mb-0.5">Anchor (fixed)</div>
            <div className="font-bold text-gray-900 text-[11px]">{anchorLabel}</div>
          </div>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1">
            <div className="text-gray-400 uppercase tracking-widest mb-0.5">Target (mobile)</div>
            <div className="font-bold text-gray-900 text-[11px]">{targetLabel}</div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 space-y-0.5">
          {statRow('ΔX (horiz.)', `${Math.abs(dx).toFixed(2)} mm`)}
          {statRow('ΔY (vert.)',  `${Math.abs(dy).toFixed(2)} mm`)}
          {statRow('Distance',   `${dist.toFixed(2)} mm`)}
        </div>

        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-gray-400">Set ΔX</div>
          <Field label="Target X +" unit="mm">
            <NumInput value={+dx.toFixed(3)} onChange={setDX} onFocus={() => {
              origTargetRef.current.x = target.x; snapshot()
            }} step={0.01} />
          </Field>
          <div className="text-[9px] text-gray-400">
            Anchor {anchorLabel} at x={anchor.x.toFixed(2)} → target moves to {(anchor.x + dx).toFixed(2)}
          </div>
          <button onClick={applyDXToRow} className={applyBtn}>
            Apply ΔX shift to Row {targetLabel.match(/^[A-Z]+/)?.[0] ?? ''}
          </button>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-2">
          <div className="text-[9px] uppercase tracking-widest text-gray-400">Set ΔY</div>
          <Field label="Target Y +" unit="mm">
            <NumInput value={+dy.toFixed(3)} onChange={setDY} onFocus={() => {
              origTargetRef.current.y = target.y; snapshot()
            }} step={0.01} />
          </Field>
          <div className="text-[9px] text-gray-400">
            Anchor {anchorLabel} at y={anchor.y.toFixed(2)} → target moves to {(anchor.y + dy).toFixed(2)}
          </div>
          <button onClick={applyDYToColumn} className={applyBtn}>
            Apply ΔY shift to Column {targetLabel.match(/\d+$/)?.[0] ?? ''}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Section: Spacing to Neighbor ──────────────────────────────────────────────

function SpacingSection() {
  const { wellGroups, selectedWells, snapshot, setWellPositions } = useLabwareStore()
  const { labelMap, flatWells } = useLabelMap()

  const [xPitch, setXPitch] = useState(9)
  const [yPitch, setYPitch] = useState(9)

  const sel       = selectedWells.length === 1 ? selectedWells[0] : null
  const wellKey   = sel?.wellId ? `${sel.groupId}::id::${sel.wellId}` : null
  const label     = wellKey ? (labelMap.get(wellKey) ?? null) : null
  const match     = label ? label.match(/^([A-Z]+)(\d+)$/) : null
  const rowLetter = match ? match[1] : ''
  const colNum    = match ? parseInt(match[2]) : 0
  const grp       = sel ? wellGroups.find(g => g.id === sel.groupId) : null
  const well      = grp ? grp.wells.find(w => w.id === sel.wellId) : null

  const byLabel       = new Map(flatWells.map(fw => [fw.label, fw]))
  const rightNeighbor = rowLetter ? byLabel.get(`${rowLetter}${colNum + 1}`) ?? null : null
  const belowNeighbor = rowLetter ? byLabel.get(`${nextRowLetter(rowLetter)}${colNum}`) ?? null : null
  const measuredX     = (rightNeighbor && well) ? +(rightNeighbor.x - well.x).toFixed(3) : null
  const measuredY     = (belowNeighbor && well) ? +(well.y - belowNeighbor.y).toFixed(3) : null

  useEffect(() => {
    if (measuredX !== null) setXPitch(measuredX)
  }, [wellKey]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (measuredY !== null) setYPitch(measuredY)
  }, [wellKey]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!well || !match) return null

  function applyToRow() {
    const rowWells = flatWells
      .filter(fw => { const m = fw.label.match(/^([A-Z]+)\d+$/); return m && m[1] === rowLetter })
      .sort((a, b) => parseInt(a.label.match(/\d+$/)[0]) - parseInt(b.label.match(/\d+$/)[0]))
    if (rowWells.length === 0) return
    const anchorX = rowWells[0].x
    const updates = rowWells.map((fw, i) => {
      const [gid, wid] = fw.key.split('::id::')
      return { groupId: gid, wellId: wid, x: anchorX + i * xPitch }
    })
    snapshot()
    setWellPositions(updates)
  }

  function applyToColumn() {
    const colWells = flatWells
      .filter(fw => { const m = fw.label.match(/^[A-Z]+(\d+)$/); return m && parseInt(m[1]) === colNum })
      .sort((a, b) => {
        const ra = a.label.match(/^([A-Z]+)/)[1]
        const rb = b.label.match(/^([A-Z]+)/)[1]
        return ra < rb ? -1 : ra > rb ? 1 : 0
      })
    if (colWells.length === 0) return
    const anchorY = colWells[0].y
    const updates = colWells.map((fw, i) => {
      const [gid, wid] = fw.key.split('::id::')
      return { groupId: gid, wellId: wid, y: anchorY - i * yPitch }
    })
    snapshot()
    setWellPositions(updates)
  }

  const applyBtn = 'w-full py-1 text-[10px] font-semibold rounded border border-gray-900 ' +
    'bg-white text-gray-900 hover:bg-gray-900 hover:text-white transition-colors'

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>Spacing to Neighbor</SectionHeader>
      <div className="px-3 py-2.5 space-y-3">

        <div className="space-y-1">
          <div className="text-[9px] uppercase tracking-widest text-gray-400">
            X Pitch — horizontal
          </div>
          <Field label="Distance" unit="mm">
            <NumInput value={xPitch} onChange={setXPitch} min={0.01} step={0.01} />
          </Field>
          {rightNeighbor
            ? <div className="text-[9px] text-gray-400">
                → Right: <span className="font-semibold text-gray-700">{rowLetter}{colNum + 1}</span>
                &nbsp;· current {measuredX?.toFixed(2)} mm
              </div>
            : <div className="text-[9px] text-gray-400 italic">No right neighbour in row {rowLetter}</div>
          }
          <button onClick={applyToRow} className={applyBtn}>
            Apply uniform X to Row {rowLetter}
          </button>
        </div>

        <div className="space-y-1 border-t border-gray-100 pt-2.5">
          <div className="text-[9px] uppercase tracking-widest text-gray-400">
            Y Pitch — vertical
          </div>
          <Field label="Distance" unit="mm">
            <NumInput value={yPitch} onChange={setYPitch} min={0.01} step={0.01} />
          </Field>
          {belowNeighbor
            ? <div className="text-[9px] text-gray-400">
                ↓ Below: <span className="font-semibold text-gray-700">{nextRowLetter(rowLetter)}{colNum}</span>
                &nbsp;· current {measuredY?.toFixed(2)} mm
              </div>
            : <div className="text-[9px] text-gray-400 italic">No well below in column {colNum}</div>
          }
          <button onClick={applyToColumn} className={applyBtn}>
            Apply uniform Y to Column {colNum}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Section: Place Multiple Wells ─────────────────────────────────────────────

function MultiWellsSection() {
  const { pendingMultiWells, clearPendingMultiWells, addWellGroup, addMultipleWells,
          setSelectedWells, setActiveTool, snapshot } = useLabwareStore()

  const region = pendingMultiWells?.region ?? null

  const w = region ? Math.abs(region.x2 - region.x1) : 0
  const h = region ? Math.abs(region.y2 - region.y1) : 0

  const [rows,   setRows]   = useState('4')
  const [cols,   setCols]   = useState('6')
  const [xSp,    setXSp]    = useState(9)
  const [ySp,    setYSp]    = useState(9)
  const [xStart, setXStart] = useState(0)
  const [yStart, setYStart] = useState(0)

  const rowsNum = parseInt(rows) || 0
  const colsNum = parseInt(cols) || 0
  const rowsValid = rowsNum >= 1
  const colsValid = colsNum >= 1

  // Sync inputs whenever a new region is drawn
  const regionKey = region ? `${region.x1},${region.y1},${region.x2},${region.y2}` : ''
  useEffect(() => {
    if (!region) return
    const c = parseInt(cols) || 1
    const r = parseInt(rows) || 1
    setXSp(+(c > 1 ? w / (c - 1) : 9).toFixed(2))
    setYSp(+(r > 1 ? h / (r - 1) : 9).toFixed(2))
    setXStart(+region.x1.toFixed(2))
    setYStart(+region.y2.toFixed(2))
  }, [regionKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = parseInt(cols) || 1
    if (region) setXSp(+(c > 1 ? w / (c - 1) : 9).toFixed(2))
  }, [cols]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const r = parseInt(rows) || 1
    if (region) setYSp(+(r > 1 ? h / (r - 1) : 9).toFixed(2))
  }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!region) return null

  function handleAdd() {
    if (!rowsValid || !colsValid) return
    snapshot()
    addWellGroup({ name: `Wells ${rowsNum}×${colsNum}` })
    const groupId = useLabwareStore.getState().selectedGroupId
    const positions = []
    for (let r = 0; r < rowsNum; r++) {
      for (let c = 0; c < colsNum; c++) {
        positions.push({ x: xStart + c * xSp, y: yStart - r * ySp })
      }
    }
    addMultipleWells(groupId, positions)
    clearPendingMultiWells()
    setActiveTool('select')
    const newGroup = useLabwareStore.getState().wellGroups.find(g => g.id === groupId)
    if (newGroup) {
      setSelectedWells(newGroup.wells.map(w => ({ groupId, name: '', wellId: w.id })))
    }
  }

  const spinBtn = 'w-6 h-6 flex-shrink-0 flex items-center justify-center bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200'

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>Place Multiple Wells</SectionHeader>
      <div className="px-3 py-2 space-y-1.5">

        <div className="text-[9px] text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1">
          Region: {w.toFixed(1)} × {h.toFixed(1)} mm
        </div>

        {/* Rows */}
        <div>
          <Field label="Rows">
            <div className="flex items-center gap-1 w-full">
              <button onClick={() => setRows(v => String(Math.max(1, (parseInt(v) || 0) - 1)))} className={spinBtn}>−</button>
              <input
                type="number" min={1} max={64}
                className={inp + (!rowsValid ? ' border-red-500 focus:border-red-500 focus:ring-red-200' : '')}
                value={rows}
                onChange={e => setRows(e.target.value)}
              />
              <button onClick={() => setRows(v => String(Math.min(64, (parseInt(v) || 0) + 1)))} className={spinBtn}>+</button>
            </div>
          </Field>
          {!rowsValid && (
            <div className="text-[9px] text-red-500 mt-0.5 pl-[84px]">Must be at least 1</div>
          )}
        </div>

        {/* Cols */}
        <div>
          <Field label="Columns">
            <div className="flex items-center gap-1 w-full">
              <button onClick={() => setCols(v => String(Math.max(1, (parseInt(v) || 0) - 1)))} className={spinBtn}>−</button>
              <input
                type="number" min={1} max={64}
                className={inp + (!colsValid ? ' border-red-500 focus:border-red-500 focus:ring-red-200' : '')}
                value={cols}
                onChange={e => setCols(e.target.value)}
              />
              <button onClick={() => setCols(v => String(Math.min(64, (parseInt(v) || 0) + 1)))} className={spinBtn}>+</button>
            </div>
          </Field>
          {!colsValid && (
            <div className="text-[9px] text-red-500 mt-0.5 pl-[84px]">Must be at least 1</div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-1">
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Spacing</div>
          <Field label="X spacing" unit="mm">
            <NumInput value={xSp} onChange={setXSp} min={0} step={0.01} />
          </Field>
          <Field label="Y spacing" unit="mm">
            <NumInput value={ySp} onChange={setYSp} min={0} step={0.01} />
          </Field>
        </div>

        <div className="border-t border-gray-100 pt-1">
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Origin</div>
          <Field label="X start" unit="mm">
            <NumInput value={xStart} onChange={setXStart} min={0} step={0.01} />
          </Field>
          <Field label="Y start" unit="mm">
            <NumInput value={yStart} onChange={setYStart} min={0} step={0.01} />
          </Field>
        </div>

        <div className="text-[9px] font-semibold pt-0.5">
          {rowsValid && colsValid
            ? <span className="text-gray-500">{rowsNum * colsNum} wells total</span>
            : <span className="text-red-500">Enter valid rows and columns</span>
          }
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <button onClick={handleAdd} disabled={!rowsValid || !colsValid}
            className={'flex-1 py-1.5 text-[11px] font-semibold rounded transition-colors ' +
              (rowsValid && colsValid
                ? 'bg-gray-900 hover:bg-gray-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
            Add Wells
          </button>
          <button onClick={clearPendingMultiWells}
            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[11px] rounded hover:bg-gray-200 transition-colors">
            ✕
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Panel root ────────────────────────────────────────────────────────────────

export function RightPanel() {
  const { selectedWells, pendingMultiWells } = useLabwareStore()

  return (
    <div className="flex flex-col bg-white w-full">
      {pendingMultiWells && <MultiWellsSection />}
      {!pendingMultiWells && selectedWells.length > 0 && (
        <>
          <AlignSection />
          <WellPropertiesSection />
          <MeasurementSection />
          <SpacingSection />
        </>
      )}
      <div className="flex-1" />
    </div>
  )
}
