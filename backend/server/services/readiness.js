const clean = value => String(value || '').trim().toLowerCase()
const list = value => Array.isArray(value) ? value.filter(Boolean).map(item => typeof item === 'object' ? String(item.name || item.value || '') : String(item)).filter(Boolean) : []
const hasMatch = (values, requirement) => {
  const needle = clean(requirement)
  if (!needle) return false
  return values.some(value => {
    const candidate = clean(value)
    if (!candidate) return false
    return candidate === needle || candidate.includes(needle) || needle.includes(candidate)
  })
}

function score(items) {
  if (!items.length) return null
  const points = { met: 1, missing: 0, unknown: 0.5 }
  return Math.round(items.reduce((total, item) => total + points[item.status], 0) / items.length * 100)
}

export function buildReadiness(extracted, profile, documents) {
  const criteria = extracted.eligibility || {}
  const eligibility = []
  const studentDegrees = [profile.degree].filter(Boolean)
  const studentBranches = [profile.branch].filter(Boolean)
  const gradYears = list(criteria.graduationYears)
  const degreeCriteria = list(criteria.degrees)
  const branchCriteria = list(criteria.branches)

  if (degreeCriteria.length) eligibility.push({ name: 'Degree', required: degreeCriteria.join(', '), student: profile.degree || null, status: profile.degree ? (degreeCriteria.some(item => hasMatch(studentDegrees, item)) ? 'met' : 'missing') : 'unknown' })
  if (branchCriteria.length) eligibility.push({ name: 'Branch', required: branchCriteria.join(', '), student: profile.branch || null, status: profile.branch ? (branchCriteria.some(item => hasMatch(studentBranches, item)) ? 'met' : 'missing') : 'unknown' })
  if (gradYears.length) eligibility.push({ name: 'Graduation year', required: gradYears.join(', '), student: profile.graduationYear ? String(profile.graduationYear) : null, status: profile.graduationYear ? (gradYears.includes(String(profile.graduationYear)) ? 'met' : 'missing') : 'unknown' })
  if (criteria.minimumCGPA != null) eligibility.push({ name: 'Minimum CGPA', required: String(criteria.minimumCGPA), student: profile.cgpa ?? null, status: profile.cgpa != null ? (Number(profile.cgpa) >= Number(criteria.minimumCGPA) ? 'met' : 'missing') : 'unknown' })
  for (const requirement of [...list(criteria.yearRequirements), ...list(criteria.categoryRequirements)]) {
    eligibility.push({ name: requirement, required: requirement, student: null, status: 'unknown' })
  }
  if (criteria.ageRequirement) eligibility.push({ name: 'Age requirement', required: String(criteria.ageRequirement), student: null, status: 'unknown' })
  if (!eligibility.length) eligibility.push({ name: 'Eligibility details', required: 'Not specified in the description', student: null, status: 'unknown' })

  const vault = documents.map(doc => ({ name: doc.originalName, category: doc.category }))
  const requiredDocuments = list(extracted.requiredDocuments).map(name => {
    const found = vault.find(doc => hasMatch([doc.originalName, doc.category], name))
    return { name, status: found ? 'met' : vault.length ? 'missing' : 'unknown', matchedDocument: found?.name || null, suggestedSource: found ? null : 'Contact your college administration or check its official student portal.' }
  })
  const skills = list(extracted.requiredSkills).map(name => ({ name, status: hasMatch(list(profile.skills), name) ? 'met' : profile.skills?.length ? 'missing' : 'unknown' }))
  const parts = [
    { key: 'eligibility', label: 'Eligibility', weight: 0.4, value: score(eligibility) },
    { key: 'documents', label: 'Documents', weight: 0.3, value: score(requiredDocuments) },
    { key: 'skills', label: 'Required skills', weight: 0.15, value: score(skills) },
    { key: 'profile', label: 'Profile', weight: 0.1, value: score([profile.degree, profile.branch, profile.graduationYear, profile.cgpa].map(value => ({ status: value ? 'met' : 'unknown' }))) },
    { key: 'deadline', label: 'Deadline', weight: 0.05, value: extracted.deadline ? (Number.isNaN(Date.parse(extracted.deadline)) ? 50 : Date.parse(extracted.deadline) >= Date.now() ? 100 : 0) : 50 },
  ]
  const readiness = Math.round(parts.reduce((total, part) => total + part.value * part.weight, 0))
  const failures = [...eligibility, ...requiredDocuments, ...skills].filter(item => item.status !== 'met')
  const actions = failures.map(item => {
    if (item.name === 'Eligibility details') return 'Verify eligibility criteria with the opportunity provider.'
    if (item.name.toLowerCase().includes('document') || requiredDocuments.includes(item)) return `Get ${item.name} from the relevant issuing office or official student portal.`
    if (item.status === 'unknown') return `Add your ${item.name.toLowerCase()} to your profile so it can be checked.`
    return `Review the ${item.name.toLowerCase()} requirement with the opportunity provider.`
  })
  if (extracted.applicationUrl) actions.push('Review your application materials and apply using the official link.')
  return {
    readiness,
    likelyEligible: eligibility.some(item => item.status === 'missing') ? false : eligibility.every(item => item.status === 'met') ? true : null,
    scoreBreakdown: parts.map(({ key, label, value }) => ({ key, label, score: value })),
    checks: { eligibility, documents: requiredDocuments, skills },
    actions: actions.slice(0, 8),
  }
}
