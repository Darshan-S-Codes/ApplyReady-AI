import { Router } from 'express'
import Opportunity from '../models/Opportunity.js'
import requireAuth from '../middleware/auth.js'
import { analyzeOpportunity } from '../services/ai.js'

const router = Router()
router.post('/analyze', async (req, res, next) => {
  try {
    const { description = '', url = '', profile = {} } = req.body
    if (!description.trim() && !url.trim()) return res.status(400).json({ message: 'Add an opportunity description or URL.' })
    if (description.length > 30000) return res.status(413).json({ message: 'Opportunity descriptions must be under 30,000 characters.' })
    const result = await analyzeOpportunity({ description, url, profile })
    return res.json(result)
  } catch (err) { next(err) }
})
router.get('/', requireAuth, async (req, res, next) => {
  try { res.json(await Opportunity.find({ owner: req.user.id }).sort({ updatedAt: -1 })) } catch (err) { next(err) }
})
router.post('/save', requireAuth, async (req, res, next) => {
  try {
    const { analysis, description, officialLink } = req.body
    if (!analysis?.title) return res.status(400).json({ message: 'A completed analysis is required.' })
    const item = await Opportunity.create({ owner: req.user.id, title: analysis.title, organization: analysis.company, type: analysis.type, description, officialLink: officialLink || analysis.officialLink, summary: analysis.summary, deadline: analysis.deadline ? new Date(analysis.deadline) : undefined, requirements: analysis.requirements, skills: analysis.skills?.map(s => s.name || s), documents: analysis.documents, analysis })
    res.status(201).json(item)
  } catch (err) { next(err) }
})
router.patch('/:id', requireAuth, async (req, res, next) => {
  try { const item = await Opportunity.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: { status: req.body.status } }, { new: true, runValidators: true }); if (!item) return res.status(404).json({ message: 'Opportunity not found.' }); res.json(item) } catch (err) { next(err) }
})
router.delete('/:id', requireAuth, async (req, res, next) => {
  try { const item = await Opportunity.findOneAndDelete({ _id: req.params.id, owner: req.user.id }); if (!item) return res.status(404).json({ message: 'Opportunity not found.' }); res.json({ deleted: true }) } catch (err) { next(err) }
})
export default router
