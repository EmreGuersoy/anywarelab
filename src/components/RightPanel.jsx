/**
 * RightPanel.jsx — Selection-driven property panel (right sidebar).
 * Appears when one or more wells are selected.
 * Contains: Align & Distribute, Well Properties, Measurement, Spacing to Neighbor.
 */

import { useState, useEffect, useRef } from 'react'
import { useLabwareStore, selKey } from '../store/useLabwareStore'
import { useLabelMap } from '../utils/useLabelMap'
import { QuestionTooltip } from './QuestionTooltip'

// ── Shared primitives ──────────────────────────────────────────────────────────

function SectionHeader({ children, tooltip }) {
  return (
    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-1.5">
      <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500 flex-1">
        {children}
      </span>
      {tooltip && <QuestionTooltip text={tooltip} />}
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
              ? 'bg-gray-700 text-white font-semibold'
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
    ? 'border-gray-700 bg-gray-700 text-white hover:bg-gray-600'
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

// ── Section: Group Settings ────────────────────────────────────────────────────

function GroupSection() {
  const { wellGroups, selectedWells, snapshot, updateGroupWells, labwareConfig } = useLabwareStore()

  if (selectedWells.length === 0) return null
  if (labwareConfig.labwareType === 'tipRack') return null

  const firstSel = selectedWells[0]
  const group = wellGroups.find(g => g.id === firstSel.groupId)
  if (!group) return null

  const bottomShape = group.wells[0]?.bottomShape ?? 'flat'

  function setBottomShape(shape) {
    snapshot()
    updateGroupWells(group.id, { bottomShape: shape })
  }

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Settings that apply to all wells in this group. Bottom shape is shared across the group and is used when exporting the Opentrons JSON.">Group Settings</SectionHeader>
      <div className="px-3 py-2 space-y-1.5">

        <div className="min-w-0">
          <div className="text-[11px] font-semibold text-gray-900 truncate">{group.name}</div>
          <div className="text-[9px] text-gray-400">{group.wells.length} well{group.wells.length !== 1 ? 's' : ''}</div>
        </div>

        <Field label="Bottom">
          <SelectEl
            value={bottomShape}
            onChange={setBottomShape}
            options={[
              { label: 'Flat',     value: 'flat' },
              { label: 'U-bottom', value: 'u'    },
              { label: 'V-bottom', value: 'v'    },
            ]}
          />
        </Field>
        <div className="text-[9px] text-gray-400">Applies to all {group.wells.length} wells in this group.</div>

      </div>
    </div>
  )
}

// ── Section: Align & Distribute ───────────────────────────────────────────────

function AlignSection() {
  const {
    selectedWells, wellGroups, setWellPositions,
    alignToPlateLeft, alignToPlateCenterH, alignToPlateRight,
    alignToPlateTop, alignToPlateCenterV, alignToPlateBottom,
    snapshot,
  } = useLabwareStore()
  const { labelMap } = useLabelMap()

  if (selectedWells.length < 1) return null

  const canMulti = selectedWells.filter(w => w.wellId !== null).length >= 2

  const plateBtnCls = 'flex-1 py-1.5 rounded border text-[10px] font-medium transition-colors ' +
    'border-gray-700 bg-gray-700 text-white hover:bg-gray-600'

  // Resolve label-based keys for a selection entry
  function rowOf(sel) {
    return labelMap.get(`${sel.groupId}::id::${sel.wellId}`)?.match(/^([A-Z]+)/)?.[1] ?? '__'
  }
  function colOf(sel) {
    return labelMap.get(`${sel.groupId}::id::${sel.wellId}`)?.match(/(\d+)$/)?.[1] ?? '__'
  }

  // Look up the actual well object for a selection entry
  function resolveWell(sel) {
    const g = wellGroups.find(g => g.id === sel.groupId)
    return g?.wells.find(w => w.id === sel.wellId) ?? null
  }

  // Align H: group by row label → each row aligns to its first-selected well's Y, resolve X overlaps.
  // Fallback: if every row has exactly 1 well (nothing to align within rows), treat all as one group.
  function handleAlignH() {
    const rowGroups = new Map()
    selectedWells.forEach(sel => {
      if (!sel.wellId) return
      const row = rowOf(sel)
      if (!rowGroups.has(row)) rowGroups.set(row, [])
      const w = resolveWell(sel)
      if (w) rowGroups.get(row).push({ groupId: sel.groupId, wellId: sel.wellId, w })
    })

    // If every row group has only 1 well there is nothing to align within rows —
    // fall back to aligning all selected wells to the first well's Y.
    const allSingletons = [...rowGroups.values()].every(g => g.length === 1)
    const groups = allSingletons
      ? [[ ...rowGroups.values()].flat()]   // one big group
      : [...rowGroups.values()]

    const updates = []
    groups.forEach(group => {
      const anchorY = group[0].w.y
      const moved = group.map(({ groupId, wellId, w }) => ({
        groupId, wellId,
        x: w.x, y: anchorY,
        shape: w.shape, diameter: w.diameter,
        xDimension: w.xDimension, yDimension: w.yDimension,
      }))
      moved.sort((a, b) => a.x - b.x)
      for (let i = 1; i < moved.length; i++) {
        const prev = moved[i - 1], curr = moved[i]
        const minDist = (prev.shape === 'circular' ? prev.diameter / 2 : prev.xDimension / 2)
                      + (curr.shape === 'circular' ? curr.diameter / 2 : curr.xDimension / 2)
        if (curr.x - prev.x < minDist) curr.x = prev.x + minDist
      }
      moved.forEach(({ groupId, wellId, x, y }) => updates.push({ groupId, wellId, x, y }))
    })

    snapshot()
    setWellPositions(updates)
  }

  // Align V: group by column number → each column aligns to its first-selected well's X
  function handleAlignV() {
    const colGroups = new Map()
    selectedWells.forEach(sel => {
      if (!sel.wellId) return
      const col = colOf(sel)
      if (!colGroups.has(col)) colGroups.set(col, [])
      const w = resolveWell(sel)
      if (w) colGroups.get(col).push({ groupId: sel.groupId, wellId: sel.wellId, w })
    })

    const updates = []
    colGroups.forEach(group => {
      const anchorX = group[0].w.x
      // Assign anchor X to all in group, carry current Y
      const moved = group.map(({ groupId, wellId, w }) => ({
        groupId, wellId,
        x: anchorX, y: w.y,
        shape: w.shape, diameter: w.diameter,
        xDimension: w.xDimension, yDimension: w.yDimension,
      }))
      // Resolve Y overlaps within the column
      moved.sort((a, b) => a.y - b.y)
      for (let i = 1; i < moved.length; i++) {
        const prev = moved[i - 1], curr = moved[i]
        const minDist = (prev.shape === 'circular' ? prev.diameter / 2 : prev.yDimension / 2)
                      + (curr.shape === 'circular' ? curr.diameter / 2 : curr.yDimension / 2)
        if (curr.y - prev.y < minDist) curr.y = prev.y + minDist
      }
      moved.forEach(({ groupId, wellId, x, y }) => updates.push({ groupId, wellId, x, y }))
    })

    snapshot()
    setWellPositions(updates)
  }

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Align the selection to the plate edges or centre. Align H groups wells by row and aligns each row to its first-selected Y. Align V groups by column and aligns each column to its first-selected X.">Align &amp; Distribute</SectionHeader>
      <div className="px-3 py-2.5 space-y-2.5">

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

        {/* Align to Well — multi-select only */}
        {canMulti && (
          <div>
            <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Align to Well</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={handleAlignH} className={opBtnCls(true)} title="Align each row to its first-selected well's Y">↔ Align H</button>
              <button onClick={handleAlignV} className={opBtnCls(true)} title="Align each column to its first-selected well's X">↕ Align V</button>
            </div>
          </div>
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
    labwareConfig, setConfigField, snapshot,
  } = useLabwareStore()
  const { labelMap } = useLabelMap()

  // Anchor index: which selected well the edge-offset inputs reference
  const [anchorIdx, setAnchorIdx] = useState(0)

  // Volume display unit — internally always stored in µL
  const [volumeUnit, setVolumeUnit] = useState('uL')

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
      <SectionHeader tooltip="Physical dimensions and position of the selected well(s). All changes apply to every selected well simultaneously. Depth (Z) must not exceed the plate Height (Z).">
        Well Properties{isMulti && <span className="ml-1 normal-case font-normal text-gray-400">({count} selected)</span>}
      </SectionHeader>
      <div className="px-3 py-2 space-y-1.5">

        {labwareConfig.labwareType === 'tipRack' && (
          <Field label="Tip diameter" unit="mm">
            <NumInput value={firstWell.diameter} onChange={v => patch({ diameter: v })} onFocus={snapshot} min={0} step={0.01} />
          </Field>
        )}

        {labwareConfig.labwareType !== 'tipRack' && (
          <>
            <Field label="Shape">
              <Seg
                value={firstWell.shape}
                onChange={v => { snapshot(); patch({ shape: v }) }}
                options={[
                  { label: '○ Circular', value: 'circular'    },
                  { label: '□ Rect',     value: 'rectangular' },
                ]}
              />
            </Field>

            {firstWell.shape === 'circular' ? (
              <Field label="Diameter" unit="mm">
                <NumInput value={firstWell.diameter} onChange={v => patch({ diameter: v })} onFocus={snapshot} min={0} />
              </Field>
            ) : (
              <>
                <Field label="Length (X)" unit="mm">
                  <NumInput value={firstWell.xDimension} onChange={v => patch({ xDimension: v })} onFocus={snapshot} min={0} />
                </Field>
                <Field label="Width (Y)" unit="mm">
                  <NumInput value={firstWell.yDimension} onChange={v => patch({ yDimension: v })} onFocus={snapshot} min={0} />
                </Field>
              </>
            )}

            <Field label="Depth (Z)" unit="mm">
              <NumInput value={firstWell.depth} onChange={v => patch({ depth: v })} onFocus={snapshot} min={0} />
            </Field>
            {firstWell.depth > labwareConfig.zDimension && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-red-50 border border-red-200">
                <span className="text-red-500 text-[10px] flex-shrink-0 mt-px">✕</span>
                <span className="text-[10px] text-red-700 leading-snug">
                  Depth ({firstWell.depth} mm) exceeds plate Height (Z = {labwareConfig.zDimension} mm).
                </span>
              </div>
            )}
          </>
        )}

        <Field label="Volume">
          <NumInput
            value={volumeUnit === 'mL'
              ? +( firstWell.totalLiquidVolume / 1000).toFixed(6)
              : firstWell.totalLiquidVolume}
            onChange={v => patch({ totalLiquidVolume: volumeUnit === 'mL' ? v * 1000 : v })}
            onFocus={snapshot}
            min={0}
            step={volumeUnit === 'mL' ? 0.001 : 1}
          />
          <select
            value={volumeUnit}
            onChange={e => setVolumeUnit(e.target.value)}
            className="flex-shrink-0 text-[10px] text-gray-600 bg-white border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="uL">µL</option>
            <option value="mL">mL</option>
          </select>
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

// ── Section: Dimensions ───────────────────────────────────────────────────────

function SpacingSection() {
  const { wellGroups, selectedWells, snapshot, setWellPositions } = useLabwareStore()
  const { labelMap, flatWells } = useLabelMap()

  const [xPitch, setXPitch] = useState(9)
  const [yPitch, setYPitch] = useState(9)

  // Use first selected well as reference for neighbour measurement
  const sel       = selectedWells.length > 0 ? selectedWells[0] : null
  const isMulti   = selectedWells.length > 1
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

  // Collect unique row letters / col numbers across the entire selection
  const selectedRowLetters = [...new Set(
    selectedWells.flatMap(sw => {
      const lbl = labelMap.get(`${sw.groupId}::id::${sw.wellId}`)
      const m = lbl?.match(/^([A-Z]+)\d+$/)
      return m ? [m[1]] : []
    })
  )].sort()

  const selectedColNums = [...new Set(
    selectedWells.flatMap(sw => {
      const lbl = labelMap.get(`${sw.groupId}::id::${sw.wellId}`)
      const m = lbl?.match(/^[A-Z]+(\d+)$/)
      return m ? [parseInt(m[1])] : []
    })
  )].sort((a, b) => a - b)

  function applyToRow() {
    const updates = []
    selectedRowLetters.forEach(row => {
      const rowWells = flatWells
        .filter(fw => { const m = fw.label.match(/^([A-Z]+)\d+$/); return m && m[1] === row })
        .sort((a, b) => parseInt(a.label.match(/\d+$/)[0]) - parseInt(b.label.match(/\d+$/)[0]))
      if (rowWells.length === 0) return
      const anchorX = rowWells[0].x
      rowWells.forEach((fw, i) => {
        const [gid, wid] = fw.key.split('::id::')
        updates.push({ groupId: gid, wellId: wid, x: anchorX + i * xPitch })
      })
    })
    if (updates.length === 0) return
    snapshot()
    setWellPositions(updates)
  }

  function applyToColumn() {
    const updates = []
    selectedColNums.forEach(col => {
      const colWells = flatWells
        .filter(fw => { const m = fw.label.match(/^[A-Z]+(\d+)$/); return m && parseInt(m[1]) === col })
        .sort((a, b) => {
          const ra = a.label.match(/^([A-Z]+)/)[1]
          const rb = b.label.match(/^([A-Z]+)/)[1]
          return ra < rb ? -1 : ra > rb ? 1 : 0
        })
      if (colWells.length === 0) return
      const anchorY = colWells[0].y
      colWells.forEach((fw, i) => {
        const [gid, wid] = fw.key.split('::id::')
        updates.push({ groupId: gid, wellId: wid, y: anchorY - i * yPitch })
      })
    })
    if (updates.length === 0) return
    snapshot()
    setWellPositions(updates)
  }

  function applyXToSelection() {
    const sorted = [...selectedWells]
      .map(sw => {
        const g = wellGroups.find(g => g.id === sw.groupId)
        const w = g?.wells.find(w => w.id === sw.wellId)
        return w ? { groupId: sw.groupId, wellId: sw.wellId, x: w.x } : null
      })
      .filter(Boolean)
      .sort((a, b) => a.x - b.x)
    if (sorted.length < 2) return
    const anchorX = sorted[0].x
    const updates = sorted.map((w, i) => ({ groupId: w.groupId, wellId: w.wellId, x: anchorX + i * xPitch }))
    snapshot()
    setWellPositions(updates)
  }

  function applyYToSelection() {
    const sorted = [...selectedWells]
      .map(sw => {
        const g = wellGroups.find(g => g.id === sw.groupId)
        const w = g?.wells.find(w => w.id === sw.wellId)
        return w ? { groupId: sw.groupId, wellId: sw.wellId, y: w.y } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.y - a.y)
    if (sorted.length < 2) return
    const anchorY = sorted[0].y
    const updates = sorted.map((w, i) => ({ groupId: w.groupId, wellId: w.wellId, y: anchorY - i * yPitch }))
    snapshot()
    setWellPositions(updates)
  }

  const applyBtn = 'w-full py-1 text-[10px] font-semibold rounded border border-gray-900 ' +
    'bg-white text-gray-900 hover:bg-gray-900 hover:text-white transition-colors'

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Distance from the selected well's centre to the nearest well in each direction. Use this to verify uniform spacing across a grid layout.">Dimensions</SectionHeader>
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
          <div className={isMulti ? 'grid grid-cols-2 gap-1' : ''}>
            <button onClick={applyToRow} className={applyBtn}>
              {selectedRowLetters.length > 1 ? 'Apply X to Rows' : `Apply X to Row ${selectedRowLetters[0]}`}
            </button>
            {isMulti && (
              <button onClick={applyXToSelection} className={applyBtn}>
                Apply X to selection
              </button>
            )}
          </div>
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
          <div className={isMulti ? 'grid grid-cols-2 gap-1' : ''}>
            <button onClick={applyToColumn} className={applyBtn}>
              {selectedColNums.length > 1 ? 'Apply Y to Cols' : `Apply Y to Col ${selectedColNums[0]}`}
            </button>
            {isMulti && (
              <button onClick={applyYToSelection} className={applyBtn}>
                Apply Y to selection
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Section: Place Multiple Wells ─────────────────────────────────────────────

function MultiWellsSection() {
  const { pendingMultiWells, clearPendingMultiWells, addWellGroup, addMultipleWells,
          setSelectedWells, setActiveTool, snapshot, labwareConfig } = useLabwareStore()

  const region = pendingMultiWells?.region ?? null

  const w = region ? Math.abs(region.x2 - region.x1) : 0
  const h = region ? Math.abs(region.y2 - region.y1) : 0

  const labwareType  = labwareConfig.labwareType
  const isTubeOrTip  = labwareType === 'tubeRack' || labwareType === 'tipRack'
  const isReservoir  = labwareType === 'reservoir'

  const sectionTitle = {
    wellPlate: 'Place Multiple Wells',
    reservoir: 'Place Multiple Reservoirs',
    tubeRack:  'Place Multiple Tubes',
    tipRack:   'Place Multiple Tips',
  }[labwareType] ?? 'Place Multiple Wells'

  const [rows,      setRows]      = useState('4')
  const [cols,      setCols]      = useState('6')
  const [xSp,       setXSp]       = useState(9)
  const [ySp,       setYSp]       = useState(9)
  const [xStart,    setXStart]    = useState(0)
  const [yStart,    setYStart]    = useState(0)
  const [shape,       setShape]       = useState('circular')
  const [diameter,    setDiameter]    = useState(6.86)
  const [xDim,        setXDim]        = useState(8.2)
  const [yDim,        setYDim]        = useState(8.2)
  const [depth,       setDepth]       = useState(10.67)
  const [volume,      setVolume]      = useState(200)
  const [volumeUnit,  setVolumeUnit]  = useState('uL')
  const [bottomShape, setBottomShape] = useState('flat')

  const rowsNum = parseInt(rows) || 0
  const colsNum = parseInt(cols) || 0
  const rowsValid = rowsNum >= 1
  const colsValid = colsNum >= 1

  // Sync inputs whenever a new region is drawn
  const regionKey = region ? `${region.x1},${region.y1},${region.x2},${region.y2}` : ''
  useEffect(() => {
    if (!region) return
    setXStart(+region.x1.toFixed(2))
    setYStart(+region.y2.toFixed(2))
    if (isReservoir) {
      // Reservoir: single well filling the dragged region
      setRows('1')
      setCols('1')
      setShape('rectangular')
      setXDim(+w.toFixed(2))
      setYDim(+h.toFixed(2))
      setXSp(+w.toFixed(2))
      setYSp(+h.toFixed(2))
    } else {
      const c = parseInt(cols) || 1
      const r = parseInt(rows) || 1
      setXSp(+(c > 1 ? w / (c - 1) : 9).toFixed(2))
      setYSp(+(r > 1 ? h / (r - 1) : 9).toFixed(2))
    }
  }, [regionKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const c = parseInt(cols) || 1
    if (region) setXSp(+(c > 1 ? w / (c - 1) : 9).toFixed(2))
  }, [cols]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const r = parseInt(rows) || 1
    if (region) setYSp(+(r > 1 ? h / (r - 1) : 9).toFixed(2))
  }, [rows]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync X spacing to the well's X dimension whenever it changes
  useEffect(() => {
    if (isTubeOrTip) return
    setXSp(+(shape === 'circular' ? diameter : xDim).toFixed(2))
  }, [diameter, xDim, shape]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const resolvedShape = (isTubeOrTip || (!isReservoir && shape === 'circular')) ? 'circular' : 'rectangular'
    const totalLiquidVolume = volumeUnit === 'mL' ? volume * 1000 : volume
    const wellProps = {
      ...(resolvedShape === 'circular'
        ? { shape: 'circular', diameter }
        : { shape: 'rectangular', xDimension: xDim, yDimension: yDim }),
      depth, totalLiquidVolume, bottomShape,
    }
    addMultipleWells(groupId, positions, wellProps)
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
      <SectionHeader tooltip="Fill the dragged region with a uniform grid. Rows and columns must each be at least 1.">{sectionTitle}</SectionHeader>
      <div className="px-3 py-2 space-y-1.5">

        <div className="text-[9px] text-gray-400 bg-gray-50 border border-gray-100 rounded px-2 py-1">
          Region: {w.toFixed(1)} × {h.toFixed(1)} mm
        </div>

        {/* Shape + dimensions — well plates only (tube/tip = always circular, reservoir = always rect) */}
        <div className="border-b border-gray-100 pb-1.5 space-y-1">
          {!isTubeOrTip && !isReservoir && (
            <Field label="Shape">
              <Seg
                value={shape}
                onChange={setShape}
                options={[
                  { label: '○ Circular', value: 'circular'    },
                  { label: '□ Rect',     value: 'rectangular' },
                ]}
              />
            </Field>
          )}
          {isTubeOrTip || shape === 'circular' ? (
            <Field label="Diameter" unit="mm">
              <NumInput value={diameter} onChange={setDiameter} min={0.1} step={0.01} />
            </Field>
          ) : (
            <>
              <Field label="Length (X)" unit="mm">
                <NumInput value={xDim} onChange={setXDim} min={0.1} step={0.01} />
              </Field>
              <Field label="Width (Y)" unit="mm">
                <NumInput value={yDim} onChange={setYDim} min={0.1} step={0.01} />
              </Field>
            </>
          )}
          <Field label="Depth (Z)" unit="mm">
            <NumInput value={depth} onChange={setDepth} min={0} step={0.01} />
          </Field>
          <Field label="Volume">
            <NumInput
              value={volumeUnit === 'mL' ? +(volume / 1000).toFixed(6) : volume}
              onChange={v => setVolume(volumeUnit === 'mL' ? v * 1000 : v)}
              min={0}
              step={volumeUnit === 'mL' ? 0.001 : 1}
            />
            <select
              value={volumeUnit}
              onChange={e => setVolumeUnit(e.target.value)}
              className="flex-shrink-0 text-[10px] text-gray-600 bg-white border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="uL">µL</option>
              <option value="mL">mL</option>
            </select>
          </Field>
          {labwareType !== 'tipRack' && (
          <Field label="Bottom">
            <SelectEl
              value={bottomShape}
              onChange={setBottomShape}
              options={[
                { label: 'Flat',     value: 'flat' },
                { label: 'U-bottom', value: 'u'    },
                { label: 'V-bottom', value: 'v'    },
              ]}
            />
          </Field>
          )}
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
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Edge Offset</div>
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
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed')}>
            Add Grid
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
          <GroupSection />
          <AlignSection />
          <WellPropertiesSection />
          <SpacingSection />
        </>
      )}
      <div className="flex-1" />
    </div>
  )
}
