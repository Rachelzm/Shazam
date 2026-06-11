import { useCallback, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'soundsnap_auth_token'
const USER_KEY = 'soundsnap_auth_user'

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`)
  }

  return payload
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))

  const saveSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }, [])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function verifySession() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const payload = await requestJson('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!cancelled) {
          setUser(payload.user)
          localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          logout()
          setLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      cancelled = true
    }
  }, [token, logout])

  const login = useCallback(async (email, password) => {
    const payload = await requestJson('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveSession(payload.token, payload.user)
    return payload.user
  }, [saveSession])

  const register = useCallback(async (email, password) => {
    const payload = await requestJson('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    saveSession(payload.token, payload.user)
    return payload.user
  }, [saveSession])

  return {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token),
  }
}