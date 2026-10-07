import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export default async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'Sign in to continue.' })
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(payload.sub).select('-passwordHash')
    if (!req.user) return res.status(401).json({ message: 'Account not found.' })
    next()
  } catch { return res.status(401).json({ message: 'Your session has expired. Sign in again.' }) }
}
