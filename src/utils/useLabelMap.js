/**
 * useLabelMap — shared hook that returns the globally-computed label map and
 * flat well list, memoized against the current store state.
 *
 * Both CanvasView and LeftPanel import this so the computation is written once
 * and the dependency array is consistent.
 */

import { useMemo } from 'react'
import { useLabwareStore } from '../store/useLabwareStore'
import { generateOpentronsLabels } from './wellNaming'

export function useLabelMap() {
  const wellGroups = useLabwareStore(s => s.wellGroups)
  const yDim       = useLabwareStore(s => s.labwareConfig.yDimension)

  return useMemo(
    () => generateOpentronsLabels(wellGroups, yDim),
    [wellGroups, yDim]
  )
}
