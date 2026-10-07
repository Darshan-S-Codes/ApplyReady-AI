const systemPrompt = `You are ApplyReady AI, an application-readiness assistant. Analyze the opportunity and student profile. Return only valid JSON with keys: title, company, type, deadline (human readable or null), officialLink (URL or null), summary, eligible (true/false/null), readiness (0-100), requirements (array of {name,status: met|partial|missing|unknown,detail}), documents (array of {name,status: ready|missing,detail}), skills (array of {name,status: matched|gap}), actions (array of 3-6 concise practical next steps). Be careful: do not infer protected traits or claim eligibility without evidence. Use unknown when information is insufficient. Consider only the supplied profile and opportunity.`

export function fallbackAnalysis(description = '', url = '', profile = {}) {
  const safeDescription = typeof description === 'string' ? description : ''
  const lower = safeDescription.toLowerCase()
  const title = safeDescription.split('\n').map(x => x.trim()).find(x => x.length > 8 && x.length < 100) || 'Opportunity analysis'
  const userSkills = Array.isArray(profile?.skills) ? profile.skills : []
  const requirements = []
  if (/student|enrolled|undergraduate|degree|university/.test(lower)) requirements.push({ name: 'Current student or degree enrollment', status: profile?.degree || profile?.college ? 'met' : 'unknown', detail: profile?.degree || 'Add your education to your profile' })
  if (/cgpa|gpa|grade|academic/.test(lower)) requirements.push({ name: 'Academic performance criteria', status: profile?.cgpa ? 'unknown' : 'unknown', detail: 'Compare your current CGPA with the stated threshold' })
  if (requirements.length === 0) requirements.push({ name: 'Review stated eligibility criteria', status: 'unknown', detail: 'The opportunity criteria need a closer review' })
  const documentNames = ['Resume / CV', 'Academic transcript']
  const documents = documentNames.map(name => ({ name, status: 'missing', detail: 'Add this document to your vault to check it against future applications' }))
  const extractedSkills = [...new Set((safeDescription.match(/\b(?:React|TypeScript|JavaScript|Python|Java|SQL|MongoDB|Machine Learning|Figma|Leadership|Communication|HTML|CSS)\b/gi) || []))]
  return { title, company: 'Opportunity provider', type: 'Opportunity', deadline: null, officialLink: url || null, summary: safeDescription.slice(0, 260), eligible: null, readiness: 50, requirements, documents, skills: extractedSkills.map(name => ({ name, status: userSkills.some(s => String(s).toLowerCase() === name.toLowerCase()) ? 'matched' : 'gap' })), actions: ['Review the opportunity’s eligibility criteria carefully', 'Add your education and experience to your student profile', 'Upload your resume and academic records to your document vault'] }
}

export async function analyzeOpportunity({ description, url, profile }) {
  const provider = process.env.AI_PROVIDER || 'mock'
  if (provider === 'openai' && process.env.AI_API_KEY) {
    const response = await fetch(process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
      body: JSON.stringify({ model: process.env.AI_MODEL || 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: JSON.stringify({ opportunity: { description, url }, studentProfile: profile }) }], temperature: 0.2 }),
    })
    if (!response.ok) throw new Error(`AI provider returned ${response.status}`)
    const data = await response.json()
    return JSON.parse(data.choices?.[0]?.message?.content || '{}')
  }
  return fallbackAnalysis(description || '', url || '', profile || {})
}
