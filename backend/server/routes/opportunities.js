import { Router } from 'express'
import Opportunity from '../models/Opportunity.js'
import requireAuth from '../middleware/auth.js'
import { analyzeOpportunity } from '../services/ai.js'
import { searchLiveOpportunities } from '../services/opportunitySearch.js'
import { buildReadiness } from '../services/readiness.js'
import Document from '../models/Document.js'
import requireDatabase from '../middleware/requireDatabase.js'

const router = Router()
router.post('/search', async (req, res, next) => {
  try {
    const { details = '' } = req.body
    const profile = req.body.profile && typeof req.body.profile === 'object' && !Array.isArray(req.body.profile) ? req.body.profile : {}
    if (typeof details !== 'string' || details.length > 1000) {
      return res.status(400).json({ message: 'Interests and details must be under 1,000 characters.' })
    }
    if (!details.trim() && !profile.degree && !profile.branch && !profile.skills?.length) {
      return res.status(400).json({ message: 'Add your interests or education and skills to your profile first.' })
    }
    const opportunities = await searchLiveOpportunities({ details, profile })
    return res.json({ opportunities })
  } catch (err) { next(err) }
})

router.post('/analyze', requireDatabase, requireAuth, async (req, res, next) => {
  try {
    const { description = '', url = '' } = req.body
    if (typeof description !== 'string' || typeof url !== 'string') return res.status(400).json({ message: 'Description and URL must be text.' })
    if (!description.trim()) return res.status(400).json({ message: 'Paste the opportunity description. A URL can be added as a source link.' })
    if (description.length > 30000) return res.status(413).json({ message: 'Opportunity descriptions must be under 30,000 characters.' })
    const documents = await Document.find({ owner: req.user.id }).select('originalName category')
    const extracted = await analyzeOpportunity({ description, url })
    const readiness = buildReadiness(extracted, req.user, documents)
    return res.json({ opportunity: extracted, readiness })
  } catch (err) { next(err) }
})
router.get('/', requireAuth, async (req, res, next) => {
  try { res.json(await Opportunity.find({ owner: req.user.id }).sort({ updatedAt: -1 })) } catch (err) { next(err) }
})
router.post('/save', requireAuth, async (req, res, next) => {
  try {
    const source = req.body.opportunity || req.body
    const analysis = req.body.analysis
    const title = source.title || analysis?.title
    const officialLink = source.url || source.officialLink || req.body.officialLink || analysis?.officialLink
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'An opportunity title is required.' })
    let url
    try { url = new URL(officialLink) } catch { return res.status(400).json({ message: 'A valid opportunity URL is required.' }) }
    if (!['http:', 'https:'].includes(url.protocol)) return res.status(400).json({ message: 'Opportunity URLs must use HTTP or HTTPS.' })

    const itemData = {
      title: title.trim(),
      organization: source.organization || source.source || analysis?.company || '',
      type: source.type || analysis?.type || 'Opportunity',
      description: req.body.description || source.description || source.summary || '',
      officialLink: url.href,
      summary: source.summary || analysis?.summary || '',
      ...(analysis ? {
        deadline: analysis.deadline ? new Date(analysis.deadline) : undefined,
        requirements: analysis.requirements,
        skills: analysis.skills?.map(skill => skill.name || skill),
        documents: analysis.documents,
        analysis,
      } : {}),
    }

    let item = await Opportunity.findOne({ owner: req.user.id, officialLink: url.href })
    const created = !item
    if (item) {
      Object.assign(item, itemData)
      await item.save()
    } else {
      item = await Opportunity.create({ ...itemData, owner: req.user.id })
    }
    res.status(created ? 201 : 200).json(item)
  } catch (err) { next(err) }
})
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const updates = {}
    const allowedStatuses = ['saved', 'planning', 'in-progress', 'submitted', 'rejected', 'accepted']
    if ('status' in req.body) {
      if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid application status.' })
      updates.status = req.body.status
      if (req.body.status === 'submitted') updates.appliedAt = new Date()
    }
    if ('nextStep' in req.body) {
      if (typeof req.body.nextStep !== 'string' || req.body.nextStep.length > 300) return res.status(400).json({ message: 'The next step must be 300 characters or fewer.' })
      updates.nextStep = req.body.nextStep.trim()
    }
    if ('notes' in req.body) {
      if (typeof req.body.notes !== 'string' || req.body.notes.length > 2000) return res.status(400).json({ message: 'Notes must be 2,000 characters or fewer.' })
      updates.notes = req.body.notes.trim()
    }
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'Provide a status, next step, or notes to update.' })
    const item = await Opportunity.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { $set: updates }, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ message: 'Opportunity not found.' })
    res.json(item)
  } catch (err) { next(err) }
})
router.delete('/:id', requireAuth, async (req, res, next) => {
  try { const item = await Opportunity.findOneAndDelete({ _id: req.params.id, owner: req.user.id }); if (!item) return res.status(404).json({ message: 'Opportunity not found.' }); res.json({ deleted: true }) } catch (err) { next(err) }
})
export default router
