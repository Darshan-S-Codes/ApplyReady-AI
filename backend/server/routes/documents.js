import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import Document from '../models/Document.js'
import requireAuth from '../middleware/auth.js'

const router = Router()
const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const allowedTypes = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/jpeg','image/png'])
const upload = multer({ storage: multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 10 * 1024 * 1024, files: 10 }, fileFilter: (_req, file, cb) => cb(allowedTypes.has(file.mimetype) ? null : new Error('Only PDF, DOC, DOCX, JPG and PNG files are accepted.'), allowedTypes.has(file.mimetype)) })
router.get('/', requireAuth, async (req, res, next) => {
  try { res.json(await Document.find({ owner: req.user.id }).select('-filename').sort({ createdAt: -1 })) } catch (err) { next(err) }
})
router.post('/', requireAuth, (req, res, next) => upload.single('file')(req, res, async err => {
  if (err) return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ message: err.message })
  if (!req.file) return res.status(400).json({ message: 'Choose a document to upload.' })
  try {
    const doc = await Document.create({ owner: req.user.id, originalName: req.file.originalname, filename: req.file.filename, mimeType: req.file.mimetype, size: req.file.size, category: req.body.category || 'Other' })
    res.status(201).json({ id: doc.id, name: doc.originalName, size: doc.size, category: doc.category, createdAt: doc.createdAt })
  } catch (error) { fs.unlink(path.join(uploadDir, req.file.filename), () => {}); next(error) }
}))
router.get('/:id/download', requireAuth, async (req, res, next) => {
  try { const doc = await Document.findOne({ _id: req.params.id, owner: req.user.id }); if (!doc) return res.status(404).json({ message: 'Document not found.' }); res.download(path.join(uploadDir, doc.filename), doc.originalName) } catch (err) { next(err) }
})
router.delete('/:id', requireAuth, async (req, res, next) => {
  try { const doc = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user.id }); if (!doc) return res.status(404).json({ message: 'Document not found.' }); fs.unlink(path.join(uploadDir, doc.filename), () => {}); res.json({ deleted: true }) } catch (err) { next(err) }
})
export default router
