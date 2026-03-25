/**
 * LabwareMesh.jsx
 *
 * Renders the 3D representation of the labware inside a @react-three/fiber Canvas.
 *
 * Coordinate mapping:
 *   Opentrons:  x = right, y = back  (origin = front-left)
 *   Three.js:   x = right, y = up,  z = toward viewer
 *
 *   otToThree(ox, oy):
 *     three.x = ox  − xDim/2          (shift so slab is centred at origin)
 *     three.y = (handled per use-case)
 *     three.z = −(oy − yDim/2)        (flip y→z, back of plate is −z)
 */

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useLabwareStore } from '../store/useLabwareStore'
import { getGroupWells } from '../utils/wellNaming'

// ── Coordinate helpers ────────────────────────────────────────────────────────

/** Opentrons (ox, oy) → Three.js [x, z] (horizontal plane). */
function otXZ(ox, oy, xDim, yDim) {
  return [ox - xDim / 2, -(oy - yDim / 2)]
}

/** Three.js intersection point → Opentrons (ox, oy). */
export function threeToOT(point, xDim, yDim) {
  return {
    x: point.x + xDim / 2,
    y: yDim / 2 - point.z,
  }
}

// ── Well group renderer ────────────────────────────────────────────────────────

function WellGroup({ group, xDim, yDim, zDim }) {
  const wells = useMemo(
    () => getGroupWells(group, yDim),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, yDim]
  )

  // Wells sit flush against the top surface and drill downward
  const wellY = zDim / 2 - group.depth / 2

  return (
    <group>
      {wells.map(({ name, x, y }) => {
        const [tx, tz] = otXZ(x, y, xDim, yDim)

        if (group.shape === 'circular') {
          return (
            <mesh key={name} position={[tx, wellY, tz]} castShadow>
              <cylinderGeometry
                args={[group.diameter / 2, group.diameter / 2, group.depth, 20]}
              />
              <meshStandardMaterial
                color="#0d2137"
                roughness={0.4}
                metalness={0.3}
              />
            </mesh>
          )
        }

        return (
          <mesh key={name} position={[tx, wellY, tz]} castShadow>
            <boxGeometry args={[group.xDimension, group.depth, group.yDimension]} />
            <meshStandardMaterial
              color="#0d2137"
              roughness={0.4}
              metalness={0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ── A1 corner marker ──────────────────────────────────────────────────────────

function A1Marker({ xDim, yDim, zDim }) {
  // A1 is front-left in Opentrons space → (xOffset≈14, yDim-yOffset≈74) in OT coords
  // But just show a dot at the front-left physical corner
  const x = -xDim / 2 + 4
  const z =  yDim / 2 - 4
  const y =  zDim / 2 + 1.5

  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[2, 12, 12]} />
      <meshStandardMaterial color="#f85149" emissive="#f85149" emissiveIntensity={0.4} />
    </mesh>
  )
}

// ── Click plane for manual well placement ─────────────────────────────────────

function ClickPlane({ xDim, yDim, zDim, onPlace }) {
  const { gl } = useThree()
  const ref = useRef()

  return (
    <mesh
      ref={ref}
      position={[0, zDim / 2 + 0.2, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={e => {
        e.stopPropagation()
        if (onPlace) onPlace(e.point)
      }}
    >
      <planeGeometry args={[xDim, yDim]} />
      {/* transparent but still raycasted */}
      <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function LabwareMesh() {
  const {
    labwareConfig,
    wellGroups,
    selectedGroupId,
    manualPlacementActive,
    addManualWell,
  } = useLabwareStore()

  const { xDimension: xDim, yDimension: yDim, zDimension: zDim } = labwareConfig

  // Memoize edge geometry so it is not recreated every frame
  const edgesGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(xDim, zDim, yDim)),
    [xDim, zDim, yDim]
  )

  function handleSurfaceClick(point) {
    if (!manualPlacementActive || !selectedGroupId) return
    const { x, y } = threeToOT(point, xDim, yDim)
    // Clamp to footprint bounds
    const ox = Math.max(0, Math.min(xDim, x))
    const oy = Math.max(0, Math.min(yDim, y))
    addManualWell(selectedGroupId, ox, oy)
  }

  return (
    <group>
      {/* ── Labware body ── */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[xDim, zDim, yDim]} />
        <meshStandardMaterial
          color="#a8c4d8"
          transparent
          opacity={0.82}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>

      {/* ── Wireframe outline ── */}
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color="#4a7fa5" linewidth={1} />
      </lineSegments>

      {/* ── Wells for each group ── */}
      {wellGroups.map(group => (
        <WellGroup
          key={group.id}
          group={group}
          xDim={xDim}
          yDim={yDim}
          zDim={zDim}
        />
      ))}

      {/* ── A1 corner marker ── */}
      <A1Marker xDim={xDim} yDim={yDim} zDim={zDim} />

      {/* ── Manual-placement click target ── */}
      {manualPlacementActive && (
        <ClickPlane
          xDim={xDim}
          yDim={yDim}
          zDim={zDim}
          onPlace={handleSurfaceClick}
        />
      )}
    </group>
  )
}
