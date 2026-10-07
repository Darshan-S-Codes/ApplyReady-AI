import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import requireAuth from '../middleware/auth.js'

const router = Router()
const createToken = user => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Enter your name and email, and use a password with at least 8 characters.' })
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' })
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: await bcrypt.hash(password, 12) })
    return res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
})
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+passwordHash')
    if (!user || !await bcrypt.compare(password || '', user.passwordHash)) return res.status(401).json({ message: 'Email or password is incorrect.' })
    return res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
})
router.post('/logout', (_req, res) => res.json({ message: 'Signed out.' }))
router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }))
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['name','phone','location','college','degree','branch','currentYear','graduationYear','cgpa','skills','projects','certifications','preferences']
    for (const field of allowed) if (field in req.body) req.user[field] = req.body[field]
    await req.user.save()
    res.json({ user: req.user })
  } catch (err) { next(err) }
})
export default router
