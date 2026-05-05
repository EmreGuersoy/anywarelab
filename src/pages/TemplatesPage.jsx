import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLabwareStore } from '../store/useLabwareStore'
import { useTemplates } from '../hooks/useTemplates'
import { TemplateThumbnail } from '../components/TemplateThumbnail'

const CATEGORIES = ['All', 'Well Plate', 'Reservoir', 'Tube Rack', 'Tip Rack', 'Other']

const CATEGORY_COLOR = {
  'Well Plate': 'bg-blue-50 text-blue-700 border-blue-200',
  'Reservoir':  'bg-teal-50 text-teal-700 border-teal-200',
  'Tube Rack':  'bg-orange-50 text-orange-700 border-orange-200',
  'Tip Rack':   'bg-purple-50 text-purple-700 border-purple-200',
  'Other':      'bg-gray-100 text-gray-600 border-gray-200',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TemplatesPage() {
  const navigate       = useNavigate()
  const { loadFromSchema } = useLabwareStore()
  const [category, setCategory] = useState('All')
  const { templates, loading, error } = useTemplates({ category })

  function openTemplate(schema) {
    loadFromSchema(schema)
    navigate('/design')
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Gallery</h1>
            <p className="text-sm text-gray-500">
              Community-submitted labware designs. Click any card to open it in the editor.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 mb-7 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors ' +
                (category === c
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500 hover:text-gray-900')
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">
            Loading…
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-sm text-red-600 mb-1">Failed to load gallery</div>
              <div className="text-xs text-gray-400">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">No templates yet</div>
              <div className="text-xs text-gray-400">
                Design something in the editor and share it to the gallery.
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:border-gray-400 hover:shadow-sm transition-all"
              >
                {/* Thumbnail */}
                <div className="flex items-center justify-center bg-gray-50 border-b border-gray-100 p-4">
                  <TemplateThumbnail schema={t.schema} width={200} height={130} />
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{t.name}</h3>
                    {t.category && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${CATEGORY_COLOR[t.category] ?? CATEGORY_COLOR['Other']}`}>
                        {t.category}
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-gray-500 leading-relaxed flex-1">{t.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-auto pt-1">
                    {t.well_count != null && <span>{t.well_count} wells</span>}
                    {t.well_count != null && t.created_at && <span>·</span>}
                    {t.created_at && <span>{formatDate(t.created_at)}</span>}
                  </div>

                  <button
                    onClick={() => openTemplate(t.schema)}
                    className="mt-1 w-full py-1.5 rounded border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors"
                  >
                    Open in Editor →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
