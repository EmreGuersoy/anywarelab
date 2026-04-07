import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

let _gid = 0
let _wid = 0

// ── Factories ──────────────────────────────────────────────────────────────────

/**
 * Create a single well object with all physical properties embedded.
 * Wells are now first-class state — no group-level shared geometry.
 */
export function makeWell(x, y, overrides = {}) {
  return {
    id:               `w_${++_wid}`,
    x,
    y,
    shape:            'circular',
    diameter:         6.86,
    xDimension:       8.2,
    yDimension:       8.2,
    depth:            10.67,
    totalLiquidVolume: 200,
    bottomShape:      'flat',
    ...overrides,
  }
}

/**
 * Create a well group.  Groups are now purely organisational containers —
 * they hold an ordered list of well objects with no shared geometry.
 */
export function makeGroup(overrides = {}) {
  return {
    id:    `grp_${++_gid}`,
    name:  `Group ${_gid}`,
    wells: [],
    ...overrides,
  }
}

const seed = makeGroup({ name: 'Wells', wells: [] })

// ── selKey ────────────────────────────────────────────────────────────────────

/**
 * Stable identity key for a selected-well entry.
 * All wells now carry a wellId so the key is always id-based,
 * which means it does not change when the display label changes.
 */
export function selKey(sel) {
  return sel.wellId
    ? `${sel.groupId}::id::${sel.wellId}`
    : `${sel.groupId}::${sel.name}`  // fallback (should not occur in new schema)
}

// ── Store ──────────────────────────────────────────────────────────────────────

export const useLabwareStore = create(
  immer((set, get) => ({

    // ── Plate config ─────────────────────────────────────────────────────────
    labwareConfig: {
      labwareType: 'wellPlate',
      xDimension:  127.76,
      yDimension:  85.48,
      zDimension:  14.22,
      displayName: 'Custom Labware',
      brand:       'Generic',
      loadName:    'custom_labware_1',
      // TODO: stacking adapter support
      // stackingAdapter: false,
      // stackingOffsetX: 0,
      // stackingOffsetY: 0,
      // stackingOffsetZ: 0,
    },

    // ── Well groups ───────────────────────────────────────────────────────────
    wellGroups:      [seed],
    selectedGroupId: seed.id,

    // ── Multi-selection ───────────────────────────────────────────────────────
    // Array of { groupId, name, wellId }
    selectedWells: [],

    // ── Active tool ───────────────────────────────────────────────────────────
    activeTool: 'select',

    // ── Pending multi-well placement (set by canvas drag, consumed by RightPanel) ──
    pendingMultiWells: null,   // null | { region: {x1,y1,x2,y2} }

    // ── Clipboard ─────────────────────────────────────────────────────────────
    clipboard: null,   // null | Array<well-prop objects (no id)>

    // ── Actions: config ───────────────────────────────────────────────────────
    setConfigField: (field, value) =>
      set(s => { s.labwareConfig[field] = value }),

    // ── Actions: groups ───────────────────────────────────────────────────────
    addWellGroup: (overrides = {}) =>
      set(s => {
        const g = makeGroup(overrides)
        s.wellGroups.push(g)
        s.selectedGroupId = g.id
        s.selectedWells = []
      }),

    removeWellGroup: id =>
      set(s => {
        s.wellGroups = s.wellGroups.filter(g => g.id !== id)
        s.selectedWells = s.selectedWells.filter(w => w.groupId !== id)
        if (s.selectedGroupId === id)
          s.selectedGroupId = s.wellGroups[0]?.id ?? null
      }),

    selectGroup: id =>
      set(s => { s.selectedGroupId = id }),

    updateGroup: (id, patch) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === id)
        if (g) Object.assign(g, patch)
      }),

    // ── Actions: individual wells ─────────────────────────────────────────────

    /** Add a single well at (x, y) to a group; optionally override defaults. */
    addManualWell: (groupId, x, y, wellProps = {}) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (g) g.wells.push(makeWell(x, y, wellProps))
      }),

    /**
     * Add multiple pre-computed wells (from the Multiple Wells tool).
     * positions: [{ x, y }]
     */
    addMultipleWells: (groupId, positions, wellProps = {}) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (!g) return
        positions.forEach(({ x, y }) => g.wells.push(makeWell(x, y, wellProps)))
      }),

    removeManualWell: (groupId, wellId) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (!g) return
        g.wells = g.wells.filter(w => w.id !== wellId)
        s.selectedWells = s.selectedWells.filter(
          w => !(w.groupId === groupId && w.wellId === wellId)
        )
      }),

    removeSelectedWells: () =>
      set(s => {
        const toRemove = new Map()
        s.selectedWells.forEach(sel => {
          if (!sel.wellId) return
          if (!toRemove.has(sel.groupId)) toRemove.set(sel.groupId, new Set())
          toRemove.get(sel.groupId).add(sel.wellId)
        })
        s.wellGroups.forEach(g => {
          const ids = toRemove.get(g.id)
          if (ids) g.wells = g.wells.filter(w => !ids.has(w.id))
        })
        s.selectedWells = []
      }),

    moveManualWell: (groupId, wellId, x, y) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (!g) return
        const w = g.wells.find(w => w.id === wellId)
        if (w) { w.x = x; w.y = y }
      }),

    /**
     * Move the target well so that (targetX − anchorX) = newDelta on the given axis.
     * Anchor remains stationary.
     */
    applyRelativeDelta: (anchorGroupId, anchorWellId, targetGroupId, targetWellId, axis, newDelta) =>
      set(s => {
        const ag = s.wellGroups.find(g => g.id === anchorGroupId)
        const anchor = ag?.wells.find(w => w.id === anchorWellId)
        const tg = s.wellGroups.find(g => g.id === targetGroupId)
        const target = tg?.wells.find(w => w.id === targetWellId)
        if (!anchor || !target) return
        if (axis === 'x') target.x = Math.max(0, anchor.x + newDelta)
        if (axis === 'y') target.y = Math.max(0, anchor.y + newDelta)
      }),

    /** Bulk-reposition wells to exact coordinates (used by spacing tools). */
    setWellPositions: (updates) =>
      set(s => {
        updates.forEach(({ groupId, wellId, x, y }) => {
          const g = s.wellGroups.find(g => g.id === groupId)
          if (!g) return
          const w = g.wells.find(w => w.id === wellId)
          if (!w) return
          if (x !== undefined) w.x = Math.max(0, x)
          if (y !== undefined) w.y = Math.max(0, y)
        })
      }),

    moveSelectedWells: (dx, dy, xDim, yDim) =>
      set(s => {
        s.selectedWells.forEach(sel => {
          if (!sel.wellId) return
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          if (!g) return
          const w = g.wells.find(w => w.id === sel.wellId)
          if (w) {
            w.x = Math.max(0, Math.min(xDim, w.x + dx))
            w.y = Math.max(0, Math.min(yDim, w.y + dy))
          }
        })
      }),

    /** Update a single well's properties. */
    updateWell: (groupId, wellId, patch) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (!g) return
        const w = g.wells.find(w => w.id === wellId)
        if (w) Object.assign(w, patch)
      }),

    /** Update every well in a group (used by group-wide settings). */
    updateGroupWells: (groupId, patch) =>
      set(s => {
        const g = s.wellGroups.find(g => g.id === groupId)
        if (!g) return
        g.wells.forEach(w => Object.assign(w, patch))
      }),

    /** Bulk-update every selected well's properties (shared property editor). */
    updateSelectedWells: patch =>
      set(s => {
        s.selectedWells.forEach(sel => {
          if (!sel.wellId) return
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          if (!g) return
          const w = g.wells.find(w => w.id === sel.wellId)
          if (w) Object.assign(w, patch)
        })
      }),

    // ── Actions: multi-selection ──────────────────────────────────────────────
    setSelectedWells: wells =>
      set(s => { s.selectedWells = wells }),

    clearSelection: () =>
      set(s => { s.selectedWells = [] }),

    toggleWellSelection: well =>
      set(s => {
        const key = selKey(well)
        const idx = s.selectedWells.findIndex(w => selKey(w) === key)
        if (idx === -1) s.selectedWells.push(well)
        else            s.selectedWells.splice(idx, 1)
      }),

    addWellsToSelection: wells =>
      set(s => {
        const existing = new Set(s.selectedWells.map(selKey))
        wells.forEach(w => {
          if (!existing.has(selKey(w))) s.selectedWells.push(w)
        })
      }),

    // ── Actions: plate-relative alignment ────────────────────────────────────

    alignToPlateLeft: () =>
      set(s => {
        // Find leftmost edge of the group, then shift all by the same delta
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [{ sel, w }] : []
        })
        if (wells.length === 0) return
        const minEdge = Math.min(...wells.map(({ w }) =>
          w.x - (w.shape === 'circular' ? w.diameter / 2 : w.xDimension / 2)
        ))
        const dx = -minEdge   // shift so leftmost edge lands at x=0
        wells.forEach(({ w }) => { w.x = Math.max(0, w.x + dx) })
      }),

    alignToPlateCenterH: () =>
      set(s => {
        const cx = s.labwareConfig.xDimension / 2
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [{ sel, w }] : []
        })
        if (wells.length === 0) return
        const minX    = Math.min(...wells.map(({ w }) => w.x))
        const maxX    = Math.max(...wells.map(({ w }) => w.x))
        const groupCx = (minX + maxX) / 2
        const dx      = cx - groupCx
        wells.forEach(({ w }) => { w.x += dx })
      }),

    alignToPlateRight: () =>
      set(s => {
        const { xDimension } = s.labwareConfig
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [{ sel, w }] : []
        })
        if (wells.length === 0) return
        const maxEdge = Math.max(...wells.map(({ w }) =>
          w.x + (w.shape === 'circular' ? w.diameter / 2 : w.xDimension / 2)
        ))
        const dx = xDimension - maxEdge   // shift so rightmost edge lands at plate right
        wells.forEach(({ w }) => { w.x += dx })
      }),

    alignToPlateTop: () =>
      set(s => {
        const { yDimension } = s.labwareConfig
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [w] : []
        })
        if (wells.length === 0) return
        const maxEdge = Math.max(...wells.map(w =>
          w.y + (w.shape === 'circular' ? w.diameter / 2 : w.yDimension / 2)
        ))
        const dy = yDimension - maxEdge
        wells.forEach(w => { w.y += dy })
      }),

    alignToPlateCenterV: () =>
      set(s => {
        const cy = s.labwareConfig.yDimension / 2
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [w] : []
        })
        if (wells.length === 0) return
        const minY    = Math.min(...wells.map(w => w.y))
        const maxY    = Math.max(...wells.map(w => w.y))
        const groupCy = (minY + maxY) / 2
        const dy      = cy - groupCy
        wells.forEach(w => { w.y += dy })
      }),

    alignToPlateBottom: () =>
      set(s => {
        const wells = s.selectedWells.flatMap(sel => {
          if (!sel.wellId) return []
          const g = s.wellGroups.find(g => g.id === sel.groupId)
          const w = g?.wells.find(w => w.id === sel.wellId)
          return w ? [w] : []
        })
        if (wells.length === 0) return
        const minEdge = Math.min(...wells.map(w =>
          w.y - (w.shape === 'circular' ? w.diameter / 2 : w.yDimension / 2)
        ))
        const dy = -minEdge
        wells.forEach(w => { w.y = Math.max(0, w.y + dy) })
      }),

    // ── Actions: selection-relative alignment ─────────────────────────────────
    // Anchor is the first item in selectedWells; others move to match it.

    alignH: () =>
      set(s => {
        const { selectedWells, wellGroups } = s
        if (selectedWells.length < 2) return
        const anchor = selectedWells[0]
        const anchorWell = wellGroups
          .find(g => g.id === anchor.groupId)
          ?.wells.find(w => w.id === anchor.wellId)
        if (!anchorWell) return
        selectedWells.slice(1).forEach(sel => {
          if (!sel.wellId) return
          const w = wellGroups.find(g => g.id === sel.groupId)?.wells.find(w => w.id === sel.wellId)
          if (w) w.y = anchorWell.y
        })
      }),

    alignV: () =>
      set(s => {
        const { selectedWells, wellGroups } = s
        if (selectedWells.length < 2) return
        const anchor = selectedWells[0]
        const anchorWell = wellGroups
          .find(g => g.id === anchor.groupId)
          ?.wells.find(w => w.id === anchor.wellId)
        if (!anchorWell) return
        selectedWells.slice(1).forEach(sel => {
          if (!sel.wellId) return
          const w = wellGroups.find(g => g.id === sel.groupId)?.wells.find(w => w.id === sel.wellId)
          if (w) w.x = anchorWell.x
        })
      }),

    // ── Actions: distribution ─────────────────────────────────────────────────
    distributeH: gap =>
      set(s => {
        const items = _resolvePositioned(s.selectedWells, s.wellGroups)
        if (items.length < 2) return
        items.sort((a, b) => a.x - b.x)
        if (gap == null) {
          const x0 = items[0].x
          const step = (items[items.length - 1].x - x0) / (items.length - 1)
          items.forEach((p, i) => { p.well.x = x0 + i * step })
        } else {
          items.forEach((p, i) => {
            if (i === 0) return
            const prev = items[i - 1]
            p.well.x = prev.well.x + prev.halfW + gap + p.halfW
          })
        }
      }),

    distributeV: gap =>
      set(s => {
        const items = _resolvePositioned(s.selectedWells, s.wellGroups)
        if (items.length < 2) return
        items.sort((a, b) => a.y - b.y)
        if (gap == null) {
          const y0 = items[0].y
          const step = (items[items.length - 1].y - y0) / (items.length - 1)
          items.forEach((p, i) => { p.well.y = y0 + i * step })
        } else {
          items.forEach((p, i) => {
            if (i === 0) return
            const prev = items[i - 1]
            p.well.y = prev.well.y + prev.halfH + gap + p.halfH
          })
        }
      }),

    setActiveTool: tool =>
      set(s => { s.activeTool = tool }),

    setPendingMultiWells: region =>
      set(s => { s.pendingMultiWells = { region } }),

    clearPendingMultiWells: () =>
      set(s => { s.pendingMultiWells = null }),

    // ── Actions: copy / paste ─────────────────────────────────────────────────
    copySelectedWells: () => {
      const s = get()
      const wells = []
      s.selectedWells.forEach(sel => {
        if (!sel.wellId) return
        const g = s.wellGroups.find(g => g.id === sel.groupId)
        const w = g?.wells.find(w => w.id === sel.wellId)
        if (w) wells.push({ ...w })   // shallow copy; id will be regenerated on paste
      })
      if (wells.length > 0) set(st => { st.clipboard = wells })
    },

    pasteWells: () => {
      const s = get()
      if (!s.clipboard || s.clipboard.length === 0) return
      const OFFSET = 5   // mm — shift right and down
      // Inline snapshot so paste is undoable
      const snap = {
        wellGroups:      JSON.parse(JSON.stringify(s.wellGroups)),
        labwareConfig:   JSON.parse(JSON.stringify(s.labwareConfig)),
        selectedWells:   JSON.parse(JSON.stringify(s.selectedWells)),
        selectedGroupId: s.selectedGroupId,
      }
      set(st => {
        st.past.push(snap)
        if (st.past.length > 60) st.past.shift()
        st.future = []
        const newGroup = makeGroup({ name: 'Pasted Wells' })
        st.clipboard.forEach(w => {
          newGroup.wells.push(makeWell(
            w.x + OFFSET,
            Math.max(0, w.y - OFFSET),
            {
              shape:             w.shape,
              diameter:          w.diameter,
              xDimension:        w.xDimension,
              yDimension:        w.yDimension,
              depth:             w.depth,
              totalLiquidVolume: w.totalLiquidVolume,
              bottomShape:       w.bottomShape,
            }
          ))
        })
        st.wellGroups.push(newGroup)
        st.selectedGroupId = newGroup.id
        st.selectedWells = newGroup.wells.map(w => ({
          groupId: newGroup.id, name: '', wellId: w.id,
        }))
      })
    },

    // ── Actions: import ───────────────────────────────────────────────────────
    loadFromSchema: ({ labwareConfig, wellGroups }) =>
      set(s => {
        Object.assign(s.labwareConfig, labwareConfig)
        s.wellGroups = wellGroups
        s.selectedGroupId = wellGroups[0]?.id ?? null
        s.selectedWells = []
      }),

    // ── History: undo / redo ─────────────────────────────────────────────────
    // past/future hold plain-object snapshots of the mutable parts of state.
    past:   [],
    future: [],

    /**
     * Push the current state onto the undo stack and clear the redo stack.
     * Call this BEFORE any mutation that should be undoable (well move, add,
     * delete, property change, etc.).
     */
    snapshot: () => {
      // Use get() so we read the real (non-proxied) state outside of set().
      const s = get()
      const snap = {
        wellGroups:      JSON.parse(JSON.stringify(s.wellGroups)),
        labwareConfig:   JSON.parse(JSON.stringify(s.labwareConfig)),
        selectedWells:   JSON.parse(JSON.stringify(s.selectedWells)),
        selectedGroupId: s.selectedGroupId,
      }
      set(st => {
        st.past.push(snap)
        if (st.past.length > 60) st.past.shift()
        st.future = []
      })
    },

    undo: () =>
      set(st => {
        if (st.past.length === 0) return
        // Snapshot current state to the redo stack
        st.future.push({
          wellGroups:      JSON.parse(JSON.stringify(st.wellGroups)),
          labwareConfig:   JSON.parse(JSON.stringify(st.labwareConfig)),
          selectedWells:   JSON.parse(JSON.stringify(st.selectedWells)),
          selectedGroupId: st.selectedGroupId,
        })
        // Restore previous state
        const snap = st.past.pop()
        st.wellGroups      = snap.wellGroups
        st.labwareConfig   = snap.labwareConfig
        st.selectedWells   = snap.selectedWells
        st.selectedGroupId = snap.selectedGroupId
      }),

    redo: () =>
      set(st => {
        if (st.future.length === 0) return
        st.past.push({
          wellGroups:      JSON.parse(JSON.stringify(st.wellGroups)),
          labwareConfig:   JSON.parse(JSON.stringify(st.labwareConfig)),
          selectedWells:   JSON.parse(JSON.stringify(st.selectedWells)),
          selectedGroupId: st.selectedGroupId,
        })
        const snap = st.future.pop()
        st.wellGroups      = snap.wellGroups
        st.labwareConfig   = snap.labwareConfig
        st.selectedWells   = snap.selectedWells
        st.selectedGroupId = snap.selectedGroupId
      }),
  }))
)

// ── Exported pure helpers ─────────────────────────────────────────────────────

/**
 * Compute distance statistics between two well objects.
 * Returns signed deltas (target − anchor), absolute values, and Euclidean distance.
 */
export function getDistanceStats(anchor, target) {
  const dx = target.x - anchor.x
  const dy = target.y - anchor.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  return {
    dx:       +dx.toFixed(4),
    dy:       +dy.toFixed(4),
    absDX:    +Math.abs(dx).toFixed(4),
    absDY:    +Math.abs(dy).toFixed(4),
    distance: +distance.toFixed(4),
  }
}

// ── Internal helper ───────────────────────────────────────────────────────────

function _resolvePositioned(selectedWells, wellGroups) {
  const items = []
  selectedWells.forEach(sel => {
    if (!sel.wellId) return
    const g = wellGroups.find(g => g.id === sel.groupId)
    if (!g) return
    const well = g.wells.find(w => w.id === sel.wellId)
    if (!well) return
    const halfW = well.shape === 'circular' ? well.diameter / 2 : well.xDimension / 2
    const halfH = well.shape === 'circular' ? well.diameter / 2 : well.yDimension / 2
    items.push({ well, x: well.x, y: well.y, halfW, halfH })
  })
  return items
}
