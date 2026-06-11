const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { get, run } = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'soundsnap-dev-secret'
const BCRYPT_ROUNDS = 10

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function createAuthToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

async function registerUser(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password) {
    const error = new Error('email and password are required')
    error.statusCode = 400
    throw error
  }

  const existingUser = await get('SELECT id FROM users WHERE email = ?', [normalizedEmail])
  if (existingUser) {
    const error = new Error('email already in use')
    error.statusCode = 409
    throw error
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
  const createdAt = new Date().toISOString()
  const result = await run(
    'INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)',
    [normalizedEmail, passwordHash, createdAt],
  )

  const user = { id: result.lastID, email: normalizedEmail, createdAt }
  return { user, token: createAuthToken(user) }
}

async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail || !password) {
    const error = new Error('email and password are required')
    error.statusCode = 400
    throw error
  }

  const row = await get('SELECT id, email, password_hash, created_at FROM users WHERE email = ?', [normalizedEmail])
  if (!row) {
    const error = new Error('invalid credentials')
    error.statusCode = 401
    throw error
  }

  const matches = await bcrypt.compare(password, row.password_hash)
  if (!matches) {
    const error = new Error('invalid credentials')
    error.statusCode = 401
    throw error
  }

  const user = { id: row.id, email: row.email, createdAt: row.created_at }
  return { user, token: createAuthToken(user) }
}

function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'unauthorized' })
  }

  try {
    const payload = verifyAuthToken(token)
    req.user = { id: payload.sub, email: payload.email }
    return next()
  } catch {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

module.exports = {
  registerUser,
  loginUser,
  authMiddleware,
  verifyAuthToken,
}