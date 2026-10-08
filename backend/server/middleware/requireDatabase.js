import mongoose from 'mongoose'

export default function requireDatabase(_req, res, next) {
  if (mongoose.connection.readyState === 1) return next()

  return res.status(503).json({
    message: 'Account services cannot reach MongoDB Atlas. Confirm your cluster is running and your current IP is allowed in Atlas Network Access, then try again.',
  })
}
