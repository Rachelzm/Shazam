const { run, all } = require('./db')

const MAX_HISTORY = 20

function parsePayload(row) {
  try {
    return JSON.parse(row.payload)
  } catch {
    return {}
  }
}

function extractArtist(song) {
  return (
    song?.artist ||
    song?.artists?.[0]?.name ||
    song?.performer ||
    song?.album?.artist ||
    'Onbekende artiest'
  )
}

function extractArtwork(song) {
  const candidate =
    song?.artwork ||
    song?.album_artwork ||
    song?.album?.image ||
    song?.album?.cover ||
    song?.spotify?.album?.images?.[0]?.url ||
    song?.apple_music?.artwork?.url ||
    song?.deezer?.album?.cover

  if (typeof candidate === 'string') {
    return candidate.replace('{w}x{h}', '300x300').replace('{width}x{height}', '300x300')
  }

  return candidate || ''
}

function normalizeHistoryItem(song, id, recognizedAt) {
  return {
    ...song,
    id,
    title: song?.title || song?.name || 'Onbekend nummer',
    artist: extractArtist(song),
    artwork: extractArtwork(song),
    recognizedAt,
  }
}

async function getHistory(userId, limit = MAX_HISTORY) {
  const rows = await all(
    'SELECT id, payload, recognized_at FROM history WHERE user_id = ? ORDER BY recognized_at DESC, id DESC LIMIT ?',
    [userId, limit],
  )

  return rows.map((row) => {
    const song = parsePayload(row)
    return normalizeHistoryItem(song, row.id, row.recognized_at)
  })
}

async function addHistoryEntry(userId, song) {
  const recognizedAt = new Date().toISOString()
  const payload = JSON.stringify(song || {})
  const result = await run('INSERT INTO history (user_id, payload, recognized_at) VALUES (?, ?, ?)', [userId, payload, recognizedAt])

  await run(
    `DELETE FROM history
     WHERE id NOT IN (
       SELECT id FROM history WHERE user_id = ? ORDER BY recognized_at DESC, id DESC LIMIT ?
     )`,
    [userId, MAX_HISTORY],
  )

  return normalizeHistoryItem(song || {}, result.lastID, recognizedAt)
}

async function clearHistory(userId) {
  await run('DELETE FROM history WHERE user_id = ?', [userId])
}

module.exports = {
  getHistory,
  addHistoryEntry,
  clearHistory,
}
