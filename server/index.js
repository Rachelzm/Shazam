require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const FormData = require('form-data')
const axios = require('axios')
const crypto = require('crypto')

const app = express()
app.use(cors())
// Explicit CORS headers and OPTIONS handler to satisfy browser preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
const upload = multer({ storage: multer.memoryStorage() })

const ACR_HOST = process.env.ACR_HOST
const ACCESS_KEY = process.env.ACR_ACCESS_KEY
const ACCESS_SECRET = process.env.ACR_SECRET
const PORT = process.env.PORT || 3000

if (!ACR_HOST || !ACCESS_KEY || !ACCESS_SECRET) {
  console.error('Missing ACR config. Copy server/.env.example -> server/.env and set ACR_HOST, ACR_ACCESS_KEY, ACR_SECRET')
}

app.post('/api/recognize', upload.single('file'), async (req, res) => {
  try {
    console.log('/api/recognize called, file present?', !!req.file)
    if (!req.file) return res.status(400).json({ error: 'file required' })
    const sampleBuffer = req.file.buffer

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const httpMethod = 'POST'
    const httpUri = '/v1/identify'
    const dataType = 'audio'
    const signatureVersion = '1'

    const stringToSign = [httpMethod, httpUri, ACCESS_KEY, dataType, signatureVersion, timestamp].join('\n')
    const signature = crypto.createHmac('sha1', ACCESS_SECRET).update(stringToSign).digest('base64')

    const form = new FormData()
    form.append('access_key', ACCESS_KEY)
    form.append('sample', sampleBuffer, { filename: req.file.originalname || 'sample' })
    form.append('data_type', dataType)
    form.append('signature_version', signatureVersion)
    form.append('signature', signature)
    form.append('timestamp', timestamp)

    const url = (ACR_HOST || 'https://identify-eu-west-1.acrcloud.com') + '/v1/identify'

    const resp = await axios.post(url, form, { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity })
    return res.json(resp.data)
  } catch (err) {
    console.error('ACR proxy error:', err && err.response ? err.response.data || err.response.statusText : err.message)
    return res.status(500).json({ error: err.message || 'unknown' })
  }
})

app.listen(PORT, () => console.log(`ACR proxy running on http://localhost:${PORT}`))
