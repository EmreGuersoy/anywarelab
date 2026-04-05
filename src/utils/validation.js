/**
 * validation.js
 * Shared validation logic for labware definitions.
 * Used by CanvasView (visual indicators) and the export gate.
 */

// ── Well boundary violation ────────────────────────────────────────────────────

/**
 * Returns 'outside' | 'clipped' | null for a well vs the plate footprint.
 *  outside  → well centre is outside the footprint (red)
 *  clipped  → centre is inside but one or more edges cross the boundary (orange)
 */
export function getWellViolation(w, xDim, yDim) {
  if (w.x < 0 || w.x > xDim || w.y < 0 || w.y > yDim) return 'outside'
  const hw = w.shape === 'circular' ? w.diameter / 2 : w.xDimension / 2
  const hh = w.shape === 'circular' ? w.diameter / 2 : w.yDimension / 2
  if (w.x - hw < 0 || w.x + hw > xDim || w.y - hh < 0 || w.y + hh > yDim) return 'clipped'
  return null
}

// ── Full labware validation ────────────────────────────────────────────────────

/**
 * Returns { errors: string[], warnings: string[] }.
 * Errors block export; warnings require confirmation.
 */
export function validateLabware(labwareConfig, wellGroups) {
  const { xDimension: xDim, yDimension: yDim, zDimension: zDim } = labwareConfig

  const errors   = []
  const warnings = []

  let depthCount   = 0
  let outsideCount = 0
  let clippedCount = 0
  let totalWells   = 0

  wellGroups.forEach(g => {
    g.wells.forEach(w => {
      totalWells++
      if (w.depth > zDim) depthCount++
      const v = getWellViolation(w, xDim, yDim)
      if (v === 'outside') outsideCount++
      else if (v === 'clipped') clippedCount++
    })
  })

  if (totalWells === 0) {
    errors.push('No wells have been placed. Add at least one well before exporting.')
  }

  if (depthCount > 0) {
    errors.push(
      `${depthCount} well${depthCount > 1 ? 's have a depth' : ' has a depth'} exceeding ` +
      `the plate Height (Z = ${zDim} mm). Reduce the well Depth (Z) or increase the plate height.`
    )
  }

  if (outsideCount > 0) {
    warnings.push(
      `${outsideCount} well${outsideCount > 1 ? 's are' : ' is'} outside the plate footprint. ` +
      `The robot may not be able to access ${outsideCount > 1 ? 'them' : 'it'}.`
    )
  }

  if (clippedCount > 0) {
    warnings.push(
      `${clippedCount} well${clippedCount > 1 ? 's' : ''} partially extend outside the plate ` +
      `footprint. Verify the well dimensions are intentional.`
    )
  }

  return { errors, warnings }
}
