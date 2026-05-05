import { useState } from 'react'
import { submitTemplate } from '../hooks/useTemplates'
import { useLabwareStore } from '../store/useLabwareStore'

const TYPE_TO_CATEGORY = {
  wellPlate: 'Well Plate',
  reservoir: 'Reservoir',
  tubeRack:  'Tube Rack',
  tipRack:   'Tip Rack',
}

export function SaveTemplateModal({ onClose, onSuccess }) {
  const { labwareConfig, wellGroups } = useLabwareStore()

  const defaultCategory = TYPE_TO_CATEGORY[labwareConfig.labwareType] ?? 'Well Plate'
  const wellCount = wellGroups.reduce((sum, g) => sum + (g.wells?.length ?? 0), 0)

  const [name,        setName]        = useState(labwareConfig.displayName ?? '')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState(defaultCategory)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await submitTemplate({
        name: name.trim(),
        description: description.trim() || null,
        category,
        wellCount,
        schema: { labwareConfig, wellGroups },
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-900">Share to Gallery</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Your design will be visible to everyone in the public gallery.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. 96-Well Plate"
              maxLength={80}
              required
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Briefly describe this labware design…"
              rows={2}
              maxLength={200}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
            >
              <option>Well Plate</option>
              <option>Reservoir</option>
              <option>Tube Rack</option>
              <option>Tip Rack</option>
              <option>Other</option>
            </select>
          </div>

          <div className="text-[11px] text-gray-400">
            {wellCount} well{wellCount !== 1 ? 's' : ''} · {labwareConfig.xDimension} × {labwareConfig.yDimension} mm
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="px-4 py-1.5 rounded bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sharing…' : 'Share to Gallery'}
          </button>
        </div>

      </div>
    </div>
  )
}
