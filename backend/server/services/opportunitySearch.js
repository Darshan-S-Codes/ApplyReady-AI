const TAVILY_SEARCH_URL = 'https://api.tavily.com/search'
const PUBLIC_JOB_BOARD_URL = 'https://www.arbeitnow.com/api/job-board-api'
const JOB_BOARD_CACHE_MS = 10 * 60 * 1000

let cachedJobBoard = null
let jobBoardFetchedAt = 0

function buildSearchQuery({ details, profile }) {
  const profileTerms = [
    profile.degree,
    profile.branch,
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    profile.location,
  ].filter(value => typeof value === 'string' && value.trim())
  const searchTerms = [...new Set([...details.split(/[,\n]/), ...profileTerms].map(term => term.trim()).filter(Boolean))]
  return `${searchTerms.join(' ')} student internships scholarships fellowships programs opportunities`
}

function normalizeResult(result) {
  let url
  try {
    url = new URL(result.url)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null

  const title = typeof result.title === 'string' ? result.title.trim() : ''
  if (!title) return null

  return {
    id: url.href,
    title,
    url: url.href,
    source: url.hostname.replace(/^www\./, ''),
    summary: typeof result.content === 'string' ? result.content.trim() : '',
    publishedDate: typeof result.published_date === 'string' ? result.published_date : null,
  }
}

function searchableTerms({ details, profile }) {
  const profileTerms = [
    profile.degree,
    profile.branch,
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    profile.location,
  ].filter(value => typeof value === 'string' && value.trim())
  return [...new Set([...details.split(/[,\n]/), ...profileTerms]
    .flatMap(term => term.toLowerCase().split(/[^a-z0-9+#.]+/))
    .filter(term => term.length > 2))]
}

function normalizePublicJob(job) {
  const result = normalizeResult({
    url: job.url,
    title: job.title,
    content: String(job.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
    published_date: job.created_at ? new Date(job.created_at * 1000).toISOString() : null,
  })
  if (!result) return null

  return {
    ...result,
    source: job.company_name ? `${job.company_name} · Arbeitnow` : 'Arbeitnow',
  }
}

async function searchPublicJobBoard({ details, profile }) {
  if (!cachedJobBoard || Date.now() - jobBoardFetchedAt > JOB_BOARD_CACHE_MS) {
    const response = await fetch(PUBLIC_JOB_BOARD_URL, { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error(`Public job listings are unavailable (job board returned ${response.status}).`)
    const data = await response.json()
    if (!Array.isArray(data.data)) throw new Error('Public job listings returned an invalid response.')
    cachedJobBoard = data.data
    jobBoardFetchedAt = Date.now()
  }

  const terms = searchableTerms({ details, profile })
  const ranked = cachedJobBoard.map(job => {
    const text = `${job.title || ''} ${job.company_name || ''} ${(job.tags || []).join(' ')} ${(job.job_types || []).join(' ')} ${job.location || ''} ${String(job.description || '').replace(/<[^>]*>/g, ' ')}`.toLowerCase()
    const score = terms.reduce((total, term) => total + (text.includes(term) ? (String(job.title || '').toLowerCase().includes(term) ? 3 : 1) : 0), 0)
    return { job, score }
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || (b.job.created_at || 0) - (a.job.created_at || 0))

  const seen = new Set()
  return ranked.map(({ job }) => normalizePublicJob(job)).filter(result => {
    if (!result || seen.has(result.url)) return false
    seen.add(result.url)
    return true
  }).slice(0, 10)
}

export async function searchLiveOpportunities({ details, profile = {} }) {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return searchPublicJobBoard({ details, profile })
  }

  let response
  try {
    response = await fetch(TAVILY_SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: buildSearchQuery({ details, profile }),
        topic: 'general',
        search_depth: 'basic',
        max_results: 10,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    try {
      return await searchPublicJobBoard({ details, profile })
    } catch (fallbackError) {
      const error = new Error(`Tavily search could not be reached, and the public job board could not be reached: ${fallbackError.message}`)
      error.status = 502
      throw error
    }
  }

  if (!response.ok) {
    try {
      return await searchPublicJobBoard({ details, profile })
    } catch (fallbackError) {
      const error = new Error(`Tavily search returned ${response.status}, and the public job board could not be reached: ${fallbackError.message}`)
      error.status = 502
      throw error
    }
  }

  const data = await response.json()
  const results = Array.isArray(data.results) ? data.results : []
  const seen = new Set()
  return results
    .map(normalizeResult)
    .filter(result => {
      if (!result || seen.has(result.url)) return false
      seen.add(result.url)
      return true
    })
}
