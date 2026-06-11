const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function recognizeSong(blob, token) {
  try {
    if (!blob || typeof blob.size === 'number' && blob.size === 0) {
      console.warn('recognizeSong: empty audio blob, nothing to send')
      return null
    }
    const form = new FormData()
    if (token && token !== 'test') {
      form.append('api_token', token)
    }
    // The local server forwards this to the recognition provider.
    form.append('file', blob, 'recording.webm')
    form.append('return', 'timecode,apple_music')

    const resp = await fetch(`${API_BASE_URL}/recognize`, {
      method: 'POST',
      body: form,
    })

    if (!resp.ok) {
      console.error('recognizeSong: network response not ok', resp.status, resp.statusText)
      return null
    }
    const json = await resp.json()
    console.debug('recognizeSong: AudD response', json)
    // On success AudD returns { status: 'success', result: { ... } }
    if (json && json.status === 'success') {
      if (!json.result) console.info('recognizeSong: AudD returned no match')
      return json.result
    }

    // When AudD returns status: 'error', it usually includes an `error` object
    if (json && json.status === 'error') {
      console.error('recognizeSong: AudD error detail', json.error)
      const errMsg = (json.error && (json.error.error || json.error.message)) || JSON.stringify(json.error)
      throw new Error(`AudD error: ${errMsg}`)
    }

    console.info('recognizeSong: AudD returned non-success status', json)
    return null
  } catch (err) {
    console.error('recognizeSong error', err)
    throw err
  }
}
