/**
 * wellNaming.js
 *
 * All wells are now flat individual objects — there are no "grid groups."
 * This file provides:
 *   - wellName()                  letter+number label from row/col indices
 *   - getGroupWells()             flat accessor (returns group.wells directly)
 *   - generateOpentronsLabels()   global position-based labeling engine
 */

// ── Label construction ─────────────────────────────────────────────────────────

/** Build a well name from zero-based row & column indices. Supports >25 rows. */
export function wellName(rowIdx, colIdx) {
  if (rowIdx > 25) {
    const hi = String.fromCharCode(65 + Math.floor(rowIdx / 26) - 1)
    const lo = String.fromCharCode(65 + (rowIdx % 26))
    return `${hi}${lo}${colIdx + 1}`
  }
  return `${String.fromCharCode(65 + rowIdx)}${colIdx + 1}`
}

// ── Group accessor ─────────────────────────────────────────────────────────────

/**
 * Return the wells for a group.
 * Since all groups are now flat, this is a direct passthrough.
 * Each returned object is the well itself: { id, x, y, shape, diameter, … }
 */
export function getGroupWells(group) {
  return group.wells
}

// ── Global position-based labeling engine ─────────────────────────────────────

/**
 * Generate globally unique Opentrons-style labels for every well across all
 * groups using physical X/Y position.
 *
 * Algorithm:
 *  1. Collect every well from every group with a stable lookup key.
 *  2. Sort by Y descending (row A = back = highest Y).
 *  3. Band into rows with a tolerance — wells within `tolerance` mm in Y
 *     are treated as the same row.
 *  4. Within each row band, sort by X ascending (col 1 = leftmost).
 *  5. Assign wellName(rowIdx, colIdx) labels globally.
 *  6. Build the Opentrons column-major ordering array.
 *
 * Well key format (matches selKey in useLabwareStore):
 *   `${groupId}::id::${wellId}`   e.g. "grp_1::id::w_3"
 *
 * @param {object[]} wellGroups   groups from the store
 * @param {number}   yDim         labware yDimension (mm) — unused for computation,
 *                                kept for API compatibility with callers
 * @param {number}   [tolerance=2] max Y-difference (mm) to treat as same row
 * @returns {{
 *   labelMap: Map<string,string>,
 *   ordering: string[][],
 *   flatWells: Array<{key:string, x:number, y:number, label:string}>
 * }}
 */
export function generateOpentronsLabels(wellGroups, yDim, tolerance = 2) {
  // 1. Collect all wells with stable keys
  const all = []
  for (const group of wellGroups) {
    for (const w of group.wells) {
      all.push({ key: `${group.id}::id::${w.id}`, x: w.x, y: w.y })
    }
  }

  if (all.length === 0) return { labelMap: new Map(), ordering: [], flatWells: [] }

  // 2. Sort by Y descending (highest Y = row A = back of labware)
  all.sort((a, b) => b.y - a.y)

  // 3. Greedy row-banding
  const bands = []
  let band  = [all[0]]
  let bandY = all[0].y

  for (let i = 1; i < all.length; i++) {
    if (Math.abs(all[i].y - bandY) <= tolerance) {
      band.push(all[i])
    } else {
      bands.push(band)
      band  = [all[i]]
      bandY = all[i].y
    }
  }
  bands.push(band)

  // 4. Within each band sort by X ascending (col 1 = leftmost)
  bands.forEach(b => b.sort((a, b) => a.x - b.x))

  // 5. Assign labels
  const labelMap = new Map()
  const flatWells = []
  bands.forEach((b, rowIdx) => {
    b.forEach((well, colIdx) => {
      const label = wellName(rowIdx, colIdx)
      labelMap.set(well.key, label)
      flatWells.push({ key: well.key, x: well.x, y: well.y, label })
    })
  })

  // 6. Column-major ordering
  const colMap = new Map()
  flatWells.forEach(({ label }) => {
    const col = parseInt(label.match(/\d+/)[0], 10)
    if (!colMap.has(col)) colMap.set(col, [])
    colMap.get(col).push(label)
  })
  colMap.forEach(col => col.sort())

  const ordering = [...colMap.keys()]
    .sort((a, b) => a - b)
    .map(col => colMap.get(col))

  return { labelMap, ordering, flatWells }
}
