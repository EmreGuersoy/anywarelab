/**
 * TemplateThumbnail — renders a scaled SVG preview of a labware schema.
 *
 * Coordinate system: wells use Opentrons convention (y=0 at bottom),
 * so we flip: svgY = yDim - oy.
 */
export function TemplateThumbnail({ schema, width = 200, height = 134 }) {
  if (!schema?.labwareConfig || !schema?.wellGroups) {
    return <div style={{ width, height }} className="bg-gray-100 rounded" />
  }

  const { xDimension: xDim, yDimension: yDim } = schema.labwareConfig
  const wells = schema.wellGroups.flatMap(g => g.wells ?? [])

  const PAD = 2
  const vw = xDim + PAD * 2
  const vh = yDim + PAD * 2

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${vw} ${vh}`}
      className="block"
    >
      {/* Plate body */}
      <rect x={PAD} y={PAD} width={xDim} height={yDim} rx={2} ry={2}
        fill="#f3f4f6" stroke="#d1d5db" strokeWidth={0.8} />

      {/* Wells */}
      {wells.map((w, i) => {
        const sx = PAD + w.x
        const sy = PAD + (yDim - w.y)

        if (w.shape === 'rectangular') {
          return (
            <rect
              key={w.id ?? i}
              x={sx - w.xDimension / 2}
              y={sy - w.yDimension / 2}
              width={w.xDimension}
              height={w.yDimension}
              rx={0.5}
              fill="#6b7280"
            />
          )
        }
        return (
          <circle
            key={w.id ?? i}
            cx={sx}
            cy={sy}
            r={Math.max(0.5, (w.diameter ?? 6.86) / 2)}
            fill="#6b7280"
          />
        )
      })}
    </svg>
  )
}
