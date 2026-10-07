import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import opportunityRoutes from './routes/opportunities.js'
import documentRoutes from './routes/documents.js'

const app = express()
const here = path.dirname(fileURLToPath(import.meta.url))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.join(here, 'uploads')))
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'ApplyReady AI API' }))
app.use('/api/auth', authRoutes)
app.use('/api/opportunities', opportunityRoutes)
app.use('/api/documents', documentRoutes)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(here, '..', '..', 'frontend', 'dist')))
  app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(here, '..', '..', 'frontend', 'dist', 'index.html')))
}
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong.' })
})

const port = process.env.PORT || 5000
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(error => console.error('MongoDB connection failed:', error.message))
} else console.warn('MONGODB_URI is not configured; database-backed features are unavailable.')
app.listen(port, () => console.log(`ApplyReady API listening on ${port}`))
