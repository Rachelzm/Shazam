import { useState, useCallback, useEffect } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const MAX_HISTORY = 20

function normalizeHistoryItem(song, id, recognizedAt) {
  return {
    ...song,
    id,
    title: song?.title || song?.name || 'Onbekend nummer',
    artist:
      song?.artist ||
      song?.artists?.[0]?.name ||
      song?.performer ||
      song?.album?.artist ||
      'Onbekende artiest',
    artwork:
      song?.artwork ||
      song?.album_artwork ||
      song?.album?.image ||
      song?.spotify?.album?.images?.[0]?.url ||
      song?.apple_music?.artwork?.url ||
      '',
    recognizedAt,
  }
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function useHistory(authToken) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    let cancelled = false

    if (!authToken) {
      setHistory([])
      return () => {
        cancelled = true
      }
    }

    async function loadHistory() {
      try {
        const items = await requestJson('/api/history', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })
        if (!cancelled) {
          setHistory(Array.isArray(items) ? items.slice(0, MAX_HISTORY) : [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load history', error)
          setHistory([])
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [authToken])

  const addEntry = useCallback(async (song) => {
    if (!authToken) {
      return null
    }

    try {
      const saved = await requestJson('/api/history', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ song }),
      })

      setHistory((prev) => [saved, ...prev.filter((entry) => entry.id !== saved.id)].slice(0, MAX_HISTORY))
      return saved
    } catch (error) {
      console.error('Failed to save history item', error)
      return null
    }
  }, [authToken])

  const clearHistory = useCallback(async () => {
    if (!authToken) {
      return
    }

    try {
      await requestJson('/api/history', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      setHistory([])
    } catch (error) {
      console.error('Failed to clear history', error)
    }
  }, [authToken])

  return { history, addEntry, clearHistory }
}
