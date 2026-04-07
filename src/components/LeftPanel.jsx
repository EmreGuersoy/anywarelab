/**
 * LeftPanel.jsx — Plate configuration sidebar (left).
 * Contains: Labware type, Plate dimensions/metadata, Tools, Well Groups.
 */

import { useState, useEffect, useRef } from 'react'
import { useLabwareStore } from '../store/useLabwareStore'
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

function TxtInput({ value, onChange }) {
  return (
    <input
      type="text"
      className={inp}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  )
}

// ── Labware types (mirrors Opentrons custom labware generator) ─────────────────

const LABWARE_TYPES = [
  { value: 'wellPlate', label: 'Well Plate' },
  { value: 'reservoir', label: 'Reservoir'  },
  { value: 'tubeRack',  label: 'Tube Rack'  },
  { value: 'tipRack',   label: 'Tip Rack'   },
]

// Labels for the placement tools per labware type
const TOOL_LABELS = {
  wellPlate: { single: 'Add Well', grid: 'Add Grid',     singleDesc: 'Click to place a single well',     gridDesc: 'Drag to place a well grid'     },
  reservoir: { single: 'Add Reservoir', grid: 'Add Grid', singleDesc: 'Click to place a reservoir',      gridDesc: 'Drag to place a reservoir grid' },
  tubeRack:  { single: 'Add Tube', grid: 'Add Tube Grid',singleDesc: 'Click to place a single tube',     gridDesc: 'Drag to place a tube grid'     },
  tipRack:   { single: 'Add Tip',  grid: 'Add Tip Grid', singleDesc: 'Click to place a single tip well', gridDesc: 'Drag to place a tip grid'      },
}

// ── Section: Labware Type ─────────────────────────────────────────────────────

function LabwareTypeSection() {
  const { labwareConfig, setConfigField } = useLabwareStore()
  const current = LABWARE_TYPES.find(t => t.value === labwareConfig.labwareType) ?? LABWARE_TYPES[0]

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Defines the category of your labware in the Opentrons ecosystem. This affects how the robot software classifies and handles it during a protocol run. Choose the right labware type for accurate protocol execution.">Labware Type</SectionHeader>
      <div className="px-3 py-3 space-y-2">
        <select
          value={current.value}
          onChange={e => setConfigField('labwareType', e.target.value)}
          className={inp + ' cursor-pointer'}
        >
          {LABWARE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ── Section: Plate ────────────────────────────────────────────────────────────

function PlateSection() {
  const { labwareConfig, setConfigField, snapshot } = useLabwareStore()
  const c = labwareConfig
  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="The physical dimensions of your labware. To fit a standard Opentrons deck position, the footprint should follow the SBS standard (127.76 x 85.48 mm ± 1.0). The Height (Z) represents the total distance from the deck surface to the highest point of the labware.">Plate</SectionHeader>
      <div className="px-3 py-2 space-y-1">
        <Field label="Display name">
          <TxtInput value={c.displayName} onChange={v => setConfigField('displayName', v)} />
        </Field>
        <Field label="Load name">
          <TxtInput value={c.loadName} onChange={v => setConfigField('loadName', v)} />
        </Field>
        {/[A-Z\s]/.test(c.loadName) && (
          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-red-50 border border-red-200">
            <span className="text-red-500 text-[10px] flex-shrink-0 mt-px font-bold">✕</span>
            <span className="text-[10px] text-red-700 leading-snug">
              Load name must be lowercase and contain no spaces. Use underscores instead (e.g. <span className="font-mono">my_labware_1</span>).
            </span>
          </div>
        )}
        <Field label="Brand">
          <TxtInput value={c.brand} onChange={v => setConfigField('brand', v)} />
        </Field>
        <div className="pt-1 border-t border-gray-100 space-y-1.5">
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">
            Footprint
            <span className="ml-1 normal-case font-normal text-gray-400">(SBS: L 127.76 × W 85.48)</span>
          </div>
          <Field label="Length (X)" unit="mm">
            <NumInput value={c.xDimension} onChange={v => setConfigField('xDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <Field label="Width (Y)" unit="mm">
            <NumInput value={c.yDimension} onChange={v => setConfigField('yDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <Field label="Height (Z)" unit="mm">
            <NumInput value={c.zDimension} onChange={v => setConfigField('zDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <div className="text-[9px] text-gray-400 leading-snug pt-0.5">
            Z = total labware height from deck surface
          </div>
        </div>

        {c.labwareType === 'tipRack' && (
          <div className="pt-1 border-t border-gray-100 space-y-1.5">
            <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Tip</div>
            <Field label="Tip length" unit="mm">
              <NumInput value={c.tipLength} onChange={v => setConfigField('tipLength', v)} onFocus={snapshot} min={0} step={0.01} />
            </Field>
            {c.tipLength === 0 && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-red-50 border border-red-200">
                <span className="text-red-500 text-[10px] flex-shrink-0 mt-px font-bold">✕</span>
                <span className="text-[10px] text-red-700 leading-snug">
                  Tip length is required. Enter the physical length of the tip.
                </span>
              </div>
            )}
            {c.tipLength > c.zDimension && (
              <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-red-50 border border-red-200">
                <span className="text-red-500 text-[10px] flex-shrink-0 mt-px font-bold">✕</span>
                <span className="text-[10px] text-red-700 leading-snug">
                  Tip length ({c.tipLength} mm) exceeds plate Height (Z = {c.zDimension} mm).
                </span>
              </div>
            )}
          </div>
        )}

        {/* TODO: stacking adapter UI
        <div className="pt-1 border-t border-gray-100 space-y-1.5">
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Stacking</div>
          <Field label="Stacking adapter">
            <select
              value={c.stackingAdapter ? 'yes' : 'no'}
              onChange={e => setConfigField('stackingAdapter', e.target.value === 'yes')}
              className={inp + ' cursor-pointer'}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {c.stackingAdapter && (
            <>
              <div className="text-[9px] text-gray-400 leading-snug">
                Offset applied when this labware is stacked on top of another.
              </div>
              <Field label="Offset X" unit="mm">
                <NumInput value={c.stackingOffsetX} onChange={v => setConfigField('stackingOffsetX', v)} onFocus={snapshot} step={0.01} />
              </Field>
              <Field label="Offset Y" unit="mm">
                <NumInput value={c.stackingOffsetY} onChange={v => setConfigField('stackingOffsetY', v)} onFocus={snapshot} step={0.01} />
              </Field>
              <Field label="Offset Z" unit="mm">
                <NumInput value={c.stackingOffsetZ} onChange={v => setConfigField('stackingOffsetZ', v)} onFocus={snapshot} min={0} step={0.01} />
              </Field>
            </>
          )}
        </div>
        */}
      </div>
    </div>
  )
}

// ── Section: Tools ────────────────────────────────────────────────────────────

function ToolsSection() {
  const { activeTool, setActiveTool, labwareConfig } = useLabwareStore()
  const labels = TOOL_LABELS[labwareConfig.labwareType] ?? TOOL_LABELS.wellPlate

  const tools = [
    { id: 'addWell',       icon: '⊕', label: labels.single, desc: labels.singleDesc },
    { id: 'multipleWells', icon: '⊞', label: labels.grid,   desc: labels.gridDesc   },
  ]

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Use the Add Well/Tip/Tube to place items individually, or the Grid Tool to click and drag a uniform array across a region. Need to make a change? Use the Select Tool to move or fine-tune dimensions after placement.">Add Wells</SectionHeader>
      <div className="px-3 py-2 space-y-1.5">
        {tools.map(t => {
          const active = activeTool === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={
                'w-full flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-colors ' +
                (active
                  ? 'bg-gray-700 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50')
              }
            >
              <span className="text-base leading-none flex-shrink-0">{t.icon}</span>
              <span className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold leading-tight">{t.label}</span>
                <span className={'text-[9px] leading-tight ' + (active ? 'text-gray-300' : 'text-gray-400')}>
                  {t.desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Section: Groups ───────────────────────────────────────────────────────────

function GroupsSection() {
  const {
    wellGroups, selectedGroupId, selectGroup, removeWellGroup, addWellGroup, updateGroup,
    setSelectedWells,
  } = useLabwareStore()

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  function handleSelectAll(e, g) {
    e.stopPropagation()
    selectGroup(g.id)
    setSelectedWells(g.wells.map(w => ({ groupId: g.id, name: '', wellId: w.id })))
  }

  function handleDeleteClick(e, id) {
    e.stopPropagation()
    setConfirmDeleteId(id)
  }

  function confirmDelete(e, id) {
    e.stopPropagation()
    removeWellGroup(id)
    setConfirmDeleteId(null)
  }

  function cancelDelete(e) {
    e.stopPropagation()
    setConfirmDeleteId(null)
  }

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Wells are organised into named groups. Each group carries a shared bottom shape in the exported JSON. Use multiple groups to distinguish different regions of your labware, such as sample wells vs. controls.">Well Groups</SectionHeader>
      <div className="px-3 py-2 space-y-1">
        {wellGroups.map(g => {
          const isSelected   = selectedGroupId === g.id
          const isConfirming = confirmDeleteId === g.id
          return (
            <div key={g.id}>
              <div
                onClick={() => selectGroup(g.id)}
                className={
                  'flex items-center gap-2 px-2 py-1.5 rounded border cursor-pointer transition-all ' +
                  (isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-transparent hover:border-gray-200 hover:bg-gray-50')
                }
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-gray-500" />
                <div className="flex-1 min-w-0">
                  {isSelected ? (
                    <input
                      type="text"
                      className="text-[11px] font-medium text-gray-800 bg-transparent w-full focus:outline-none border-b border-gray-300 focus:border-blue-500"
                      value={g.name}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateGroup(g.id, { name: e.target.value })}
                    />
                  ) : (
                    <div className="text-[11px] text-gray-700 font-medium truncate">{g.name}</div>
                  )}
                  <div className="text-[9px] text-gray-400">{g.wells.length} wells</div>
                </div>

                {/* Select all */}
                <button
                  onClick={e => handleSelectAll(e, g)}
                  title="Select all wells in this group"
                  className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded border border-gray-300 text-gray-500 hover:border-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  All
                </button>

                {/* Delete */}
                <button
                  onClick={e => handleDeleteClick(e, g.id)}
                  title="Delete group"
                  className="flex-shrink-0 text-gray-400 hover:text-red-500 text-xs px-0.5 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Inline delete confirmation */}
              {isConfirming && (
                <div
                  className="mx-2 mt-0.5 mb-1 px-2 py-1.5 rounded border border-red-200 bg-red-50 flex items-center justify-between gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="text-[10px] text-red-700 leading-snug">
                    Delete <span className="font-semibold">{g.name}</span> and its {g.wells.length} well{g.wells.length !== 1 ? 's' : ''}?
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={e => confirmDelete(e, g.id)}
                      className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="px-2 py-0.5 text-[10px] rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <button
          onClick={() => addWellGroup()}
          className="w-full text-[11px] py-1.5 rounded border border-dashed border-gray-300 text-gray-500 hover:border-gray-600 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          + New Group
        </button>
      </div>
    </div>
  )
}

// ── Panel root ────────────────────────────────────────────────────────────────

export function LeftPanel() {
  return (
    <div className="flex flex-col bg-white w-full">
      <LabwareTypeSection />
      <PlateSection />
      <ToolsSection />
      <GroupsSection />
      <div className="flex-1" />
    </div>
  )
}
