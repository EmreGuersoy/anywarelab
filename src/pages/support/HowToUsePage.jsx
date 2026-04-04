const STEPS = [
  {
    step: '01',
    title: 'Choose a labware type',
    body: 'Select Well Plate, Reservoir, Tube Rack, or Tip Rack from the Labware Type dropdown in the left panel. This determines the category in the exported JSON and the naming of placement tools.',
  },
  {
    step: '02',
    title: 'Set plate dimensions',
    body: 'Enter the physical footprint of your labware (Width X, Length Y, Height Z) in the Plate section. For SBS-standard labware use 127.76 × 85.48 mm. Height is the total distance from the deck surface to the top of the labware.',
  },
  {
    step: '03',
    title: 'Place wells',
    body: 'Use "Add Well" to click and place individual wells, or "Add Grid" to drag a rectangular region and fill it with a uniform array. Tube Rack and Tip Rack tools use matching names (Add Tube, Add Tip).',
  },
  {
    step: '04',
    title: 'Configure well properties',
    body: 'Select one or more wells to open the right panel. Set shape (circular or rectangular), dimensions, depth, liquid volume, and bottom shape. Use Edge Offsets to precisely position wells by their left and front distances from the plate edge.',
  },
  {
    step: '05',
    title: 'Align and distribute',
    body: 'With multiple wells selected, use "Align to Plate" to snap the selection to the plate edges or center. Use "Align to Each Other" and "Distribute" to space wells evenly relative to each other.',
  },
  {
    step: '06',
    title: 'Organise well groups',
    body: 'Wells belong to groups. Groups appear in the exported JSON and allow you to assign different bottom shapes per group. Add groups from the Well Groups section in the left panel, then select the active group before placing wells.',
  },
  {
    step: '07',
    title: 'Export your labware',
    body: 'Click "Export ▾" in the toolbar and choose "JSON file" to download the Opentrons Labware Schema v2 definition, or "PNG image" to export a visual of your design. Import the JSON into the Opentrons App to use it on your robot.',
  },
]

export default function HowToUsePage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">How to Use</h1>
        <p className="text-sm text-gray-500 mb-8">
          A step-by-step guide to designing custom labware.
        </p>

        <div className="space-y-4">
          {STEPS.map(({ step, title, body }) => (
            <div key={step} className="bg-white rounded-lg border border-gray-200 p-5 flex gap-4">
              <span className="text-[11px] font-bold text-gray-300 w-6 flex-shrink-0 pt-0.5">{step}</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-900 text-white rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-2">Keyboard shortcuts</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-300">
            {[
              ['V', 'Select tool'],
              ['E', 'Erase tool'],
              ['Ctrl + Z', 'Undo'],
              ['Ctrl + Y / Shift+Z', 'Redo'],
              ['Ctrl + C', 'Copy selected wells'],
              ['Ctrl + V', 'Paste wells'],
              ['Delete / Backspace', 'Remove selected wells'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-2 py-0.5">
                <span className="font-mono bg-gray-700 px-1.5 py-0.5 rounded text-[10px] text-white flex-shrink-0">{key}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
