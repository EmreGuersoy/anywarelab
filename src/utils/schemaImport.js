/**
 * schemaImport.js
 *
 * Parses labware JSON files into the internal app state shape.
 *
 * Handles two formats:
 *  A) Opentrons v2 schema  — "totalLiquidVolume", "xDimension", "yDimension"
 *  B) Legacy / custom       — "total-liquid-volume", "height", "length", "width"
 *
 * All imported wells become flat individual well objects (no grid groups).
 * Wells with identical geometry are bucketed into the same group for
 * organisational clarity; within each bucket a grid is detected and, if found,
 * positions are used directly (the group is still flat — no grid params stored).
 */

let _importGid = 0
let _importWid = 0

const makeImportId = () => `iw_${++_importWid}`

// ── Field normalisation ───────────────────────────────────────────────────────

function normaliseWell(name, raw) {
  const x = raw.x
  const y = raw.y
  if (x == null || y == null) return null

  const depth            = raw.depth ?? raw.height ?? 0
  const totalLiquidVolume = raw.totalLiquidVolume ?? raw['total-liquid-volume'] ?? 0
  const isCircular       = raw.diameter != null || raw.shape === 'circular'

  if (isCircular) {
    return {
      name, x, y,
      depth, totalLiquidVolume,
      shape:    'circular',
      diameter: raw.diameter ?? raw.width ?? raw.length ?? 1,
      xDimension: 8.2, yDimension: 8.2,  // kept for completeness
      bottomShape: 'flat',
    }
  }

  return {
    name, x, y,
    depth, totalLiquidVolume,
    shape:      'rectangular',
    xDimension: raw.xDimension ?? raw.length ?? raw.width ?? 1,
    yDimension: raw.yDimension ?? raw.width  ?? raw.length ?? 1,
    diameter:   6.86,
    bottomShape: 'flat',
  }
}

// ── Geometry key ──────────────────────────────────────────────────────────────

function geometryKey(w) {
  if (w.shape === 'circular')
    return `circ_d${w.diameter}_dep${w.depth}_vol${w.totalLiquidVolume}`
  return `rect_${w.xDimension}x${w.yDimension}_dep${w.depth}_vol${w.totalLiquidVolume}`
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseLabwareJSON(json) {
  if (!json || typeof json !== 'object') throw new Error('Not a valid JSON object.')

  const rawWells = json.wells ?? (json.x != null ? { well: json } : null)
  if (!rawWells || Object.keys(rawWells).length === 0)
    throw new Error('No "wells" object found in the file.')

  const dims = json.dimensions ?? {}
  const labwareConfig = {
    xDimension:  dims.xDimension  ?? dims.x ?? 127.76,
    yDimension:  dims.yDimension  ?? dims.y ?? 85.48,
    zDimension:  dims.zDimension  ?? dims.z ?? 14.22,
    displayName: json.metadata?.displayName ?? json.name ?? 'Imported Labware',
    brand:       json.brand?.brand ?? json.brand ?? 'Imported',
    loadName:    json.parameters?.loadName ?? 'imported_labware',
  }

  const normalized = Object.entries(rawWells)
    .map(([name, raw]) => normaliseWell(name, raw))
    .filter(Boolean)

  if (normalized.length === 0) throw new Error('No valid wells found in the file.')

  // Bucket by shared geometry → one group per geometry type
  const buckets = new Map()
  normalized.forEach(w => {
    const key = geometryKey(w)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(w)
  })

  const wellGroups = []
  let gi = 0

  for (const [, normedWells] of buckets) {
    gi++
    const sample = normedWells[0]

    // Build flat well objects — each well is an independent entity
    const groupWells = normedWells.map(w => ({
      id:               makeImportId(),
      x:                w.x,
      y:                w.y,
      shape:            w.shape,
      diameter:         w.diameter,
      xDimension:       w.xDimension,
      yDimension:       w.yDimension,
      depth:            w.depth,
      totalLiquidVolume: w.totalLiquidVolume,
      bottomShape:      w.bottomShape ?? 'flat',
    }))

    wellGroups.push({
      id:    `import_grp_${++_importGid}`,
      name:  `Group ${gi}`,
      wells: groupWells,
    })
  }

  return { labwareConfig, wellGroups }
}
