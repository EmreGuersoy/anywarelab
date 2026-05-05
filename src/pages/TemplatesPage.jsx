import { useNavigate } from 'react-router-dom'
import { useLabwareStore } from '../store/useLabwareStore'

const TEMPLATES = [
  {
    id: 'sbs_96',
    name: '96-Well Plate',
    desc: 'Standard SBS 96-well plate (8×12), 200 µL per well',
    category: 'Well Plate',
    wells: 96,
    rows: 8,
    cols: 12,
  },
  {
    id: 'sbs_384',
    name: '384-Well Plate',
    desc: 'High-density SBS 384-well plate (16×24)',
    category: 'Well Plate',
    wells: 384,
    rows: 16,
    cols: 24,
  },
  {
    id: 'sbs_24',
    name: '24-Well Plate',
    desc: 'SBS 24-well plate (4×6), 3.4 mL per well',
    category: 'Well Plate',
    wells: 24,
    rows: 4,
    cols: 6,
  },
  {
    id: 'res_12',
    name: '12-Channel Reservoir',
    desc: '12-column trough reservoir for multichannel pipettes',
    category: 'Reservoir',
    wells: 12,
    rows: 1,
    cols: 12,
  },
  {
    id: 'tube_15',
    name: '15 mL Tube Rack',
    desc: 'Tube rack for 15 mL conical tubes (3×5 grid)',
    category: 'Tube Rack',
    wells: 15,
    rows: 3,
    cols: 5,
  },
  {
    id: 'tip_96',
    name: '96-Tip Rack',
    desc: 'Standard 96-tip rack for single-channel and 8-channel pipettes',
    category: 'Tip Rack',
    wells: 96,
    rows: 8,
    cols: 12,
  },
]

const CATEGORY_COLOR = {
  'Well Plate': 'bg-blue-50 text-blue-700 border-blue-200',
  'Reservoir':  'bg-teal-50 text-teal-700 border-teal-200',
  'Tube Rack':  'bg-orange-50 text-orange-700 border-orange-200',
  'Tip Rack':   'bg-purple-50 text-purple-700 border-purple-200',
}

export default function TemplatesPage() {
  const navigate  = useNavigate()
  const { loadFromSchema } = useLabwareStore()

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Templates</h1>
        <p className="text-sm text-gray-500 mb-8">
          Start from a pre-built labware template. All templates follow Opentrons SBS-standard footprints and can be customised after loading.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <div
              key={t.id}
              className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3 hover:border-gray-400 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{t.name}</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${CATEGORY_COLOR[t.category] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {t.category}
                </span>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed flex-1">{t.desc}</p>

              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span>{t.wells} wells</span>
                <span>·</span>
                <span>{t.rows} × {t.cols}</span>
              </div>

              <button
                onClick={() => navigate('/')}
                className="mt-1 w-full py-1.5 rounded border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
              >
                Open Template →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
