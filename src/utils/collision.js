/**
 * collision.js — Well overlap detection and resolution.
 *
 * All functions operate on plain well objects with shape, x, y,
 * diameter (circular) or xDimension/yDimension (rectangular).
 */

/**
 * Compute the Minimum Translation Vector (MTV) to push well `a` out of well `b`.
 * Returns { x, y } to add to a's position, or null if no overlap.
 */
export function getOverlapMTV(a, b) {
  const aCirc = a.shape === 'circular'
  const bCirc = b.shape === 'circular'

  // ── Circle vs Circle ──────────────────────────────────────────────────────
  if (aCirc && bCirc) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const distSq  = dx * dx + dy * dy
    const minDist = a.diameter / 2 + b.diameter / 2
    if (distSq >= minDist * minDist) return null
    const dist    = Math.sqrt(distSq)
    if (dist < 1e-9) return { x: minDist, y: 0 }   // coincident
    const overlap = minDist - dist
    return { x: (dx / dist) * overlap, y: (dy / dist) * overlap }
  }

  // ── Rect vs Rect (AABB) ───────────────────────────────────────────────────
  if (!aCirc && !bCirc) {
    const dx       = a.x - b.x
    const dy       = a.y - b.y
    const overlapX = (a.xDimension + b.xDimension) / 2 - Math.abs(dx)
    const overlapY = (a.yDimension + b.yDimension) / 2 - Math.abs(dy)
    if (overlapX <= 0 || overlapY <= 0) return null
    // Push along axis of least penetration
    if (overlapX <= overlapY) {
      return { x: overlapX * Math.sign(dx || 1), y: 0 }
    }
    return { x: 0, y: overlapY * Math.sign(dy || 1) }
  }

  // ── Circle vs Rect (mixed) ────────────────────────────────────────────────
  const [circle, rect, flip] = aCirc ? [a, b, false] : [b, a, true]
  const r  = circle.diameter / 2
  const hw = rect.xDimension / 2
  const hh = rect.yDimension / 2
  const dx = circle.x - rect.x
  const dy = circle.y - rect.y
  // Closest point on rect to circle centre
  const closestX = Math.max(-hw, Math.min(dx, hw))
  const closestY = Math.max(-hh, Math.min(dy, hh))
  const diffX    = dx - closestX
  const diffY    = dy - closestY
  const distSq   = diffX * diffX + diffY * diffY
  if (distSq >= r * r) return null
  const dist = Math.sqrt(distSq)
  let mvx, mvy
  if (dist < 1e-9) { mvx = r; mvy = 0 }
  else { const ov = r - dist; mvx = (diffX / dist) * ov; mvy = (diffY / dist) * ov }
  return flip ? { x: -mvx, y: -mvy } : { x: mvx, y: mvy }
}

/**
 * Resolve the position of a single `moving` well against an array of obstacles.
 * Iterates until no overlaps remain.
 * Returns { x, y }.
 */
export function resolveWellPosition(moving, obstacles, maxIter = 8) {
  let x = moving.x
  let y = moving.y
  for (let iter = 0; iter < maxIter; iter++) {
    let resolved = true
    const current = { ...moving, x, y }
    for (const obs of obstacles) {
      const mtv = getOverlapMTV(current, obs)
      if (mtv) {
        x += mtv.x
        y += mtv.y
        current.x = x
        current.y = y
        resolved = false
      }
    }
    if (resolved) break
  }
  return { x, y }
}

/**
 * For a multi-well move: find the single composite offset that pushes the
 * entire group away from all obstacles, preserving relative well positions.
 * Returns { dx, dy } to add to every well in the group.
 */
export function resolveGroupVsObstacles(movers, obstacles, maxIter = 8) {
  let adjX = 0
  let adjY = 0
  for (let iter = 0; iter < maxIter; iter++) {
    let maxLen = 0
    let bestMTV = null
    for (const w of movers) {
      const current = { ...w, x: w.x + adjX, y: w.y + adjY }
      for (const obs of obstacles) {
        const mtv = getOverlapMTV(current, obs)
        if (mtv) {
          const len = mtv.x * mtv.x + mtv.y * mtv.y
          if (len > maxLen) { maxLen = len; bestMTV = mtv }
        }
      }
    }
    if (!bestMTV) break
    adjX += bestMTV.x
    adjY += bestMTV.y
  }
  return { dx: adjX, dy: adjY }
}

/**
 * After alignH (all wells share the same Y), resolve X-axis overlaps by
 * sorting wells left→right and nudging each rightward to clear the previous.
 * Mutates well objects in place; returns the sorted array.
 */
export function resolveAlignHOverlaps(wells) {
  const sorted = [...wells].sort((a, b) => a.x - b.x)
  for (let i = 1; i < sorted.length; i++) {
    const prev   = sorted[i - 1]
    const curr   = sorted[i]
    const prevHW = prev.shape === 'circular' ? prev.diameter / 2 : prev.xDimension / 2
    const currHW = curr.shape === 'circular' ? curr.diameter / 2 : curr.xDimension / 2
    const minDist = prevHW + currHW
    if (curr.x - prev.x < minDist) curr.x = prev.x + minDist
  }
  return sorted
}

/**
 * After alignV (all wells share the same X), resolve Y-axis overlaps by
 * sorting wells bottom→top and nudging each upward to clear the previous.
 * Mutates well objects in place; returns the sorted array.
 */
export function resolveAlignVOverlaps(wells) {
  const sorted = [...wells].sort((a, b) => a.y - b.y)
  for (let i = 1; i < sorted.length; i++) {
    const prev   = sorted[i - 1]
    const curr   = sorted[i]
    const prevHH = prev.shape === 'circular' ? prev.diameter / 2 : prev.yDimension / 2
    const currHH = curr.shape === 'circular' ? curr.diameter / 2 : curr.yDimension / 2
    const minDist = prevHH + currHH
    if (curr.y - prev.y < minDist) curr.y = prev.y + minDist
  }
  return sorted
}
