require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const { registerUser, loginUser, authMiddleware } = require('./authStore')
const { addHistoryEntry, clearHistory, getHistory } = require('./historyStore')

const app = express()
app.use(cors())
app.use(express.json())
// Explicit CORS headers and OPTIONS handler to satisfy browser preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
const upload = multer({ storage: multer.memoryStorage() })

const PORT = process.env.BACKEND_PORT || process.env.PORT || 3001

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const payload = await registerUser(email, password)
    return res.status(201).json(payload)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'unknown' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const payload = await loginUser(email, password)
    return res.json(payload)
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message || 'unknown' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  return res.json({ user: req.user })
})

app.get('/api/history', authMiddleware, async (req, res) => {
  try {
    const history = await getHistory(req.user.id)
    return res.json(history)
  } catch (err) {
    console.error('History load error:', err && err.message ? err.message : err)
    return res.status(500).json({ error: err.message || 'unknown' })
  }
})

app.post('/api/history', authMiddleware, async (req, res) => {
  try {
    const song = req.body && typeof req.body.song === 'object' ? req.body.song : req.body
    if (!song || typeof song !== 'object') {
      return res.status(400).json({ error: 'song required' })
    }

    const saved = await addHistoryEntry(req.user.id, song)
    return res.status(201).json(saved)
  } catch (err) {
    console.error('History save error:', err && err.message ? err.message : err)
    return res.status(500).json({ error: err.message || 'unknown' })
  }
})

app.delete('/api/history', authMiddleware, async (req, res) => {
  try {
    await clearHistory(req.user.id)
    return res.sendStatus(204)
  } catch (err) {
    console.error('History clear error:', err && err.message ? err.message : err)
    return res.status(500).json({ error: err.message || 'unknown' })
  }
})

app.post('/api/recognize', upload.single('file'), async (req, res) => {
  try {
    console.log('/api/recognize called, file present?', !!req.file)
    if (!req.file) return res.status(400).json({ error: 'file required' })
    
    // Gebruik de client token, behalve als deze leeg of de default 'test' is
    const clientToken = req.body && req.body.api_token;
    const apiToken = (clientToken && clientToken !== 'test' && clientToken.trim() !== '') ? clientToken : (process.env.AUDD_API_TOKEN || clientToken);

    console.log(`[DEBUG] Token gebruikt voor AudD: "${apiToken ? apiToken.substring(0, 5) + '...' : 'GEEN'}"`);

    if (!apiToken) {
      // This happens if no token is sent from client AND no fallback is in .env
      return res.status(400).json({ error: 'api_token required' })
    }

    const form = new FormData()
    form.append('api_token', apiToken)
    form.append('file', req.file.buffer, { filename: req.file.originalname || 'recording.webm' })
    form.append('return', 'timecode,apple_music')

    const resp = await axios.post('https://api.audd.io/', form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
    return res.json(resp.data)
  } catch (err) {
    console.error('recognize proxy error:', err && err.response ? err.response.data || err.response.statusText : err.message)
    return res.status(500).json({ error: err.message || 'unknown' })
  }
})

app.listen(PORT, () => console.log(`ACR proxy running on http://localhost:${PORT}`))
