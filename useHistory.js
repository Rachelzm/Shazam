import { useState, useCallback } from 'react'

const STORAGE_KEY = 'soundsnap_history'
const MAX_HISTORY = 20

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function useHistory() {
  const [history, setHistory] = useState(loadHistory)

  const addEntry = useCallback((song) => {
    setHistory((prev) => {
      const entry = { ...song, recognizedAt: new Date().toISOString(), id: Date.now() }
      const updated = [entry, ...prev].slice(0, MAX_HISTORY)
      saveHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}
