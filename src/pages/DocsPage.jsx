/**
 * DocsPage.jsx — Full documentation for Anywarelab.
 * Layout: sticky sidebar (left) + scrollable content (right).
 */

import { useState, useEffect, useRef } from 'react'

// ── Content data ──────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    group: 'Overview',
    items: [
      { id: 'introduction',  label: 'Introduction'     },
      { id: 'quick-start',   label: 'Quick Start'      },
      { id: 'interface',     label: 'Interface Layout'  },
    ],
  },
  {
    group: 'Labware',
    items: [
      { id: 'labware-types', label: 'Labware Types'    },
      { id: 'plate-dims',    label: 'Plate Dimensions' },
      { id: 'well-groups',   label: 'Well Groups'      },
    ],
  },
  {
    group: 'Canvas & Tools',
    items: [
      { id: 'tools',         label: 'Placement Tools'  },
      { id: 'well-props',    label: 'Well Properties'  },
      { id: 'edge-offsets',  label: 'Edge Offsets'     },
      { id: 'constraints',   label: 'Boundary Constraints' },
    ],
  },
  {
    group: 'Alignment',
    items: [
      { id: 'align-plate',   label: 'Align to Plate'   },
      { id: 'align-each',    label: 'Align to Each Other' },
      { id: 'distribute',    label: 'Distribute'        },
    ],
  },
  {
    group: 'Import & Export',
    items: [
      { id: 'export-json',   label: 'Export JSON'      },
      { id: 'export-png',    label: 'Export PNG'        },
      { id: 'import-json',   label: 'Import JSON'      },
    ],
  },
  {
    group: 'Reference',
    items: [
      { id: 'shortcuts',     label: 'Keyboard Shortcuts' },
      { id: 'schema',        label: 'Schema Reference'   },
      { id: 'coordinate',    label: 'Coordinate System'  },
    ],
  },
]

const ALL_IDS = SECTIONS.flatMap(s => s.items.map(i => i.id))

// ── Primitive components ──────────────────────────────────────────────────────

function H1({ children }) {
  return <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">{children}</h1>
}
function H2({ id, children }) {
  return (
    <h2 id={id} className="text-xl font-bold text-gray-900 mt-12 mb-4 scroll-mt-6 flex items-center gap-2 group">
      {children}
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-40 transition-opacity text-gray-400 font-normal text-base">#</a>
    </h2>
  )
}
function H3({ children }) {
  return <h3 className="text-sm font-semibold text-gray-900 mt-6 mb-2">{children}</h3>
}
function P({ children }) {
  return <p className="text-sm text-gray-600 leading-relaxed mb-3">{children}</p>
}
function Li({ children }) {
  return <li className="text-sm text-gray-600 leading-relaxed">{children}</li>
}
function Ul({ children }) {
  return <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-gray-600">{children}</ul>
}
function Ol({ children }) {
  return <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-gray-600">{children}</ol>
}
function Code({ children }) {
  return <code className="font-mono text-[11px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded border border-gray-200">{children}</code>
}
function CodeBlock({ children }) {
  return (
    <pre className="bg-gray-900 text-gray-100 rounded-lg px-4 py-3.5 text-[11px] font-mono leading-relaxed overflow-x-auto mb-4 border border-gray-800">
      {children}
    </pre>
  )
}
function Note({ children }) {
  return (
    <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
      <span className="text-blue-500 flex-shrink-0 text-sm mt-0.5">ℹ</span>
      <p className="text-sm text-blue-800 leading-relaxed">{children}</p>
    </div>
  )
}
function Warn({ children }) {
  return (
    <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-4">
      <span className="text-orange-500 flex-shrink-0 text-sm mt-0.5">⚠</span>
      <p className="text-sm text-orange-800 leading-relaxed">{children}</p>
    </div>
  )
}
function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto mb-4 rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-700 align-top border-b border-gray-100 last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
function Divider() {
  return <hr className="border-gray-100 my-10" />
}
function Badge({ color = 'gray', children }) {
  const cls = {
    gray:   'bg-gray-100 text-gray-700 border-gray-200',
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    green:  'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red:    'bg-red-50 text-red-700 border-red-200',
  }[color]
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cls}`}>{children}</span>
}

// ── Documentation content ─────────────────────────────────────────────────────

function DocContent() {
  return (
    <div className="max-w-3xl">

      {/* ── Introduction ── */}
      <H1>Anywarelab Documentation</H1>
      <P>
        Anywarelab is a browser-based custom labware designer for the Opentrons liquid handling platform.
        It lets you visually place wells, configure their physical properties, and export a ready-to-use
        Opentrons Labware Schema v2 JSON file — no coding required.
      </P>
      <Note>
        This documentation covers the current version of the designer. The application is under active development;
        some features may change between releases.
      </Note>

      <Divider />

      {/* ── Quick Start ── */}
      <H2 id="quick-start">Quick Start</H2>
      <P>Get from a blank canvas to a working labware definition in five minutes.</P>
      <Ol>
        <Li>Open the <strong>Design</strong> page from the navigation bar.</Li>
        <Li>Choose a <strong>Labware Type</strong> (Well Plate, Reservoir, Tube Rack, or Tip Rack) in the left panel.</Li>
        <Li>Enter the physical <strong>plate dimensions</strong> — Length (X), Width (Y), and Height (Z).</Li>
        <Li>Select a placement tool (<strong>Add Well</strong> or <strong>Add Grid</strong>) and click or drag on the canvas.</Li>
        <Li>Select placed wells to configure their <strong>shape, depth, and volume</strong> in the right panel.</Li>
        <Li>Click <strong>Export ▾ → JSON file</strong> to download the definition.</Li>
      </Ol>

      <Divider />

      {/* ── Interface Layout ── */}
      <H2 id="interface">Interface Layout</H2>
      <P>The designer is split into three vertical regions:</P>
      <Table
        headers={['Region', 'Width', 'Contents']}
        rows={[
          ['Left panel',  '300 px', 'Labware type, plate dimensions, placement tools, well groups'],
          ['Canvas',      'flex',   'Interactive SVG workspace with pan and zoom'],
          ['Right panel', '280 px', 'Appears when wells are selected — properties, alignment, measurements'],
        ]}
      />
      <P>
        Above the workspace, the <strong>Toolbar</strong> contains the Select and Erase cursor tools, the Fit button,
        Undo / Redo, and the Import / Export menu.
      </P>

      <Divider />

      {/* ── Labware Types ── */}
      <H2 id="labware-types">Labware Types</H2>
      <P>
        The labware type determines the <Code>displayCategory</Code> field in the exported JSON and controls the
        naming of placement tools in the left panel.
      </P>
      <Table
        headers={['Type', 'JSON category', 'Single tool', 'Grid tool']}
        rows={[
          [<Badge color="blue">Well Plate</Badge>,  'wellPlate',  'Add Well',      'Add Grid'],
          [<Badge color="teal">Reservoir</Badge>,   'reservoir',  'Add Reservoir', 'Add Grid'],
          [<Badge color="orange">Tube Rack</Badge>, 'tubeRack',   'Add Tube',      'Add Tube Grid'],
          [<Badge color="gray">Tip Rack</Badge>,    'tipRack',    'Add Tip',       'Add Tip Grid'],
        ]}
      />
      <Note>
        Changing the labware type after placing wells only updates the export category and tool labels — it does
        not reposition or resize existing wells.
      </Note>

      <Divider />

      {/* ── Plate Dimensions ── */}
      <H2 id="plate-dims">Plate Dimensions</H2>
      <P>
        The plate section defines the physical footprint of the labware. All values are in millimetres.
      </P>
      <Table
        headers={['Field', 'Axis', 'Description']}
        rows={[
          ['Length (X)', 'X', 'Footprint length along the X axis (127.76 mm for SBS standard)'],
          ['Width (Y)',  'Y', 'Footprint width along the Y axis (85.48 mm for SBS standard)'],
          ['Height (Z)', 'Z', 'Total labware height from the deck surface to the top of the plate'],
        ]}
      />
      <P>
        The SBS (Society for Biomolecular Screening) standard footprint of <Code>127.76 × 85.48 mm</Code> fits
        all standard Opentrons OT-2 and Flex deck positions without any slot offset correction.
      </P>
      <H3>Metadata fields</H3>
      <Table
        headers={['Field', 'JSON key', 'Description']}
        rows={[
          ['Display name', 'metadata.displayName', 'Human-readable name shown in the Opentrons App'],
          ['Load name',    'parameters.loadName',  'Snake-case identifier used in Python protocols'],
          ['Brand',        'brand.brand',           'Manufacturer name'],
        ]}
      />

      <Divider />

      {/* ── Well Groups ── */}
      <H2 id="well-groups">Well Groups</H2>
      <P>
        Every well belongs to a <strong>group</strong>. Groups are organisational containers that appear as
        separate entries in the exported JSON <Code>groups</Code> array. Each group carries a shared
        <Code>wellBottomShape</Code> (flat, U, or V) derived from its first well.
      </P>
      <Ul>
        <Li>Create a group with <strong>+ New Group</strong> in the left panel.</Li>
        <Li>Click a group name to make it active — new wells are added to the active group.</Li>
        <Li>Rename a group by clicking its name while it is selected and typing.</Li>
        <Li>Delete a group (and all its wells) with the ✕ button.</Li>
      </Ul>
      <Warn>
        Deleting a group cannot be undone with Ctrl+Z if no snapshot was taken before the deletion.
        Use Undo immediately after an accidental delete.
      </Warn>

      <Divider />

      {/* ── Placement Tools ── */}
      <H2 id="tools">Placement Tools</H2>
      <H3>Add Well (single)</H3>
      <P>
        Click anywhere on the plate footprint to place a single well at that position.
        The new well inherits its properties (shape, diameter, depth, volume) from the most recently
        selected well, so you can set defaults by selecting an existing well before placing new ones.
      </P>
      <H3>Add Grid (multiple)</H3>
      <P>
        Drag a rectangular region on the plate to open the <strong>multi-well panel</strong> in the right
        sidebar. Specify rows, columns, and the spacing or offset to fill the region with a uniform array.
        Click <strong>Add Wells</strong> to commit. The panel validates that rows and columns are at least 1.
      </P>
      <H3>Select</H3>
      <P>
        Click a well to select it. Hold <Code>Shift</Code> and click to add to the selection.
        Drag on empty canvas to draw a <strong>marquee</strong> selection rectangle.
        Drag a selected well to reposition it; when multiple wells are selected all move together.
      </P>
      <H3>Erase</H3>
      <P>
        Click any well to delete it. To delete multiple wells at once, first select them with the Select
        tool, then press <Code>Delete</Code> or <Code>Backspace</Code>.
      </P>

      <Divider />

      {/* ── Well Properties ── */}
      <H2 id="well-props">Well Properties</H2>
      <P>Select one or more wells to reveal the right panel. Properties marked with * apply to all selected wells simultaneously.</P>
      <Table
        headers={['Property', 'Unit', 'Description']}
        rows={[
          ['Shape',      '—',  'Circular or Rectangular'],
          ['Diameter',   'mm', 'Well diameter (circular only)'],
          ['Length (X)', 'mm', 'Well dimension along X (rectangular only)'],
          ['Width (Y)',  'mm', 'Well dimension along Y (rectangular only)'],
          ['Depth (Z)',  'mm', 'Depth of the well from its top rim downward'],
          ['Volume',     'µL', 'Maximum liquid volume the well can hold'],
          ['Bottom',     '—',  'Bottom shape: Flat, U-bottom, or V-bottom'],
        ]}
      />
      <P>
        The exported <Code>z</Code> position of each well is calculated as <Code>zDimension − depth</Code>,
        representing the height of the well bottom above the deck surface.
      </P>

      <Divider />

      {/* ── Edge Offsets ── */}
      <H2 id="edge-offsets">Edge Offsets</H2>
      <P>
        Edge offsets define the position of a well's <strong>centre</strong> relative to the plate origin
        (bottom-left corner of the footprint in Opentrons coordinates).
      </P>
      <Table
        headers={['Field', 'Meaning']}
        rows={[
          ['Left edge', 'Distance from the left plate edge (X = 0) to the well centre'],
          ['Front edge', 'Distance from the front plate edge (Y = 0) to the well centre'],
        ]}
      />
      <P>
        When multiple wells are selected, you can choose an <strong>anchor well</strong> from the dropdown.
        Editing the offset of the anchor shifts all selected wells by the same delta, preserving their
        relative positions.
      </P>

      <Divider />

      {/* ── Boundary Constraints ── */}
      <H2 id="constraints">Boundary Constraints</H2>
      <P>
        Anywarelab continuously validates all well positions against the plate footprint and highlights
        violations on the canvas.
      </P>
      <Table
        headers={['Indicator', 'Meaning']}
        rows={[
          [<Badge color="red">Red ring</Badge>,    'Well centre is outside the plate footprint — the well will not be accessible by the pipette'],
          [<Badge color="orange">Orange ring</Badge>, 'Well centre is inside the footprint but one or more edges cross the boundary'],
        ]}
      />
      <P>
        A summary badge at the bottom of the canvas shows the total count of each violation type. Both
        violations are exported to JSON as-is — Anywarelab does not prevent export of invalid labware,
        allowing you to iterate freely.
      </P>

      <Divider />

      {/* ── Align to Plate ── */}
      <H2 id="align-plate">Align to Plate</H2>
      <P>
        With one or more wells selected, the <strong>Align to Plate</strong> buttons in the right panel
        move the entire selection relative to the plate footprint. The relative spacing between wells
        is always preserved.
      </P>
      <Table
        headers={['Button', 'Action']}
        rows={[
          ['⇤ Left',    'Align the leftmost well edge to the plate left edge (X = 0)'],
          ['↔ Center',  'Centre the selection horizontally on the plate midpoint'],
          ['⇥ Right',   'Align the rightmost well edge to the plate right edge (X = xDimension)'],
          ['⤒ Top',     'Align the topmost well edge to the plate back edge (Y = yDimension)'],
          ['↕ Middle',  'Centre the selection vertically on the plate midpoint'],
          ['⤓ Bottom',  'Align the bottommost well edge to the plate front edge (Y = 0)'],
        ]}
      />

      <Divider />

      {/* ── Align to Each Other ── */}
      <H2 id="align-each">Align to Each Other</H2>
      <P>
        Requires at least two wells selected. The <strong>first selected well</strong> acts as the anchor;
        all others snap to its axis.
      </P>
      <Table
        headers={['Button', 'Action']}
        rows={[
          ['↔ Align H', 'Move all selected wells to the same Y coordinate as the anchor'],
          ['↕ Align V', 'Move all selected wells to the same X coordinate as the anchor'],
        ]}
      />

      <Divider />

      {/* ── Distribute ── */}
      <H2 id="distribute">Distribute</H2>
      <P>
        Distributes the selected wells evenly between the outermost two wells.
        The <strong>Gap</strong> field controls the spacing mode:
      </P>
      <Ul>
        <Li><strong>Empty (auto)</strong> — symmetric mode: equal centre-to-centre spacing between the two outer wells.</Li>
        <Li><strong>Numeric value</strong> — fixed edge-to-edge gap in mm between each pair of adjacent wells.</Li>
      </Ul>
      <Table
        headers={['Button', 'Action']}
        rows={[
          ['⟺ Dist. H', 'Distribute horizontally (along X axis)'],
          ['⟷ Dist. V', 'Distribute vertically (along Y axis)'],
        ]}
      />

      <Divider />

      {/* ── Export JSON ── */}
      <H2 id="export-json">Export JSON</H2>
      <P>
        Click <strong>Export ▾ → JSON file</strong> in the toolbar to download the labware definition
        as an Opentrons Labware Schema v2 JSON file. The filename is derived from the <Code>loadName</Code> field.
      </P>
      <H3>Using the JSON in a Python protocol</H3>
      <CodeBlock>{`import json
from opentrons import protocol_api

def run(protocol: protocol_api.ProtocolContext):
    with open("custom_labware.json") as f:
        definition = json.load(f)

    labware = protocol.load_labware_from_definition(
        definition, location=1
    )`}</CodeBlock>
      <H3>Importing into the Opentrons App</H3>
      <Ol>
        <Li>Open the Opentrons App and navigate to <strong>More → Labware</strong>.</Li>
        <Li>Click <strong>Import</strong> and select the exported JSON file.</Li>
        <Li>The labware appears in the custom labware list and is usable in any protocol.</Li>
      </Ol>
      <H3>Schema notes</H3>
      <Ul>
        <Li>The <Code>ordering</Code> array columns are compacted to single lines for readability.</Li>
        <Li>Well <Code>z</Code> is computed as <Code>max(0, zDimension − depth)</Code>.</Li>
        <Li>The <Code>namespace</Code> is always <Code>custom_beta</Code>.</Li>
        <Li>The <Code>loadName</Code> is sanitised to lowercase alphanumeric + underscores.</Li>
      </Ul>

      <Divider />

      {/* ── Export PNG ── */}
      <H2 id="export-png">Export PNG</H2>
      <P>
        Click <strong>Export ▾ → PNG image</strong> to download a clean raster image of your design.
        The PNG is rendered at <Code>6 px/mm</Code> resolution and contains only the plate outline and
        wells with their labels — no grid, annotations, or UI chrome.
      </P>

      <Divider />

      {/* ── Import JSON ── */}
      <H2 id="import-json">Import JSON</H2>
      <P>
        Click <strong>↑ Import JSON</strong> in the toolbar and select an existing Opentrons Labware
        Schema v2 JSON file. The designer will reconstruct the plate dimensions, metadata, well groups,
        and all well properties from the definition.
      </P>
      <Warn>
        Importing a file replaces the current design. Make sure to export your work before importing
        a new file.
      </Warn>

      <Divider />

      {/* ── Keyboard Shortcuts ── */}
      <H2 id="shortcuts">Keyboard Shortcuts</H2>
      <Table
        headers={['Shortcut', 'Action']}
        rows={[
          [<Code>V</Code>,                      'Switch to Select tool'],
          [<Code>E</Code>,                      'Switch to Erase tool'],
          [<Code>Ctrl + Z</Code>,               'Undo'],
          [<Code>Ctrl + Y</Code>,               'Redo'],
          [<Code>Ctrl + Shift + Z</Code>,       'Redo (alternative)'],
          [<Code>Ctrl + C</Code>,               'Copy selected wells'],
          [<Code>Ctrl + V</Code>,               'Paste wells (offset +5 mm X, −5 mm Y)'],
          [<Code>Delete / Backspace</Code>,     'Remove selected wells'],
          [<Code>Alt + Drag</Code>,             'Pan the canvas'],
          [<Code>Scroll wheel</Code>,           'Zoom in / out'],
        ]}
      />

      <Divider />

      {/* ── Schema Reference ── */}
      <H2 id="schema">Schema Reference</H2>
      <P>The exported JSON follows the Opentrons Labware Schema v2 format. Key top-level fields:</P>
      <Table
        headers={['Field', 'Type', 'Description']}
        rows={[
          ['ordering',              'string[][]', 'Column-major array of well labels (e.g. [["A1","B1",...],["A2",...]])'],
          ['brand',                 'object',     '{ brand: string, brandId: [] }'],
          ['metadata.displayName',  'string',     'Human-readable name shown in the Opentrons App'],
          ['metadata.displayCategory', 'string',  'Labware type category (wellPlate, reservoir, etc.)'],
          ['metadata.displayVolumeUnits', 'string', 'Always µL'],
          ['dimensions',            'object',     '{ xDimension, yDimension, zDimension } in mm'],
          ['wells',                 'object',     'Map of well label → well definition'],
          ['groups',                'object[]',   'Array of well group metadata + well label lists'],
          ['parameters.format',     'string',     'Always "irregular"'],
          ['parameters.loadName',   'string',     'Snake-case identifier for protocol use'],
          ['namespace',             'string',     'Always "custom_beta"'],
          ['schemaVersion',         'number',     'Always 2'],
          ['cornerOffsetFromSlot',  'object',     '{ x: 0, y: 0, z: 0 }'],
        ]}
      />
      <H3>Well object fields</H3>
      <Table
        headers={['Field', 'Type', 'Description']}
        rows={[
          ['x',                 'number', 'Well centre X position in mm from left plate edge'],
          ['y',                 'number', 'Well centre Y position in mm from front plate edge'],
          ['z',                 'number', 'Well bottom height in mm above deck (= zDimension − depth)'],
          ['depth',             'number', 'Depth of the well in mm'],
          ['shape',             'string', '"circular" or "rectangular"'],
          ['diameter',          'number', 'Well diameter in mm (circular only)'],
          ['xDimension',        'number', 'Well X dimension in mm (rectangular only)'],
          ['yDimension',        'number', 'Well Y dimension in mm (rectangular only)'],
          ['totalLiquidVolume', 'number', 'Maximum liquid volume in µL'],
        ]}
      />

      <Divider />

      {/* ── Coordinate System ── */}
      <H2 id="coordinate">Coordinate System</H2>
      <P>
        Anywarelab uses the Opentrons coordinate convention throughout the editor and the exported JSON.
      </P>
      <Table
        headers={['Axis', 'Direction', 'Origin']}
        rows={[
          ['X', 'Left → Right', 'Left edge of the plate footprint'],
          ['Y', 'Front → Back (toward the robot arm)', 'Front edge of the plate footprint'],
          ['Z', 'Deck surface → Up', 'Deck surface'],
        ]}
      />
      <P>
        On the canvas, Y is displayed with the front edge at the bottom of the plate and the back edge
        at the top (matching how you physically look down at the deck).
        Well labels follow the Opentrons convention: row letter A–H (Y-axis, back to front) followed by
        column number 1–12 (X-axis, left to right).
      </P>

      <div className="pb-16" />
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activeId }) {
  return (
    <nav className="w-52 flex-shrink-0 pr-6">
      <div className="sticky top-6 space-y-5">
        {SECTIONS.map(({ group, items }) => (
          <div key={group}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              {group}
            </div>
            <ul className="space-y-0.5">
              {items.map(({ id, label }) => {
                const isActive = activeId === id
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={
                        'block text-xs px-2 py-1 rounded transition-colors ' +
                        (isActive
                          ? 'bg-gray-900 text-white font-semibold'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100')
                      }
                    >
                      {label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState(ALL_IDS[0])
  const contentRef = useRef(null)

  // Highlight the sidebar item whose section is nearest the top of the scroll area
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    function onScroll() {
      let closest = ALL_IDS[0]
      let minDist = Infinity
      ALL_IDS.forEach(id => {
        const el = container.querySelector(`#${id}`)
        if (!el) return
        const dist = Math.abs(el.getBoundingClientRect().top - 80)
        if (dist < minDist) { minDist = dist; closest = id }
      })
      setActiveId(closest)
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="h-full flex overflow-hidden bg-white">

      {/* Left sidebar */}
      <div className="hidden md:block flex-shrink-0 w-64 border-r border-gray-100 overflow-y-auto py-8 px-6">
        <Sidebar activeId={activeId} />
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <DocContent />
        </div>
      </div>

    </div>
  )
}
