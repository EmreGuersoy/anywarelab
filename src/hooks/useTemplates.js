import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTemplates({ category } = {}) {
  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    let query = supabase
      .from('templates')
      .select('id, name, description, category, well_count, created_at, schema')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setTemplates(data ?? [])
    setLoading(false)
  }, [category])

  useEffect(() => { fetch() }, [fetch])

  return { templates, loading, error, refetch: fetch }
}

export function usePendingTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('templates')
      .select('id, name, description, category, well_count, created_at, schema')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (err) setError(err.message)
    else setTemplates(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { templates, loading, error, refetch: fetch }
}

export async function submitTemplate({ name, description, category, wellCount, schema }) {
  const { data, error } = await supabase
    .from('templates')
    .insert({ name, description, category, well_count: wellCount, schema, status: 'pending' })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function approveTemplate(id) {
  const { error } = await supabase
    .from('templates')
    .update({ status: 'approved' })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function rejectTemplate(id) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}
