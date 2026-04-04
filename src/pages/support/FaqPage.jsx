import { useState } from 'react'

const FAQS = [
  {
    q: 'What file format does the export produce?',
    a: 'The export produces an Opentrons Labware Schema v2 JSON file. This is the format required by the Opentrons App and Python API for custom labware definitions.',
  },
  {
    q: 'How do I use the exported JSON with my OT-2?',
    a: 'Open the Opentrons App, go to More → Labware, and click "Import". Select your exported JSON file. The labware will appear in your custom labware list and can be referenced in protocols using its load name.',
  },
  {
    q: 'What is the SBS standard footprint?',
    a: 'The SBS (Society for Biomolecular Screening) standard defines a plate footprint of 127.76 mm × 85.48 mm. Using this footprint ensures your labware fits standard Opentrons deck positions without offset adjustments.',
  },
  {
    q: 'What is the difference between well depth and plate height (Z)?',
    a: 'Plate height (Z) is the total height of the labware from the deck surface to the top of the plate. Well depth is how deep the well is from the top of the plate downward. The bottom of the well is calculated as Z − depth in the exported JSON.',
  },
  {
    q: 'Can I edit an existing labware definition?',
    a: 'Yes. Use "Import JSON" in the toolbar to load an existing Opentrons labware JSON file. The editor will reconstruct the plate and wells from the definition, which you can then modify and re-export.',
  },
  {
    q: 'What is a well group?',
    a: 'Well groups allow you to organise wells into named sets with a shared bottom shape (flat, U, or V). Each group appears as a separate entry in the exported JSON. This is useful for labware with different sections, such as a plate with both flat and round-bottom wells.',
  },
  {
    q: 'Why are my wells labelled A1, B1 instead of 1A, 1B?',
    a: 'The tool uses the Opentrons naming convention: row letter (A–H) followed by column number (1–12). Labels are assigned automatically based on Y position (rows) and X position (columns) across all groups.',
  },
  {
    q: 'Can I copy and paste wells?',
    a: 'Yes. Select one or more wells and press Ctrl+C to copy, then Ctrl+V to paste. The pasted wells are offset by +5 mm X and −5 mm Y from the originals and placed into a new group. You can also use the Copy / Paste buttons in the Align & Distribute panel.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <svg
          className={'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ' + (open ? 'rotate-180' : '')}
          viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">FAQ</h1>
        <p className="text-sm text-gray-500 mb-8">
          Frequently asked questions about the labware designer.
        </p>

        <div className="space-y-3">
          {FAQS.map(item => <FaqItem key={item.q} {...item} />)}
        </div>

      </div>
    </div>
  )
}
