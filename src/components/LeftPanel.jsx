/**
 * LeftPanel.jsx — Plate configuration sidebar (left).
 * Contains: Labware type, Plate dimensions/metadata, Tools, Well Groups.
 */

import { useState, useEffect, useRef } from 'react'
import { useLabwareStore } from '../store/useLabwareStore'

// ── Shared primitives ──────────────────────────────────────────────────────────

function SectionHeader({ children, tooltip }) {
  return (
    <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex items-center gap-1.5">
      <span className="text-[9px] font-bold tracking-widest uppercase text-gray-500 flex-1">
        {children}
      </span>
      {tooltip && (
        <div className="relative group flex-shrink-0">
          <div className="w-3.5 h-3.5 rounded-full border border-gray-300 bg-white flex items-center justify-center cursor-default">
            <span className="text-[8px] text-gray-400 font-bold leading-none">?</span>
          </div>
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-gray-900 text-white text-[10px] leading-relaxed rounded px-2.5 py-2 shadow-lg z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {tooltip}
            <div className="absolute -top-1 right-1.5 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}
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
  { value: 'wellPlate',     label: 'Well Plate'      },
  { value: 'reservoir',     label: 'Reservoir'       },
  { value: 'tubeRack',      label: 'Tube Rack'       },
  { value: 'aluminumBlock', label: 'Aluminum Block'  },
  { value: 'tipRack',       label: 'Tip Rack'        },
]

// ── Section: Labware Type ─────────────────────────────────────────────────────

function LabwareTypeSection() {
  const { labwareConfig, setConfigField } = useLabwareStore()
  const current = LABWARE_TYPES.find(t => t.value === labwareConfig.labwareType) ?? LABWARE_TYPES[0]

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Defines the category of your labware in the Opentrons ecosystem. This affects how the robot software classifies and handles it during a protocol run.">Labware Type</SectionHeader>
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
        <p className="text-[9px] text-gray-400 leading-snug">
          Determines the labware category in the exported Opentrons schema.
        </p>
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
      <SectionHeader tooltip="Physical dimensions of the labware footprint. The SBS standard (127.76 × 85.48 mm) fits all standard Opentrons deck positions. Height (Z) is the total height from the deck surface to the top of the labware.">Plate</SectionHeader>
      <div className="px-3 py-2 space-y-1">
        <Field label="Display name">
          <TxtInput value={c.displayName} onChange={v => setConfigField('displayName', v)} />
        </Field>
        <Field label="Load name">
          <TxtInput value={c.loadName} onChange={v => setConfigField('loadName', v)} />
        </Field>
        <Field label="Brand">
          <TxtInput value={c.brand} onChange={v => setConfigField('brand', v)} />
        </Field>
        <div className="pt-1 border-t border-gray-100 space-y-1.5">
          <div className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">
            Footprint
            <span className="ml-1 normal-case font-normal text-gray-400">(SBS standard: 127.76 × 85.48)</span>
          </div>
          <Field label="Width (X)" unit="mm">
            <NumInput value={c.xDimension} onChange={v => setConfigField('xDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <Field label="Length (Y)" unit="mm">
            <NumInput value={c.yDimension} onChange={v => setConfigField('yDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <Field label="Height (Z)" unit="mm">
            <NumInput value={c.zDimension} onChange={v => setConfigField('zDimension', v)} onFocus={snapshot} min={0} step={0.01} />
          </Field>
          <div className="text-[9px] text-gray-400 leading-snug pt-0.5">
            Z = total labware height from deck surface
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section: Tools ────────────────────────────────────────────────────────────

const PLACE_TOOLS = [
  { id: 'addWell',       icon: '⊕', label: 'Add Well',  desc: 'Click to place a single well' },
  { id: 'multipleWells', icon: '⊞', label: 'Add Grid',  desc: 'Drag to place a well grid'    },
]

function ToolsSection() {
  const { activeTool, setActiveTool } = useLabwareStore()

  return (
    <div className="border-b border-gray-200">
      <SectionHeader tooltip="Place wells on your labware. Use Add Well to click and place individual wells, or Add Grid to drag a region and fill it with a uniform grid of wells. Wells can be repositioned after placement using the Select tool.">Add Wells</SectionHeader>
      <div className="px-3 py-2 space-y-1.5">
        {PLACE_TOOLS.map(t => {
          const active = activeTool === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={
                'w-full flex items-center gap-2.5 px-3 py-2 rounded border text-left transition-colors ' +
                (active
                  ? 'bg-gray-900 border-gray-900 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50')
              }
            >
              <span className="text-base leading-none flex-shrink-0">{t.icon}</span>
              <span className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold leading-tight">{t.label}</span>
                <span className={
                  'text-[9px] leading-tight ' + (active ? 'text-gray-300' : 'text-gray-400')
                }>{t.desc}</span>
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
  const { wellGroups, selectedGroupId, selectGroup, removeWellGroup, addWellGroup, updateGroup } =
    useLabwareStore()

  return (
    <div className="border-b border-gray-200">
      <SectionHeader>Well Groups</SectionHeader>
      <div className="px-3 py-2 space-y-1">
        {wellGroups.map(g => {
          const isSelected = selectedGroupId === g.id
          return (
            <div
              key={g.id}
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
              {isSelected && (
                <button
                  onClick={e => { e.stopPropagation(); removeWellGroup(g.id) }}
                  className="text-gray-400 hover:text-red-500 text-xs px-0.5 transition-colors flex-shrink-0"
                  title="Remove group"
                >✕</button>
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
