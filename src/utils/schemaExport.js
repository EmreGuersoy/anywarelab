/**
 * schemaExport.js
 *
 * Maps the app's internal state to the Opentrons Labware Schema v2 JSON format.
 *
 * Well properties are now per-well (not shared at group level).
 * Labels and ordering come from generateOpentronsLabels so they are always
 * globally unique and position-consistent.
 */

import { generateOpentronsLabels } from './wellNaming'

const LABWARE_TYPE_TO_CATEGORY = {
  wellPlate:     'wellPlate',
  reservoir:     'reservoir',
  tubeRack:      'tubeRack',
  tipRack:       'tipRack',
  aluminumBlock: 'aluminumBlock',
}

const round2 = n => Math.round(n * 100) / 100

export function buildOpentronSchema(labwareConfig, wellGroups) {
  const {
    xDimension, yDimension, zDimension,
    displayName, brand, loadName, labwareType,
    tipLength,
  } = labwareConfig

  const { labelMap, ordering } = generateOpentronsLabels(wellGroups, yDimension)

  const wells  = {}
  const groups = []

  wellGroups.forEach(group => {
    const groupWellNames = []

    group.wells.forEach(w => {
      const key = `${group.id}::id::${w.id}`
      const lbl = labelMap.get(key)
      if (!lbl) return

      const isTipRack  = labwareType === 'tipRack'
      const wellDepth  = isTipRack ? (tipLength ?? 0) : w.depth
      const def = {
        depth:             wellDepth,
        totalLiquidVolume: w.totalLiquidVolume,
        shape:             w.shape,
        x: round2(w.x),
        y: round2(w.y),
        z: round2(Math.max(0, zDimension - wellDepth)),
      }
      if (w.shape === 'circular') {
        def.diameter = w.diameter
      } else {
        def.xDimension = w.xDimension
        def.yDimension = w.yDimension
      }
      wells[lbl] = def
      groupWellNames.push(lbl)
    })

    const isTipRackGroup = labwareType === 'tipRack'
    const bottomShape    = group.wells[0]?.bottomShape ?? 'flat'

    groups.push({
      metadata: isTipRackGroup ? {} : {
        wellBottomShape: bottomShape,
        displayName:     group.name,
      },
      wells: groupWellNames,
    })
  })

  const safeLoadName = (loadName || 'custom_labware')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')

  return {
    ordering,
    brand: { brand, brandId: [] },
    metadata: {
      displayName,
      displayCategory: LABWARE_TYPE_TO_CATEGORY[labwareType] ?? 'wellPlate',
      displayVolumeUnits: 'µL',
      tags: [],
    },
    dimensions: { xDimension, yDimension, zDimension },
    wells,
    groups,
    parameters: {
      format:                     'irregular',
      quirks:                     [],
      isTiprack:                  labwareType === 'tipRack',
      isMagneticModuleCompatible: false,
      loadName:                   safeLoadName,
      ...(labwareType === 'tipRack' && { tipLength: tipLength ?? 0 }),
    },
    namespace:            'custom_beta',
    version:              1,
    schemaVersion:        2,
    cornerOffsetFromSlot: { x: 0, y: 0, z: 0 },
    // TODO: stacking adapter export
    // ...(stackingAdapter && {
    //   stackingOffsetWithLabware: { x: stackingOffsetX ?? 0, y: stackingOffsetY ?? 0, z: stackingOffsetZ ?? 0 },
    // }),
  }
}

/**
 * Serialize schema to JSON with ordering columns on single lines.
 * Everything else uses 2-space indentation.
 */
function serializeSchema(schema) {
  const json = JSON.stringify(schema, null, 2)
  // Collapse each ordering column array [ "A1", "B1", ... ] onto one line
  return json.replace(
    /\[\n(\s+"[A-Z]+\d+"(?:,\n\s+"[A-Z]+\d+")*)\n\s+\]/g,
    (_, inner) => '[' + inner.trim().replace(/,\s*\n\s*/g, ', ') + ']'
  )
}

export function downloadSchema(labwareConfig, wellGroups) {
  const schema = buildOpentronSchema(labwareConfig, wellGroups)
  const blob   = new Blob([serializeSchema(schema)], { type: 'application/json' })
  const url    = URL.createObjectURL(blob)
  const a      = document.createElement('a')
  a.href       = url
  a.download   = `${schema.parameters.loadName}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
