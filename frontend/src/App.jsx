import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Activity, ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Award, Bell, Bookmark, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock3, CloudUpload, Compass, FileCheck2, FileText, Filter, GraduationCap, LayoutDashboard, LockKeyhole, LogOut, Menu, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, Target, TrendingUp, Upload, UserRound, Users, WandSparkles, X, Zap } from 'lucide-react'
import Prototype from './Prototype.jsx'

const initialProfile = { name: '', email: '', phone: '', location: '', college: '', degree: '', branch: '', year: '', grad: '', cgpa: '', skills: [] }
const cx = (...xs) => xs.filter(Boolean).join(' ')

function useOwnedOpportunities() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('applyready-token')
    fetch('/api/opportunities', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load your saved opportunities.')
        if (active) setItems(data)
      })
      .catch(err => { if (active) setError(err.message || 'Could not load your saved opportunities.') })
    return () => { active = false }
  }, [])

  return { items, error }
}

function App() {
  const [profile, setProfile] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('applyready-profile') || 'null')
    const user = JSON.parse(localStorage.getItem('applyready-user') || 'null')
    const isDemoProfile = saved?.name === 'Aarav Sharma' || saved?.email?.toLowerCase() === 'aarav.sharma@email.com'
    if (isDemoProfile) localStorage.removeItem('applyready-profile')
    return {
      ...initialProfile,
      ...(isDemoProfile ? {} : saved),
      name: (isDemoProfile ? '' : saved?.name) || user?.name || '',
      email: (isDemoProfile ? '' : saved?.email) || user?.email || '',
    }
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState('')
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600) }
  const updateProfile = (next) => { setProfile(next); localStorage.setItem('applyready-profile', JSON.stringify(next)) }
  return <><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/demo" element={<Prototype />} />
    <Route path="/prototype" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<Auth mode="login" />} /><Route path="/register" element={<Auth mode="register" />} />
    <Route path="/*" element={<ProtectedWorkspace profile={profile} updateProfile={updateProfile} notify={notify} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />} />
  </Routes>{toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}</>
}

function ProtectedWorkspace(props) {
  const token = localStorage.getItem('applyready-token')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    let active = true
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Could not load your account.')
        if (!active) return
        const user = data.user
        props.updateProfile({
          ...props.profile,
          name: user.name || props.profile.name,
          email: user.email || props.profile.email,
          phone: user.phone || props.profile.phone,
          location: user.location || props.profile.location,
          college: user.college || props.profile.college,
          degree: user.degree || props.profile.degree,
          branch: user.branch || props.profile.branch,
          year: user.currentYear || props.profile.year,
          grad: user.graduationYear ? String(user.graduationYear) : props.profile.grad,
          cgpa: user.cgpa == null ? props.profile.cgpa : String(user.cgpa),
          skills: user.skills?.length ? user.skills : props.profile.skills,
          projects: (user.projects || []).map(project => ({
            ...project,
            id: project._id,
            attachments: (project.attachments || []).map(attachment => ({
              id: attachment.document?._id || attachment.document,
              name: attachment.name || attachment.document?.originalName || 'Project attachment',
            })),
          })),
          certifications: user.certifications || [],
        })
      })
      .catch(fetchError => { if (active) setError(fetchError.message || 'Could not load your account.') })
    return () => { active = false }
  }, [token])

  if (!token) return <Navigate to="/login" replace/>
  if (error) return <div className="auth-error" role="alert">{error}</div>
  return <Workspace {...props}/>
}

function Landing() {
  return <div className="landing">
    <header className="landing-nav"><Link to="/" className="brand"><span className="brand-icon"><Sparkles size={18}/></span>applyready<span className="brand-ai">AI</span></Link><nav><a href="#how">The method</a><a href="#features">What you get</a><a href="#security">Your privacy</a></nav><div className="nav-actions"><Link to="/login" className="nav-login">Log in</Link><Link to="/demo" className="nav-login">Try the demo</Link><Link to="/register" className="button button-primary button-small">Build my plan <ArrowRight size={15}/></Link></div></header>
    <main><section className="landing-hero"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> YOUR OPPORTUNITY FIELD GUIDE</div><h1>Your next move, <em>made clearer.</em></h1><p>One place to check the fine print, line up your documents and find the next step that gets you closer to the opportunity you want.</p><div className="hero-buttons"><Link to="/demo" className="button button-primary">Try the interactive demo <ArrowRight size={16}/></Link><Link to="/register" className="button button-outline">Create my account</Link></div><div className="trust-row"><div className="avatar-stack"><i>A</i><i>M</i><i>J</i><i>S</i></div><div><strong>Made for students,</strong><span>built around your next step</span></div><div className="trust-separator"/><div className="trust-safe"><ShieldCheck size={16}/> Your documents stay private</div></div></div>
    </section>
    <section className="proof-strip"><div><strong>One clear next step</strong><span>for every opportunity</span></div><i/><div><strong>Every requirement</strong><span>understood and matched</span></div><i/><div><strong>Your documents</strong><span>organized and ready</span></div><i/><div><strong>Confident applications</strong><span>start here</span></div></section>
    <section id="how" className="landing-section how-section"><div className="section-intro"><div className="eyebrow">A BETTER WAY TO GET READY</div><h2>From opportunity to <em>action plan.</em></h2><p>No more guessing what an application needs. Get a clear picture of where you stand, and what to do next.</p></div><div className="steps-grid">{[['01','Paste an opportunity','Drop in a link or paste the description. Any opportunity, anywhere.'],['02','AI reads the fine print','We pull out eligibility, skills, documents and deadlines.'],['03','See how you match','Your profile and document vault are checked against every requirement.'],['04','Know your next move','Get a personal action plan, then apply through the official link.']].map(([n,t,d])=><div className="step-card" key={n}><span className="step-number">{n}</span><div className="step-icon"><ArrowDownRight size={18}/></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section id="features" className="landing-section feature-section"><div className="feature-heading"><div><div className="eyebrow">EVERYTHING IN ONE PLACE</div><h2>More than a score.<br/><em>A plan to get there.</em></h2></div><p>Your readiness workspace brings together everything you need to make your next application count.</p></div><div className="features-grid">{[[Sparkles,'AI opportunity analyzer','Turn a dense notification into clear, structured requirements.','feature-purple'],[Target,'Eligibility checker','Know where you meet the bar and where you need a closer look.','feature-blue'],[FileCheck2,'Smart document vault','Keep application essentials organized, private and ready.','feature-green'],[TrendingUp,'Readiness score','See your progress at a glance and track it over time.','feature-orange'],[Zap,'Skill gap analysis','Spot the skills you can build before the deadline.','feature-yellow'],[CalendarDays,'Deadline tracker','Keep every important date and application in view.','feature-pink']].map(([Icon,title,description,color])=><div className="feature-card" key={title}><span className={cx('feature-icon',color)}><Icon size={18}/></span><h3>{title}</h3><p>{description}</p></div>)}</div></section>
    <section id="security" className="security-banner"><div className="security-symbol"><LockKeyhole size={21}/></div><div><h3>Your documents are yours. Always.</h3><p>Your profile and files are private to you. We use secure authentication and never share your documents with opportunity providers.</p></div><Link to="/register" className="button button-dark">Start with confidence <ArrowRight size={15}/></Link></section>
    <section className="bottom-cta"><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2>Ready when you are.</h2><p>Find out how ready you are for the opportunity you want.</p><Link to="/analyze" className="button button-primary">Analyze an opportunity <ArrowRight size={16}/></Link><div className="cta-orbit orbit-a"/><div className="cta-orbit orbit-b"/></section></main>
    <footer className="landing-footer"><Link to="/" className="brand"><span className="brand-icon"><Sparkles size={16}/></span>applyready<span className="brand-ai">AI</span></Link><span>Made for the next generation of applicants.</span><span>© 2026 ApplyReady AI</span></footer>
  </div>
}

function Workspace({ profile, updateProfile, notify, sidebarOpen, setSidebarOpen }) {
  const [search, setSearch] = useState('')
  const [userMenu, setUserMenu] = useState(false)
  const navItems = [{ label: 'Workspace', items: [['Dashboard', '/dashboard', LayoutDashboard], ['Find opportunities', '/analyze', Sparkles], ['Explore opportunities', '/opportunities', Compass]] }, { label: 'YOUR APPLICATIONS', items: [['Saved opportunities', '/saved', Bookmark], ['Application tracker', '/tracker', BriefcaseBusiness], ['Document vault', '/documents', FileCheck2]] }, { label: 'ACCOUNT', items: [['My profile', '/profile', UserRound], ['Settings', '/settings', Settings2]] }]
  return <div className="app-shell"><aside className={cx('sidebar',sidebarOpen&&'sidebar-open')}><div className="sidebar-brand"><Link to="/dashboard" className="brand"><span className="brand-icon"><Sparkles size={16}/></span>applyready<span className="brand-ai">AI</span></Link><button className="icon-button mobile-close" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div><div className="workspace-chip"><div className="mini-avatar">{profile.name.split(' ').map(x=>x[0]).join('')}</div><div><strong>My workspace</strong><span>Student account</span></div><ChevronDown size={14}/></div><div className="sidebar-scroll">{navItems.map(group=><div className="nav-group" key={group.label}><div className="nav-caption">{group.label}</div>{group.items.map(([label,path,Icon])=><NavLink to={path} key={path} onClick={()=>setSidebarOpen(false)} className={({isActive})=>cx('sidebar-link',isActive&&'active')}><Icon size={17}/><span>{label}</span>{label==='Analyze opportunity'&&<span className="new-tag">AI</span>}</NavLink>)}</div>)}</div><div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><CircleHelp size={17}/></span><strong>Need a hand?</strong><span>We're here to help you get ready.</span><button onClick={()=>notify('Help center coming soon')}>Visit help center <ArrowRight size={13}/></button></div><div className="profile-menu-wrap"><button className="profile-menu" onClick={()=>setUserMenu(!userMenu)}><div className="user-avatar">{profile.name.split(' ').map(part=>part[0]).join('')}</div><div className="user-meta"><strong>{profile.name||'Your account'}</strong><span>Student account</span></div><MoreHorizontal size={18}/></button>{userMenu&&<div className="user-dropdown"><NavLink to="/profile" onClick={()=>setUserMenu(false)}><UserRound size={15}/> My profile</NavLink><NavLink to="/settings" onClick={()=>setUserMenu(false)}><Settings2 size={15}/> Settings</NavLink><NavLink to="/" onClick={()=>{localStorage.removeItem('applyready-token');setUserMenu(false)}}><LogOut size={15}/> Log out</NavLink></div>}</div></div></aside><div className="app-main"><header className="app-header"><button className="icon-button menu-toggle" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><span className="breadcrumb-current">ApplyReady</span></div><div className="header-actions"><label className="header-search"><Search size={16}/><input placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></label><button className="header-icon" aria-label="Notifications" onClick={()=>notify('You’re all caught up!')}><Bell size={18}/><i/></button><div className="header-avatar">{profile.name.split(' ').map(part=>part[0]).join('')||'?'}</div></div></header><main className="page-content"><Routes><Route path="/" element={<Dashboard profile={profile} notify={notify}/>} /><Route path="/dashboard" element={<Dashboard profile={profile} notify={notify}/>} /><Route path="/analyze" element={<Analyze profile={profile} notify={notify}/>} /><Route path="/opportunities" element={<Opportunities/>} /><Route path="/saved" element={<Saved/>} /><Route path="/tracker" element={<Tracker/>} /><Route path="/documents" element={<Documents notify={notify}/>} /><Route path="/profile" element={<Profile profile={profile} updateProfile={updateProfile} notify={notify}/>} /><Route path="/settings" element={<Settings notify={notify}/>} /><Route path="*" element={<Dashboard profile={profile} notify={notify}/>} /></Routes></main></div></div>
}

function PageHead({ eyebrow, title, children, action }) { return <div className="page-head"><div><div className="page-eyebrow">{eyebrow}</div><h1>{title}</h1>{children&&<p>{children}</p>}</div>{action}</div> }
function Dashboard({ profile, notify }) {
  const { items, error } = useOwnedOpportunities()
  const firstName = profile.name.trim().split(/\s+/)[0]
  const date = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())
  return <>
    <PageHead eyebrow={date.toUpperCase()} title={firstName ? <>Welcome, {firstName}</> : 'Welcome to ApplyReady'}>
      <span>Your workspace reflects the information and opportunities you add.</span>
      <Link to="/analyze" className="button button-primary"><Sparkles size={15}/> Find opportunities</Link>
    </PageHead>
    <div className="stats-grid">
      <StatCard icon={Bookmark} tint="purple" label="Saved opportunities" value={items.length} change="" detail="in your account" href="/saved"/>
      <StatCard icon={BriefcaseBusiness} tint="green" label="In progress" value={items.filter(item => ['planning', 'in-progress'].includes(item.status)).length} change="" detail="in your tracker" href="/tracker"/>
      <StatCard icon={FileCheck2} tint="orange" label="Profile skills" value={profile.skills.length} change="" detail="added by you" href="/profile"/>
      <StatCard icon={UserRound} tint="blue" label="Profile details" value={Object.values(profile).filter(value => typeof value === 'string' && value.trim()).length} change="" detail="completed fields" href="/profile"/>
    </div>
    {error
      ? <div className="panel recommendation-empty" role="alert">{error}</div>
      : items.length
        ? <section className="panel opportunities-panel"><div className="panel-head"><div><h2>Your opportunities</h2><p>Saved to your account.</p></div><Link to="/saved" className="text-link">View saved <ArrowRight size={14}/></Link></div><OwnedOpportunityList items={items.slice(0, 3)}/></section>
        : <EmptyState icon={Compass} title="Your workspace is ready" text="There are no saved opportunities yet. Search for current opportunities to get started." action="Find opportunities" to="/analyze"/>}
  </>
}
function StatCard({icon:Icon,tint,label,value,change,detail,href}) { return <Link className="stat-card" to={href}><div className="stat-top"><span className={'stat-icon '+tint}><Icon size={17}/></span><span className="stat-menu"><MoreHorizontal size={17}/></span></div><span className="stat-label">{label}</span><div className="stat-value-row"><strong>{value}</strong><span className="stat-change">{change}</span></div><div className="stat-detail">{detail}</div></Link> }
function Analyze({profile}) {
  const [details, setDetails] = useState('')
  const [searched, setSearched] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [matches, setMatches] = useState([])
  const recommendationsRef = useRef(null)

  useEffect(() => {
    if (searchCount > 0) recommendationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [searchCount])

  const search = async () => {
    setSearched(true)
    setSearchError('')
    setMatches([])
    setLoading(true)
    setSearchCount(count => count + 1)
    try {
      const response = await fetch('/api/opportunities/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details, profile: { degree: profile.degree, branch: profile.branch, year: profile.year, skills: profile.skills, location: profile.location } }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not search live opportunities.')
      setMatches(data.opportunities)
    } catch (error) {
      setSearchError(error.message || 'Could not search live opportunities.')
    } finally {
      setLoading(false)
    }
  }

  return <>
    <PageHead eyebrow="OPPORTUNITY DISCOVERY" title="Find opportunities for you.">
      <span>Share your interests and skills to find opportunities that fit your profile.</span>
    </PageHead>
    <OpportunityReview profile={profile}/>
    <div className="analyzer-layout">
      <section className="panel analyze-input-panel">
        <div className="input-panel-head">
          <span className="analyze-icon"><Compass size={18}/></span>
          <div><h2>Tell us what you’re looking for</h2><p>Your profile is included automatically. Add interests or skills to improve the matches.</p></div>
        </div>
        <label className="form-label" htmlFor="opportunity-details">Your interests and additional details</label>
        <textarea id="opportunity-details" className="opportunity-textarea" value={details} onChange={event => setDetails(event.target.value)} placeholder="For example: I’m a computer science student interested in frontend development, React, and design systems."/>
        <div className="analyze-profile-preview">
          <span className="user-avatar">{profile.name.split(' ').map(part => part[0]).join('')}</span>
          <div><strong>Matching as {profile.name}</strong><span>{profile.degree} · {profile.year} · {profile.skills.join(', ')}</span></div>
          <Link to="/profile">Edit profile <ArrowRight size={13}/></Link>
        </div>
        <button className="button button-primary button-full analyze-button" onClick={search} disabled={loading}>
          {loading ? <><span className="spinner"/> Searching live opportunities…</> : <><Search size={16}/> Find matching opportunities <ArrowRight size={15}/></>}
        </button>
      </section>
      <aside className="analyze-aside">
        <div className="aside-tip">
          <div className="tip-top"><span className="tip-icon"><Sparkles size={16}/></span><span className="tip-badge">PERSONALIZED MATCHES</span></div>
          <h3>Start with your profile</h3>
          <p>Add your education, skills, and interests to your profile. We use them to find current listings from live job boards.</p>
          <Link to="/profile" className="text-link">Update your profile <ArrowRight size={13}/></Link>
        </div>
      </aside>
    </div>
    {searched && <section className="recommendations-section" ref={recommendationsRef}>
      <div className="panel-head">
        <div><h2>Live opportunities</h2><p>{loading ? 'Searching the web…' : searchError ? 'Search could not be completed' : `${matches.length} ${matches.length === 1 ? 'result' : 'results'} found`}</p></div>
      </div>
      {searchError
        ? <div className="panel recommendation-empty" role="alert"><p>{searchError}</p><p>Check your internet connection and try again.</p></div>
        : loading
          ? <div className="panel recommendation-empty" role="status">Searching for current opportunities…</div>
          : matches.length
            ? <div className="opportunity-cards-grid">{matches.map(item => <LiveOpportunityCard item={item} key={item.id}/>)}</div>
            : <div className="panel recommendation-empty"><p>No live results were found for those interests.</p><p>Try adding more specific skills, a role, or your preferred location.</p></div>}
    </section>}
  </>
}

function OpportunityReview({ profile }) {
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const analyze = async event => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setSaved(false)
    try {
      const token = localStorage.getItem('applyready-token')
      const response = await fetch('/api/opportunities/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ description, url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not analyze this opportunity.')
      setResult(data)
    } catch (analysisError) {
      setError(analysisError.message || 'Could not analyze this opportunity.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setError('')
    try {
      const token = localStorage.getItem('applyready-token')
      const opportunity = result.opportunity
      const response = await fetch('/api/opportunities/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ opportunity: { title: opportunity.title, organization: opportunity.organization, type: opportunity.type, summary: opportunity.summary, url: opportunity.applicationUrl || opportunity.sourceUrl }, description, analysis: opportunity }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Add an official application link before saving to your tracker.')
      setSaved(true)
    } catch (saveError) {
      setError(saveError.message || 'Could not save this opportunity.')
    }
  }

  const statusText = status => status === 'met' ? 'Satisfied' : status === 'missing' ? 'Not met' : 'Needs verification'
  return <section className="panel opportunity-review-panel">
    <div className="input-panel-head"><span className="analyze-icon"><WandSparkles size={18}/></span><div><h2>Analyze an opportunity</h2><p>Paste the description to check its requirements against your profile and private document vault.</p></div></div>
    <form onSubmit={analyze} className="opportunity-review-form">
      <label className="field-group"><span>Official opportunity URL (optional)</span><input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://organization.example/opportunity"/></label>
      <label className="field-group"><span>Opportunity description</span><textarea required value={description} onChange={event => setDescription(event.target.value)} maxLength={30000} placeholder="Paste the job, internship, scholarship, or fellowship description here…"/></label>
      <button className="button button-primary" disabled={loading}>{loading ? <><span className="spinner"/> Analyzing requirements…</> : <><Sparkles size={15}/> Analyze with AI</>}</button>
    </form>
    {error && <div className="auth-error" role="alert">{error}</div>}
    {result && <div className="readiness-result" aria-live="polite">
      <div className="readiness-result-head"><div><div className="eyebrow">AI OPPORTUNITY ANALYSIS</div><h3>{result.opportunity.title || 'Opportunity details'}</h3><p>{result.opportunity.organization || 'Organization not specified'}{result.opportunity.deadline ? ` · Deadline: ${result.opportunity.deadline}` : ' · Deadline not specified'}</p></div><div className="readiness-score"><strong>{result.readiness.readiness}%</strong><span>Ready</span></div></div>
      <p className="eligibility-summary">{result.readiness.likelyEligible === true ? 'Likely eligible based on the details available.' : result.readiness.likelyEligible === false ? 'One or more listed eligibility requirements do not match your profile.' : 'Eligibility needs verification because some details are missing.'} Final eligibility is determined by the opportunity provider.</p>
      <div className="readiness-breakdown">{result.readiness.scoreBreakdown.map(part => <div key={part.key}><span>{part.label}</span><strong>{part.score == null ? 'Not specified' : `${part.score}%`}</strong></div>)}</div>
      <div className="readiness-check-groups">
        {[['Eligibility', result.readiness.checks.eligibility], ['Required documents', result.readiness.checks.documents], ['Required skills', result.readiness.checks.skills]].map(([title, items]) => <section key={title}><h4>{title}</h4>{items.length ? items.map((item, index) => <div className="readiness-check" key={`${item.name}-${index}`}><span className={`readiness-status status-${item.status}`}>{statusText(item.status)}</span><div><strong>{item.name}</strong><span>{item.required ? `Required: ${item.required}` : item.matchedDocument ? `Found: ${item.matchedDocument}` : item.detail || item.suggestedSource || (item.student ? `Your profile: ${item.student}` : 'Add this information to your profile to check it.')}</span></div></div>) : <p>Not specified in the opportunity description.</p>}</section>)}
      </div>
      <section className="readiness-actions"><h4>Your next steps</h4>{result.readiness.actions.length ? <ol>{result.readiness.actions.map((action, index) => <li key={index}>{action}</li>)}</ol> : <p>No missing items found in the supplied information.</p>}</section>
      <div className="readiness-result-footer">{(result.opportunity.applicationUrl || result.opportunity.sourceUrl) && <a className="button button-outline" href={result.opportunity.applicationUrl || result.opportunity.sourceUrl} target="_blank" rel="noreferrer">Open source link <ArrowUpRight size={14}/></a>}{(result.opportunity.applicationUrl || result.opportunity.sourceUrl) && <button className="button button-primary" disabled={saved} onClick={save}>{saved ? 'Added to tracker' : 'Add to application tracker'} <ArrowRight size={14}/></button>}</div>
    </div>}
  </section>
}

function LiveOpportunityCard({item}) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const saveOpportunity = async () => {
    setSaving(true)
    setError('')
    try {
      const token = localStorage.getItem('applyready-token')
      const response = await fetch('/api/opportunities/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          opportunity: {
            title: item.title,
            organization: item.source,
            type: classifyOpportunityType(item.title, item.summary),
            summary: item.summary,
            url: item.url,
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not save this opportunity.')
      setSaved(true)
    } catch (saveError) {
      setError(saveError.message || 'Could not save this opportunity.')
    } finally {
      setSaving(false)
    }
  }

  return <article className="panel live-opportunity-card">
    <div className="live-opportunity-source"><Compass size={15}/>{item.source} · {classifyOpportunityType(item.title, item.summary)}{item.publishedDate&&<> · Published {item.publishedDate}</>}</div>
    <h3>{item.title}</h3>
    {item.summary&&<p>{item.summary}</p>}
    <div className="explore-card-actions">
      <button className="button button-outline" onClick={saveOpportunity} disabled={saved||saving}>{saved?'Saved to account':saving?'Saving…':'Save opportunity'} <Bookmark size={14}/></button>
      <a className="button button-primary" href={item.url} target="_blank" rel="noreferrer">View opportunity <ArrowUpRight size={14}/></a>
    </div>
    {error&&<p className="auth-error" role="alert">{error}</p>}
  </article>
}

function classifyOpportunityType(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase()
  if (/\bwerkstudent|working student|student assistant\b/.test(text)) return 'Working Student'
  if (/\bintern(ship)?\b|\bco-?op\b/.test(text)) return 'Internship'
  if (/\bscholarship\b/.test(text)) return 'Scholarship'
  if (/\bfellowship\b/.test(text)) return 'Fellowship'
  if (/\bhackathon\b/.test(text)) return 'Hackathon'
  if (/\b(job|career|full[- ]time|part[- ]time|employment)\b/.test(text)) return 'Job'
  return 'Opportunity'
}

function Opportunities() {
  return <><PageHead eyebrow="OPPORTUNITY DISCOVERY" title="Find current opportunities."><span>Search live listings using your interests and profile.</span><Link className="button button-primary" to="/analyze"><Search size={15}/> Search opportunities</Link></PageHead><EmptyState icon={Compass} title="Search live listings" text="We no longer show sample opportunities. Use live search to find current listings relevant to you." action="Find opportunities" to="/analyze"/></>
}
function OwnedOpportunityList({ items, onUpdate }) {
  return <div className="opportunity-cards-grid">{items.map(item => <OwnedOpportunityCard item={item} key={item._id} onUpdate={onUpdate}/>)}</div>
}
function OwnedOpportunityCard({ item, onUpdate }) {
  const [nextStep, setNextStep] = useState(item.nextStep || '')
  const [notes, setNotes] = useState(item.notes || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = async changes => {
    setBusy(true)
    setError('')
    try {
      const token = localStorage.getItem('applyready-token')
      const response = await fetch(`/api/opportunities/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(changes),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not update this application.')
      onUpdate(data)
      setNextStep(data.nextStep || '')
      setNotes(data.notes || '')
    } catch (updateError) {
      setError(updateError.message || 'Could not update this application.')
      setNextStep(item.nextStep || '')
      setNotes(item.notes || '')
    } finally {
      setBusy(false)
    }
  }

  return <article className="panel live-opportunity-card">
    <div className="live-opportunity-source">{item.organization || 'Opportunity'} · {item.type || 'Opportunity'}</div>
    <h3>{item.title}</h3>
    {item.summary && <p>{item.summary}</p>}
    <label className="form-label" htmlFor={`status-${item._id}`}>Application status</label>
    <select id={`status-${item._id}`} value={item.status} disabled={busy} onChange={event => update({ status: event.target.value })}>
      <option value="saved">Saved</option>
      <option value="planning">Planning</option>
      <option value="in-progress">In progress</option>
      <option value="submitted">Submitted</option>
      <option value="accepted">Accepted</option>
      <option value="rejected">Not selected</option>
    </select>
    <label className="form-label" htmlFor={`next-step-${item._id}`}>Next step</label>
    <input id={`next-step-${item._id}`} value={nextStep} maxLength={300} placeholder="Add your next action" onChange={event => setNextStep(event.target.value)} onBlur={() => { if (nextStep !== (item.nextStep || '')) update({ nextStep }) }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur() }}/>
    <label className="form-label" htmlFor={`notes-${item._id}`}>Application notes</label>
    <textarea id={`notes-${item._id}`} value={notes} maxLength={2000} placeholder="Add notes about this application" onChange={event => setNotes(event.target.value)} onBlur={() => { if (notes !== (item.notes || '')) update({ notes }) }}/>
    {item.appliedAt && <p>Submitted on {new Intl.DateTimeFormat().format(new Date(item.appliedAt))}</p>}
    <div className="explore-card-actions">
      {item.officialLink && <a className="button button-outline" href={item.officialLink} target="_blank" rel="noreferrer">Official opportunity <ArrowUpRight size={14}/></a>}
      {busy && <span role="status">Saving…</span>}
    </div>
    {error && <p className="auth-error" role="alert">{error}</p>}
  </article>
}
function Saved() {
  const { items: initialItems, error } = useOwnedOpportunities()
  const [items, setItems] = useState(initialItems)
  useEffect(() => setItems(initialItems), [initialItems])
  const updateItem = updated => setItems(current => current.map(item => item._id === updated._id ? updated : item))
  return <><PageHead eyebrow="YOUR SHORTLIST" title="Saved opportunities."><span>Opportunities saved to your account.</span><Link className="button button-primary" to="/analyze"><Compass size={15}/> Find opportunities</Link></PageHead>{error ? <div className="panel recommendation-empty" role="alert">{error}</div> : items.length ? <OwnedOpportunityList items={items} onUpdate={updateItem}/> : <EmptyState icon={Bookmark} title="Nothing saved yet" text="Search live opportunities, then save opportunities to see them here." action="Find opportunities" to="/analyze"/>}</>
}
function Tracker() {
  const { items: initialItems, error } = useOwnedOpportunities()
  const [items, setItems] = useState(initialItems)
  useEffect(() => setItems(initialItems), [initialItems])
  const updateItem = updated => setItems(current => current.map(item => item._id === updated._id ? updated : item))
  const stages = [
    ['Planning', ['saved', 'planning']],
    ['In progress', ['in-progress']],
    ['Submitted', ['submitted']],
    ['Submitted / decision', ['submitted', 'accepted', 'rejected']],
  ]
  return <><PageHead eyebrow="APPLICATION TRACKER" title="Your application tracker."><span>Track the real opportunities you have saved to your account.</span><Link className="button button-primary" to="/analyze"><Plus size={15}/> Find opportunities</Link></PageHead>{error ? <div className="panel recommendation-empty" role="alert">{error}</div> : items.length ? <div className="tracker-columns">{stages.map(([stage, statuses]) => {
    const stageItems = items.filter(item => statuses.includes(item.status))
    return <section className="tracker-column" key={stage}><div className="tracker-col-head"><strong>{stage}</strong><span>{stageItems.length}</span></div>{stageItems.length ? <OwnedOpportunityList items={stageItems} onUpdate={updateItem}/> : <div className="empty-column">No applications here yet.</div>}</section>
  })}</div> : <EmptyState icon={BriefcaseBusiness} title="No applications to track" text="Your tracker is empty. Find and save a live opportunity to get started." action="Find opportunities" to="/analyze"/>}</>
}

function Documents({notify}) {
  const [files, setFiles] = useState([])
  const [drag, setDrag] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [uploading, setUploading] = useState(false)

  const loadFiles = async () => {
    const token = localStorage.getItem('applyready-token')
    const response = await fetch('/api/documents', { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not load your documents.')
    setFiles(data.map(doc => ({
      id: doc._id,
      name: doc.originalName,
      detail: `${doc.category || 'Document'} · ${new Intl.DateTimeFormat().format(new Date(doc.createdAt))}`,
    })))
  }

  useEffect(() => {
    loadFiles().catch(error => setLoadError(error.message || 'Could not load your documents.'))
  }, [])

  const handleFiles = async list => {
    const token = localStorage.getItem('applyready-token')
    setUploading(true)
    setLoadError('')
    try {
      for (const file of Array.from(list || [])) {
        if (file.size > 10 * 1024 * 1024) {
          notify(`${file.name} is over the 10 MB limit`)
          continue
        }
        const body = new FormData()
        body.append('file', file)
        const response = await fetch('/api/documents', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || `Could not upload ${file.name}.`)
      }
      await loadFiles()
      if (list?.length) notify('Document added to your vault')
    } catch (error) {
      setLoadError(error.message || 'Could not upload your document.')
    } finally {
      setUploading(false)
    }
  }

  return <><PageHead eyebrow="SMART DOCUMENT VAULT" title="Your documents, ready when you are."><span>A secure home for the documents that make applications easier.</span><span className="secure-label"><LockKeyhole size={13}/> PRIVATE & SECURE</span></PageHead><div className="vault-summary"><div><span className="vault-summary-icon"><FileCheck2 size={17}/></span><div><strong>{files.length} documents</strong><span>Only documents uploaded to your account appear here.</span></div></div></div><div className={cx('upload-zone',drag&&'dragging')} onDragOver={event=>{event.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={event=>{event.preventDefault();setDrag(false);handleFiles(event.dataTransfer.files)}}><input id="doc-upload" type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={event=>handleFiles(event.target.files)}/><label htmlFor="doc-upload" className="upload-zone-content"><span className="upload-icon"><CloudUpload size={21}/></span><strong>{uploading?'Uploading…':<>Drop documents here, or <u>browse files</u></>}</strong><span>PDF, DOC, JPG or PNG · Up to 10 MB each</span></label></div>{loadError&&<div className="auth-error" role="alert">{loadError}</div>}<div className="vault-section-head"><div><h2>Your documents</h2><p>Only your account’s uploaded files appear here.</p></div></div>{files.length ? <div className="documents-grid">{files.map(file=><div className="panel document-card" key={file.id}><div className="document-card-top"><span className="document-icon blue"><FileText size={18}/></span></div><strong>{file.name}</strong><span className="document-detail">{file.detail}</span></div>)}</div> : !loadError&&<EmptyState icon={FileCheck2} title="No documents uploaded" text="Files will appear here after you upload them to your account." action="Upload a document" to="/documents"/>}<div className="document-privacy"><ShieldCheck size={16}/><div><strong>Your documents stay private.</strong><span>Only you can access the files in your account.</span></div><Link to="/settings">Learn about security <ArrowRight size={13}/></Link></div></>
}
function Profile({profile,updateProfile,notify}){const [form,setForm]=useState(profile);const [skills,setSkills]=useState(profile.skills.join(', '));const [saved,setSaved]=useState(false);const [saving,setSaving]=useState(false);const [saveError,setSaveError]=useState('');useEffect(()=>{setForm(profile);setSkills((profile.skills||[]).join(', '))},[profile]);const fields=[['name','Full name'],['email','Email address'],['phone','Phone number'],['location','Location'],['college','College / university'],['degree','Degree'],['branch','Branch / major'],['year','Current year'],['grad','Graduation year'],['cgpa','CGPA']];const completion=Math.min(100,Math.round((Object.values(form).filter(Boolean).length+Math.min(form.skills.length,5))/15*100));const update=(k,v)=>setForm(f=>({...f,[k]:v}));const save=async()=>{setSaving(true);setSaveError('');const next={...form,skills:skills.split(',').map(s=>s.trim()).filter(Boolean)};const projects=(next.projects||profile.projects||[]).map(project=>({_id:project._id||project.id,name:project.name,description:project.description,technologies:project.technologies||[],githubUrl:project.githubUrl||'',liveUrl:project.liveUrl||'',attachments:(project.attachments||[]).map(attachment=>({document:attachment.document?._id||attachment.document||attachment.id,name:attachment.name}))}));try{const token=localStorage.getItem('applyready-token');const response=await fetch('/api/auth/me',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({name:next.name,phone:next.phone,location:next.location,college:next.college,degree:next.degree,branch:next.branch,currentYear:next.year,graduationYear:next.grad?Number(next.grad):null,cgpa:next.cgpa?Number(next.cgpa):null,skills:next.skills,projects,certifications:next.certifications||profile.certifications||[]})});const data=await response.json();if(!response.ok)throw new Error(data.message||'Could not save your profile.');updateProfile({...next,email:data.user.email,projects,certifications:data.user.certifications||next.certifications||[]});setForm({...next,email:data.user.email,projects,certifications:data.user.certifications||next.certifications||[]});setSaved(true);notify('Your profile has been saved')}catch(error){setSaveError(error.message||'Could not save your profile.')}finally{setSaving(false)}};return <><PageHead eyebrow="YOUR STUDENT PROFILE" title="The story behind your next step."><span>A thoughtful profile helps us find opportunities and match requirements to you.</span><button className="button button-primary" onClick={save} disabled={saving}><Check size={15}/> {saving?'Saving...':'Save changes'}</button></PageHead>{saveError&&<div className="auth-error" role="alert">{saveError}</div>}<div className="profile-layout"><aside className="panel profile-progress-card"><div className="profile-big-avatar">{form.name.split(' ').map(s=>s[0]).join('')}</div><h2>{form.name}</h2><span>{form.degree}</span><div className="profile-progress-circle" style={{'--progress':`${completion}%`}}><div><strong>{completion}%</strong><span>complete</span></div></div><p>A more complete profile means more relevant matches and better readiness results.</p><div className="completion-next"><strong>Next up</strong><span><CheckCircle2 size={14}/> Add your projects</span><span><CheckCircle2 size={14}/> Add a preferred role</span></div></aside><div className="profile-form-column"><section className="panel profile-form-panel"><div className="profile-section-head"><span className="form-section-icon blue"><UserRound size={16}/></span><div><h2>Personal information</h2><p>How we should reach you.</p></div></div><div className="profile-fields">{fields.slice(0,4).map(([key,label])=><label className="field-group" key={key}><span>{label}</span><input value={form[key]||''} onChange={e=>update(key,e.target.value)}/></label>)}</div></section><section className="panel profile-form-panel"><div className="profile-section-head"><span className="form-section-icon purple"><GraduationCap size={17}/></span><div><h2>Academic information</h2><p>Your education and current studies.</p></div></div><div className="profile-fields">{fields.slice(4).map(([key,label])=><label className="field-group" key={key}><span>{label}</span><input value={form[key]||''} onChange={e=>update(key,e.target.value)}/></label>)}</div></section><section className="panel profile-form-panel"><div className="profile-section-head"><span className="form-section-icon green"><Zap size={16}/></span><div><h2>Skills and interests</h2><p>Separate each skill with a comma.</p></div></div><label className="field-group"><span>Your skills</span><input value={skills} onChange={e=>setSkills(e.target.value)}/></label><div className="profile-skill-pills">{skills.split(',').map(s=>s.trim()).filter(Boolean).map(s=><span key={s}>{s}<button onClick={()=>setSkills(skills.split(',').map(x=>x.trim()).filter(x=>x!==s).join(', '))}><X size={11}/></button></span>)}</div></section><section className="panel profile-form-panel"><div className="profile-section-head"><span className="form-section-icon orange"><BriefcaseBusiness size={16}/></span><div><h2>Projects and certifications</h2><p>Show what you’ve worked on and what you’ve learned.</p></div></div><ProjectSection projects={form.projects || profile.projects || []} profile={{...profile,...form}} updateProfile={updateProfile}/><CertificationSection certifications={form.certifications || profile.certifications || []} profile={{...profile,...form}} updateProfile={updateProfile}/></section></div></div></>}
function ProjectSection({ projects = [], profile, updateProfile }) {
  const [savedProjects, setSavedProjects] = useState(projects)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [technologies, setTechnologies] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setSavedProjects(projects), [projects])

  const saveProject = async event => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a project name.')
      return
    }
    setSaving(true)
    setError('')
    const token = localStorage.getItem('applyready-token')
    try {
      const attachments = []
      for (const file of files) {
        const body = new FormData()
        body.append('file', file)
        body.append('category', `Project: ${name.trim()}`)
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || `Could not upload ${file.name}.`)
        attachments.push({ document: result.id, name: result.name })
      }

      const project = {
        name: name.trim(),
        description: description.trim(),
        technologies: technologies.split(',').map(value => value.trim()).filter(Boolean),
        githubUrl: githubUrl.trim(),
        liveUrl: liveUrl.trim(),
        attachments,
      }
      const nextProjects = [...savedProjects, project]
      const projectsForStorage = nextProjects.map(savedProject => ({
        ...(savedProject._id || savedProject.id ? { _id: savedProject._id || savedProject.id } : {}),
        name: savedProject.name,
        description: savedProject.description,
        technologies: savedProject.technologies,
        githubUrl: savedProject.githubUrl,
        liveUrl: savedProject.liveUrl,
        attachments: (savedProject.attachments || []).map(attachment => ({
          document: attachment.document?._id || attachment.document || attachment.id,
          name: attachment.name,
        })),
      }))
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projects: projectsForStorage }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save your project.')

      setSavedProjects(nextProjects)
      updateProfile({ ...profile, projects: nextProjects })
      setName('')
      setDescription('')
      setTechnologies('')
      setGithubUrl('')
      setLiveUrl('')
      setFiles([])
      setFormOpen(false)
    } catch (saveError) {
      setError(saveError.message || 'Could not save your project.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    {savedProjects.map(project => <article className="profile-project-card" key={project._id || project.id || project.name}>
      <h3>{project.name}</h3>
      {project.description && <p>{project.description}</p>}
      {project.technologies?.length > 0 && <p>{project.technologies.join(', ')}</p>}
      <div className="project-links">
        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13}/></a>}
        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live project <ArrowUpRight size={13}/></a>}
      </div>
      {project.attachments?.map(attachment => <ProjectAttachment key={attachment.id || attachment.document} attachment={attachment}/>)}
    </article>)}
    {!formOpen
      ? <button className="add-profile-item" onClick={() => setFormOpen(true)}><Plus size={15}/> Add a project</button>
      : <form className="project-entry-form" onSubmit={saveProject}>
        <label className="field-group"><span>Project name</span><input required maxLength={120} value={name} onChange={event => setName(event.target.value)}/></label>
        <label className="field-group"><span>Description</span><textarea maxLength={2000} value={description} onChange={event => setDescription(event.target.value)}/></label>
        <label className="field-group"><span>Technologies (comma-separated)</span><input value={technologies} onChange={event => setTechnologies(event.target.value)}/></label>
        <label className="field-group"><span>GitHub URL (optional)</span><input type="url" value={githubUrl} onChange={event => setGithubUrl(event.target.value)}/></label>
        <label className="field-group"><span>Live project URL (optional)</span><input type="url" value={liveUrl} onChange={event => setLiveUrl(event.target.value)}/></label>
        <label className="field-group"><span>Project files (PDF, DOC/DOCX, JPG/PNG; max 10 MB each)</span><input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={event => setFiles(Array.from(event.target.files || []))}/></label>
        {files.length > 0 && <p>{files.map(file => file.name).join(', ')}</p>}
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="project-form-actions"><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving project…' : 'Save project'}</button><button type="button" className="button button-outline" disabled={saving} onClick={() => { setFormOpen(false); setError('') }}>Cancel</button></div>
      </form>}
  </>
}

function ProjectAttachment({ attachment }) {
  const [error, setError] = useState('')
  const download = async () => {
    try {
      const token = localStorage.getItem('applyready-token')
      const response = await fetch(`/api/documents/${attachment.id || attachment.document}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Could not download this file.')
      }
      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (downloadError) {
      setError(downloadError.message || 'Could not download this file.')
    }
  }
  return <div className="project-attachment"><button type="button" onClick={download}><FileText size={14}/>{attachment.name}<ArrowDown size={13}/></button>{error && <span role="alert">{error}</span>}</div>
}

function CertificationSection({ certifications = [], profile, updateProfile }) {
  const [items, setItems] = useState(certifications)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [date, setDate] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setItems(certifications), [certifications])

  const saveCertification = async event => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Enter a certification name.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const nextItems = [...items, { name: name.trim(), organization: organization.trim(), date, url: url.trim() }]
      const token = localStorage.getItem('applyready-token')
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ certifications: nextItems }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Could not save your certification.')
      setItems(result.user.certifications || nextItems)
      updateProfile({ ...profile, certifications: result.user.certifications || nextItems })
      setName('')
      setOrganization('')
      setDate('')
      setUrl('')
      setFormOpen(false)
    } catch (saveError) {
      setError(saveError.message || 'Could not save your certification.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    {items.map(item => <article className="profile-project-card" key={item._id || `${item.name}-${item.organization}`}>
      <h3>{item.name}</h3>
      {item.organization && <p>{item.organization}{item.date ? ` · ${item.date}` : ''}</p>}
      {item.url && <a href={item.url} target="_blank" rel="noreferrer">View certification <ArrowUpRight size={13}/></a>}
    </article>)}
    {!formOpen
      ? <button className="add-profile-item" onClick={() => setFormOpen(true)}><Plus size={15}/> Add a certification</button>
      : <form className="project-entry-form" onSubmit={saveCertification}>
        <label className="field-group"><span>Certification name</span><input required maxLength={120} value={name} onChange={event => setName(event.target.value)}/></label>
        <label className="field-group"><span>Issuing organization</span><input maxLength={120} value={organization} onChange={event => setOrganization(event.target.value)}/></label>
        <label className="field-group"><span>Date earned</span><input type="date" value={date} onChange={event => setDate(event.target.value)}/></label>
        <label className="field-group"><span>Credential URL (optional)</span><input type="url" value={url} onChange={event => setUrl(event.target.value)}/></label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <div className="project-form-actions"><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving certification…' : 'Save certification'}</button><button type="button" className="button button-outline" disabled={saving} onClick={() => { setFormOpen(false); setError('') }}>Cancel</button></div>
      </form>}
  </>
}

function Settings({notify}){return <><PageHead eyebrow="ACCOUNT PREFERENCES" title="Make this space yours."><span>Manage your account, preferences and privacy.</span></PageHead><div className="settings-layout"><section className="panel settings-panel"><div className="settings-section-title"><span className="form-section-icon blue"><UserRound size={16}/></span><div><h2>Account</h2><p>Personal details and login preferences.</p></div></div><div className="settings-row"><div><strong>Email notifications</strong><span>Opportunity matches, deadlines and application reminders.</span></div><Toggle onChange={()=>notify('Notification preferences updated')}/></div><div className="settings-row"><div><strong>Weekly opportunity digest</strong><span>A short roundup of opportunities that match your profile.</span></div><Toggle onChange={()=>notify('Digest preferences updated')}/></div><div className="settings-row"><div><strong>Profile visibility</strong><span>Your profile is private. Only you can see your details.</span></div><span className="private-tag"><LockKeyhole size={12}/> Private</span></div></section><section className="panel settings-panel"><div className="settings-section-title"><span className="form-section-icon green"><ShieldCheck size={16}/></span><div><h2>Privacy and security</h2><p>You’re in control of your information.</p></div></div><div className="settings-row"><div><strong>Secure document vault</strong><span>Your uploaded documents are private to your account.</span></div><Link to="/documents" className="text-link">View vault <ArrowRight size={13}/></Link></div><div className="settings-row"><div><strong>Data and account</strong><span>Manage your profile information and saved opportunities.</span></div><Link to="/profile" className="text-link">My profile <ArrowRight size={13}/></Link></div></section><button className="logout-button" onClick={()=>{localStorage.removeItem('applyready-token');notify('You have been logged out')}}><LogOut size={15}/> Log out</button></div></>}
function Toggle({onChange}){const [on,setOn]=useState(true);return <button role="switch" aria-checked={on} className={cx('toggle',on&&'toggle-on')} onClick={()=>{setOn(!on);onChange()}}><i/></button>}
function EmptyState({icon:Icon,title,text,action,to}){return <div className="panel empty-state"><span><Icon size={23}/></span><h2>{title}</h2><p>{text}</p><Link to={to} className="button button-primary">{action} <ArrowRight size={14}/></Link></div>}
function Auth({mode}){const navigate=useNavigate();const [name,setName]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');const [error,setError]=useState('');const [loading,setLoading]=useState(false);const submit=async e=>{e.preventDefault();setError('');if(mode==='register'&&password!==confirm){setError('Your passwords don’t match.');return}setLoading(true);try{const response=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});if(response.ok){const data=await response.json();localStorage.setItem('applyready-token',data.token);navigate(mode==='register'?'/profile':'/dashboard');return}const data=await response.json();setError(data.message||'Something went wrong. Try again.')}catch{setError('Connect the API server to create or sign in to your account.')}finally{setLoading(false)}};return <div className="auth-page"><Link className="brand auth-brand" to="/"><span className="brand-icon"><Sparkles size={16}/></span>applyready<span className="brand-ai">AI</span></Link><div className="auth-card"><span className="auth-icon"><Sparkles size={19}/></span><div className="eyebrow">{mode==='register'?'YOUR NEXT CHAPTER STARTS HERE':'WELCOME BACK'}</div><h1>{mode==='register'?'Make your next move.':'Good to have you back.'}</h1><p>{mode==='register'?'Create your account and see where your next opportunity can take you.':'Pick up right where you left off.'}</p><form onSubmit={submit}>{mode==='register'&&<label className="auth-field"><span>Full name</span><input autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></label>}<label className="auth-field"><span>Email address</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label className="auth-field"><span>Password</span><input type="password" minLength={8} autoComplete={mode==='register'?'new-password':'current-password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>{mode==='register'&&<label className="auth-field"><span>Confirm password</span><input type="password" minLength={8} autoComplete="new-password" required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Enter your password again"/></label>}{error&&<div className="auth-error">{error}</div>}<button className="button button-primary button-full auth-submit" disabled={loading}>{loading?'Please wait…':mode==='register'?'Create your account':'Log in'} <ArrowRight size={15}/></button></form><div className="auth-switch">{mode==='register'?'Already have an account?':'New to ApplyReady?'} <Link to={mode==='register'?'/login':'/register'}>{mode==='register'?'Log in':'Create an account'}</Link></div><div className="auth-privacy"><LockKeyhole size={13}/> Your profile and documents are private.</div></div><Link to="/" className="auth-back"><ArrowLeft size={14}/> Back to ApplyReady</Link></div>}

export default App
