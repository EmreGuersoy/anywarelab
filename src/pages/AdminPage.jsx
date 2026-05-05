import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePendingTemplates, approveTemplate, rejectTemplate } from '../hooks/useTemplates'
import { TemplateThumbnail } from '../components/TemplateThumbnail'

export default function AdminPage() {
  const [session,  setSession]  = useState(undefined) // undefined = loading
  const [isAdmin,  setIsAdmin]  = useState(null)      // null = checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) { setIsAdmin(null); return }
    supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data))
  }, [session])

  if (session === undefined)          return <Loading />
  if (!session)                       return <LoginForm />
  if (isAdmin === null)               return <Loading />
  if (!isAdmin)                       return <Unauthorized onSignOut={() => supabase.auth.signOut()} email={session.user.email} />
  return <ReviewPanel onSignOut={() => supabase.auth.signOut()} />
}

function Unauthorized({ onSignOut, email }) {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-sm text-gray-700 mb-1"><strong>{email}</strong> is not an admin.</div>
        <button onClick={onSignOut} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          Sign out
        </button>
      </div>
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function LoginForm() {
  const [email,  setEmail]  = useState('')
  const [sent,   setSent]   = useState(false)
  const [busy,   setBusy]   = useState(false)
  const [error,  setError]  = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    if (err) setError(err.message)
    else setSent(true)
    setBusy(false)
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm w-full max-w-sm mx-4 p-8">
        <h1 className="text-base font-semibold text-gray-900 mb-1">Admin</h1>
        <p className="text-xs text-gray-500 mb-6">Sign in to review submitted templates.</p>

        {sent ? (
          <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            Magic link sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            {error && <div className="text-xs text-red-600">{error}</div>}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-2 rounded bg-gray-900 text-white text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              {busy ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Review panel ──────────────────────────────────────────────────────────────

function ReviewPanel({ onSignOut }) {
  const { templates, loading, error, refetch } = usePendingTemplates()
  const [busy, setBusy] = useState(null) // id of template being processed

  async function handleApprove(id) {
    setBusy(id)
    try { await approveTemplate(id); refetch() }
    catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  async function handleReject(id) {
    if (!confirm('Delete this submission? This cannot be undone.')) return
    setBusy(id)
    try { await rejectTemplate(id); refetch() }
    catch (e) { alert(e.message) }
    finally { setBusy(null) }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Review Queue</h1>
            <p className="text-sm text-gray-500">
              Approve or reject community submissions before they appear in the gallery.
            </p>
          </div>
          <button
            onClick={onSignOut}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* States */}
        {loading && <Loading />}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">
            No pending submissions.
          </div>
        )}

        {/* Cards */}
        {!loading && !error && templates.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div
                key={t.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col"
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
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 bg-gray-100 text-gray-600 border-gray-200">
                        {t.category}
                      </span>
                    )}
                  </div>

                  {t.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                  )}

                  <div className="text-[11px] text-gray-400 mt-auto pt-1">
                    {t.well_count != null && <span>{t.well_count} wells</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleReject(t.id)}
                      disabled={busy === t.id}
                      className="flex-1 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-40"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(t.id)}
                      disabled={busy === t.id}
                      className="flex-1 py-1.5 rounded border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
                    >
                      {busy === t.id ? '…' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-24 text-sm text-gray-400">
      Loading…
    </div>
  )
}
