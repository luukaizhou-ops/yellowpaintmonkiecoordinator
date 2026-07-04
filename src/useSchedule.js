import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, hasSupabaseConfig } from './supabaseClient'
import { TOTAL_FRIENDS } from './constants'
import { todayISO } from './dateUtils'

const key = (date, slot) => `${date}|${slot}`

// One hook that owns all shared state: everyone's availability, the list of
// planned hangouts, loading/error status, live updates, and the mutations.
export function useSchedule(myName) {
  const [availability, setAvailability] = useState([])
  const [hangoutRows, setHangoutRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load everything once.
  const loadAll = useCallback(async () => {
    if (!supabase) {
      setError('missing-config')
      setLoading(false)
      return
    }
    try {
      const [availRes, hangoutRes] = await Promise.all([
        supabase.from('availability').select('id, name, date, slot'),
        supabase.from('hangout').select('id, date, slot, title'),
      ])
      if (availRes.error) throw availRes.error
      if (hangoutRes.error) throw hangoutRes.error
      setAvailability(availRes.data ?? [])
      setHangoutRows(hangoutRes.data ?? [])
      setError(null)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load schedule', err)
      setError(err.message || 'load-failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Live updates: when anyone changes availability or the hangout, refetch.
  // Refetching (rather than surgically patching) keeps things simple and
  // always correct even if we miss an event.
  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'availability' },
        () => loadAll()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hangout' },
        () => loadAll()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadAll])

  // Map of "date|slot" -> number of people free.
  const counts = useMemo(() => {
    const map = new Map()
    for (const row of availability) {
      const k = key(row.date, row.slot)
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return map
  }, [availability])

  // Set of "date|slot" that *I* have marked myself free for.
  const mine = useMemo(() => {
    const set = new Set()
    for (const row of availability) {
      if (row.name === myName) set.add(key(row.date, row.slot))
    }
    return set
  }, [availability, myName])

  const countFor = useCallback((date, slot) => counts.get(key(date, slot)) ?? 0, [counts])
  const isMineFree = useCallback((date, slot) => mine.has(key(date, slot)), [mine])

  // Upcoming hangouts only (past ones drop off automatically), soonest first.
  const hangouts = useMemo(() => {
    const today = todayISO()
    return hangoutRows
      .filter((h) => h.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        return a.slot < b.slot ? -1 : 1
      })
  }, [hangoutRows])

  // Top 3 date/slot combos by number of people free.
  const bestSlots = useMemo(() => {
    const items = []
    for (const [k, count] of counts.entries()) {
      const [date, slot] = k.split('|')
      items.push({ date, slot, count })
    }
    items.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      if (a.date !== b.date) return a.date < b.date ? -1 : 1
      return a.slot < b.slot ? -1 : 1
    })
    return items.slice(0, 3)
  }, [counts])

  // Toggle my availability for a date/slot. Optimistic for snappiness, then
  // the DB write (and realtime) reconcile everyone else.
  const toggleSlot = useCallback(
    async (date, slot) => {
      if (!supabase || !myName) return
      const alreadyFree = mine.has(key(date, slot))

      if (alreadyFree) {
        // Optimistically remove my row(s) for this date/slot.
        setAvailability((prev) =>
          prev.filter(
            (r) => !(r.name === myName && r.date === date && r.slot === slot)
          )
        )
        const { error: delErr } = await supabase
          .from('availability')
          .delete()
          .match({ name: myName, date, slot })
        if (delErr) {
          console.error('delete failed', delErr)
          loadAll() // roll back to server truth
        }
      } else {
        // Optimistically add a temporary row.
        const tempId = `temp-${Date.now()}`
        setAvailability((prev) => [
          ...prev,
          { id: tempId, name: myName, date, slot },
        ])
        const { data, error: insErr } = await supabase
          .from('availability')
          .insert({ name: myName, date, slot })
          .select()
          .single()
        if (insErr) {
          console.error('insert failed', insErr)
          loadAll()
        } else if (data) {
          // Swap the temp row for the real one.
          setAvailability((prev) =>
            prev.map((r) => (r.id === tempId ? data : r))
          )
        }
      }
    },
    [myName, mine, loadAll]
  )

  // Add a hangout to the list. To avoid duplicates, any existing hangout on
  // the same date+slot is replaced (which also lets you rename one).
  const addHangout = useCallback(async (date, slot, title) => {
    if (!supabase) return
    await supabase.from('hangout').delete().match({ date, slot })
    const { data, error: insErr } = await supabase
      .from('hangout')
      .insert({ date, slot, title: title || 'Pie baking' })
      .select()
      .single()
    if (insErr) {
      console.error('add hangout failed', insErr)
      return
    }
    setHangoutRows((prev) => [
      ...prev.filter((h) => !(h.date === date && h.slot === slot)),
      data,
    ])
  }, [])

  // Remove a single hangout by id.
  const removeHangout = useCallback(
    async (id) => {
      if (!supabase) return
      setHangoutRows((prev) => prev.filter((h) => h.id !== id))
      const { error: delErr } = await supabase
        .from('hangout')
        .delete()
        .eq('id', id)
      if (delErr) {
        console.error('remove hangout failed', delErr)
        loadAll()
      }
    },
    [loadAll]
  )

  // Wipe everyone's availability to start a fresh planning round. Locked-in
  // hangouts are untouched.
  const clearAllAvailability = useCallback(async () => {
    if (!supabase) return
    setAvailability([])
    const { error: delErr } = await supabase
      .from('availability')
      .delete()
      .neq('id', -1) // matches every row
    if (delErr) {
      console.error('clear availability failed', delErr)
      loadAll()
    }
  }, [loadAll])

  return {
    loading,
    error,
    hasSupabaseConfig,
    totalFriends: TOTAL_FRIENDS,
    hangouts,
    countFor,
    isMineFree,
    bestSlots,
    toggleSlot,
    addHangout,
    removeHangout,
    clearAllAvailability,
    reload: loadAll,
  }
}
