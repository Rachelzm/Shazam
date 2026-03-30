// WARNING: This file includes a user-provided API key. Embedding secrets in source
// is insecure — consider using environment variables or browser prompt to set the token.
const EMBEDDED_API_TOKEN = '17coJ8CSAYn2kconfoJPg5nXAJpZicIMoPJBuz3ZpecGksVmiV9w29yETy6GFuDh'

export async function recognizeSong(blob, token) {
  const apiToken = token && token !== 'test' ? token : EMBEDDED_API_TOKEN

  try {
    if (!blob || typeof blob.size === 'number' && blob.size === 0) {
      console.warn('recognizeSong: empty audio blob, nothing to send')
      return null
    }
    const form = new FormData()
    form.append('api_token', apiToken)
    // AudD accepts a file field named `file` for uploads
    form.append('file', blob, 'recording.webm')
    form.append('return', 'timecode,apple_music')

    const resp = await fetch('https://api.audd.io/', {
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
