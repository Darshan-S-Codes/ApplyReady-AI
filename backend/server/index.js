import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.js'
import opportunityRoutes from './routes/opportunities.js'
import documentRoutes from './routes/documents.js'

const app = express()
const here = path.dirname(fileURLToPath(import.meta.url))

async function findAvailablePort(startPort) {
  const preferredPort = Number(startPort) || 5000

  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    const available = await new Promise(resolve => {
      const tester = net.createServer()
      tester.once('error', () => resolve(false))
      tester.once('listening', () => {
        tester.close(() => resolve(true))
      })
      tester.listen(port, '127.0.0.1')
    })

    if (available) return port
  }

  return preferredPort
}

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1
  res.status(databaseConnected ? 200 : 503).json({
    ok: databaseConnected,
    service: 'ApplyReady AI API',
    database: databaseConnected ? 'connected' : 'unavailable',
  })
})
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

export const startServer = async ({ port = process.env.PORT, host = '127.0.0.1' } = {}) => {
  const listenPort = port === 0 ? 0 : await findAvailablePort(port)

  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .then(() => console.log('Connected to MongoDB'))
      .catch(error => console.error('MongoDB connection failed:', error.message))
  } else console.warn('MONGODB_URI is not configured; database-backed features are unavailable.')

  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(listenPort, host, () => resolve(listener))
    listener.once('error', reject)
  })
  const address = server.address()
  const actualPort = typeof address === 'object' && address ? address.port : listenPort
  console.log(`ApplyReady API listening on ${actualPort}`)
  return { server, port: actualPort }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch(error => {
    console.error('Failed to start API server:', error)
    process.exit(1)
  })
}
