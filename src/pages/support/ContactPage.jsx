import { useState } from 'react'
import { PageFooter } from '../../components/PageFooter'

const FORMSPREE_URL = 'https://formspree.io/f/mlgokrgz'

export default function ContactPage() {
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data?.errors?.[0]?.message ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const field = (id, label, type = 'text', required = true) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={form[id]}
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
        className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
    </div>
  )

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-xl mx-auto px-6 py-10">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Contact</h1>
        <p className="text-sm text-gray-500 mb-8">
          Have a question, found a bug, or want to suggest a feature? Send us a message.
        </p>

        {sent ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="text-3xl mb-3">✓</div>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Message sent</h2>
            <p className="text-sm text-gray-500 mb-5">
              Thanks for reaching out. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
              className="px-4 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {field('name',  'Name')}
              {field('email', 'Email', 'email')}
            </div>
            {field('subject', 'Subject')}

            <div className="flex flex-col gap-1">
              <label htmlFor="message" className="text-xs font-medium text-gray-700">
                Message<span className="text-red-400 ml-0.5">*</span>
              </label>
              <textarea
                id="message"
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors resize-none"
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-lg mb-1">📖</div>
            <h3 className="text-xs font-semibold text-gray-900 mb-1">Documentation</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Read the How to Use guide for step-by-step instructions.
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-lg mb-1">🐛</div>
            <h3 className="text-xs font-semibold text-gray-900 mb-1">Report a Bug</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Found an issue? Describe it in the message form above.
            </p>
          </div>
        </div>

      </div>
      <PageFooter />
    </div>
  )
}
