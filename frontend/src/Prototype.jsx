import { useMemo, useState } from 'react'
import { ArrowRight, Bookmark, BriefcaseBusiness, Check, ChevronRight, Compass, FileCheck2, GraduationCap, LayoutDashboard, Plus, Search, ShieldCheck, Sparkles, Target, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import './prototype.css'

const demoListings = [
  { id: 'p1', title: 'Software Engineering Intern', company: 'Northstar Labs', location: 'Remote · India', type: 'Internship', match: 94, tags: ['JavaScript', 'React', 'Mentorship'], deadline: 'Nov 18, 2026', summary: 'Build product features with a small engineering team and get weekly mentorship from senior developers.' },
  { id: 'p2', title: 'Graduate Software Developer', company: 'Fieldnote', location: 'Bengaluru, India', type: 'Graduate role', match: 88, tags: ['Java', 'APIs', 'New graduates'], deadline: 'Dec 02, 2026', summary: 'Join the early-career engineering team working on reliable tools for growing businesses.' },
  { id: 'p3', title: 'Student Developer Fellowship', company: 'Open Path', location: 'Remote · Global', type: 'Fellowship', match: 81, tags: ['Python', 'Open source', 'Students'], deadline: 'Nov 25, 2026', summary: 'A guided fellowship for students who want to contribute to open-source projects.' },
  { id: 'p4', title: 'Junior Product Design Intern', company: 'Brightside', location: 'Hybrid · Bengaluru', type: 'Internship', match: 76, tags: ['Figma', 'UX', 'Portfolio'], deadline: 'Dec 10, 2026', summary: 'Work with product designers to research, prototype, and improve everyday user experiences.' },
]

const initialDemoProfile = { name: 'Aarav Sharma', degree: 'B.E. Computer Science', year: '3rd year', location: 'Bengaluru, India', skills: 'React, JavaScript, Python' }
const navItems = [
  ['Overview', 'overview', LayoutDashboard],
  ['Find opportunities', 'find', Compass],
  ['Saved applications', 'saved', Bookmark],
  ['Application tracker', 'tracker', BriefcaseBusiness],
  ['Student profile', 'profile', UserRound],
]

export default function Prototype() {
  const [section, setSection] = useState('overview')
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState([])
  const [profile, setProfile] = useState(initialDemoProfile)
  const [notice, setNotice] = useState('')

  const listings = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return demoListings
    return demoListings.filter(item => `${item.title} ${item.company} ${item.location} ${item.type} ${item.tags.join(' ')}`.toLowerCase().includes(normalized))
  }, [query])

  const changeSection = next => {
    setNotice('')
    setSection(next)
  }

  const toggleSaved = listing => {
    const exists = saved.some(item => item.id === listing.id)
    setSaved(current => exists
      ? current.filter(item => item.id !== listing.id)
      : [...current, { ...listing, status: 'Saved', nextStep: '', notes: '' }])
    setNotice(exists ? 'Removed from this demo shortlist.' : 'Saved to this demo shortlist.')
  }

  const updateApplication = (id, updates) => {
    setSaved(current => current.map(item => item.id === id ? { ...item, ...updates } : item))
  }

  const activeLabel = navItems.find(([label, value]) => value === section)?.[0]

  return <div className="prototype-shell">
    <aside className="prototype-sidebar">
      <Link to="/" className="brand prototype-brand"><span className="brand-icon"><Sparkles size={17}/></span>applyready<span className="brand-ai">AI</span></Link>
      <div className="prototype-account"><span className="prototype-avatar">{profile.name.split(' ').map(part => part[0]).join('')}</span><div><strong>Demo workspace</strong><span>Interactive prototype</span></div></div>
      <div className="prototype-nav-caption">YOUR WORKSPACE</div>
      <nav className="prototype-nav" aria-label="Prototype sections">{navItems.map(([label, value, Icon]) =>
        <button key={value} className={section === value ? 'active' : ''} onClick={() => changeSection(value)}><Icon size={17}/><span>{label}</span>{value === 'saved' && <small>{saved.length}</small>}</button>
      )}</nav>
      <div className="prototype-sidebar-foot"><ShieldCheck size={16}/><span>Your prototype activity stays in this browser session.</span></div>
    </aside>

    <main className="prototype-main">
      <header className="prototype-header">
        <div className="prototype-breadcrumb">Workspace <ChevronRight size={14}/> <strong>{activeLabel}</strong></div>
        <div className="prototype-header-actions"><span className="prototype-live-dot"/> Interactive demo <Link to="/register" className="button button-primary button-small">Create an account <ArrowRight size={14}/></Link></div>
      </header>
      <div className="prototype-demo-banner"><Sparkles size={15}/><span><strong>Prototype demo</strong> — example listings and edits are temporary and are not saved to your account.</span></div>

      <div className="prototype-content">
        {section === 'overview' && <Overview profile={profile} saved={saved} changeSection={changeSection}/>}
        {section === 'find' && <FindOpportunities listings={listings} query={query} setQuery={setQuery} saved={saved} toggleSaved={toggleSaved}/>}
        {section === 'saved' && <SavedApplications items={saved} changeSection={changeSection} toggleSaved={toggleSaved} updateApplication={updateApplication}/>}
        {section === 'tracker' && <ApplicationTracker items={saved} changeSection={changeSection} updateApplication={updateApplication}/>}
        {section === 'profile' && <StudentProfile profile={profile} setProfile={setProfile}/>}
        {notice && <div className="prototype-toast" role="status"><Check size={15}/>{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
      </div>
    </main>
  </div>
}

function Overview({ profile, saved, changeSection }) {
  const firstName = profile.name.trim().split(/\s+/)[0] || 'there'
  return <>
    <div className="prototype-page-heading"><div><span className="prototype-eyebrow">YOUR OPPORTUNITY FIELD GUIDE</span><h1>Good morning, {firstName} <span>✦</span></h1><p>Your next step, organized in one place.</p></div><button className="button button-primary" onClick={() => changeSection('find')}><Search size={15}/> Find opportunities</button></div>
    <div className="prototype-stat-grid">
      <Stat icon={Bookmark} label="Saved opportunities" value={saved.length} caption="in your shortlist"/>
      <Stat icon={BriefcaseBusiness} label="In progress" value={saved.filter(item => item.status === 'In progress').length} caption="applications underway"/>
      <Stat icon={Target} label="Top profile match" value={saved.length ? `${Math.max(...saved.map(item => item.match))}%` : '—'} caption="based on your profile"/>
      <Stat icon={FileCheck2} label="Profile skills" value={profile.skills.split(',').filter(Boolean).length} caption="skills added"/>
    </div>
    <section className="prototype-panel prototype-feature-panel">
      <div><span className="prototype-icon-soft"><Compass size={19}/></span><span className="prototype-eyebrow">LIVE OPPORTUNITY DISCOVERY</span><h2>Find work that fits your next step.</h2><p>Explore internships, early-career roles, and fellowships; save the ones you want to pursue.</p><button className="button button-primary" onClick={() => changeSection('find')}>Explore opportunities <ArrowRight size={14}/></button></div>
      <div className="prototype-feature-art"><div className="prototype-art-orbit orbit-one"/><div className="prototype-art-orbit orbit-two"/><div className="prototype-art-card"><span className="prototype-art-mark"><Sparkles size={17}/></span><strong>{profile.degree || 'Your student profile'}</strong><span>{profile.skills || 'Add skills to find a fit'}</span><div className="prototype-art-meter"><i/></div><small>PROFILE-BASED DISCOVERY</small></div></div>
    </section>
    <section className="prototype-section">
      <div className="prototype-section-heading"><div><span className="prototype-eyebrow">A SIMPLE WORKFLOW</span><h2>From search to next step.</h2></div><button className="prototype-text-button" onClick={() => changeSection('tracker')}>Open tracker <ArrowRight size={14}/></button></div>
      <div className="prototype-steps">
        {[['01','Discover','Explore roles that fit your interests.'],['02','Shortlist','Save opportunities to your list.'],['03','Take action','Track the status and next step.']].map(([number, title, text]) => <article className="prototype-panel prototype-step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </section>
  </>
}

function Stat({ icon: Icon, label, value, caption }) {
  return <div className="prototype-panel prototype-stat"><span className="prototype-stat-icon"><Icon size={17}/></span><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>
}

function FindOpportunities({ listings, query, setQuery, saved, toggleSaved }) {
  return <>
    <div className="prototype-page-heading"><div><span className="prototype-eyebrow">DISCOVER YOUR NEXT MOVE</span><h1>Find opportunities.</h1><p>Explore example listings matched to a student profile.</p></div><span className="prototype-result-count">{listings.length} example {listings.length === 1 ? 'listing' : 'listings'}</span></div>
    <label className="prototype-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search internship, Java, design…"/>{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
    {listings.length
      ? <div className="prototype-listing-grid">{listings.map(item => <ListingCard key={item.id} item={item} saved={saved.some(savedItem => savedItem.id === item.id)} onSave={() => toggleSaved(item)}/>)}</div>
      : <EmptyPanel icon={Search} title="No example listings match" text="Try a broader search such as “internship”, “React”, or “India”."/>}
  </>
}

function ListingCard({ item, saved, onSave }) {
  return <article className="prototype-panel prototype-listing">
    <div className="prototype-listing-top"><span className="prototype-company-mark">{item.company.slice(0, 1)}</span><span className="prototype-match"><Target size={13}/>{item.match}% fit</span></div>
    <span className="prototype-listing-company">{item.company} · {item.location}</span><h2>{item.title}</h2><p>{item.summary}</p>
    <div className="prototype-tag-row">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    <div className="prototype-listing-footer"><span><BriefcaseBusiness size={13}/>{item.type}</span><span>{item.deadline}</span><button className={saved ? 'prototype-save is-saved' : 'prototype-save'} onClick={onSave} aria-label={saved ? 'Remove saved listing' : 'Save listing'}>{saved ? <Check size={15}/> : <Plus size={15}/>}{saved ? 'Saved' : 'Save'}</button></div>
  </article>
}

function SavedApplications({ items, changeSection, toggleSaved, updateApplication }) {
  return <>
    <div className="prototype-page-heading"><div><span className="prototype-eyebrow">YOUR SHORTLIST</span><h1>Saved opportunities.</h1><p>Keep track of the roles you want to pursue.</p></div><button className="button button-primary" onClick={() => changeSection('find')}><Plus size={15}/> Add opportunity</button></div>
    {items.length ? <div className="prototype-listing-grid">{items.map(item => <ApplicationCard key={item.id} item={item} onUpdate={updates => updateApplication(item.id, updates)} onRemove={() => toggleSaved(item)}/>)}</div> : <EmptyPanel icon={Bookmark} title="Your shortlist is empty" text="Find an opportunity and select Save to add it here." action="Find opportunities" onAction={() => changeSection('find')}/>}
  </>
}

function ApplicationTracker({ items, changeSection, updateApplication }) {
  const stages = [['Saved', ['Saved']], ['In progress', ['In progress']], ['Submitted', ['Submitted']]]
  return <>
    <div className="prototype-page-heading"><div><span className="prototype-eyebrow">APPLICATION TRACKER</span><h1>Keep every application moving.</h1><p>Update a listing’s status and write down your next action.</p></div><button className="button button-primary" onClick={() => changeSection('find')}><Plus size={15}/> Find an opportunity</button></div>
    {items.length ? <div className="prototype-tracker">{stages.map(([stage, statuses]) => {
      const stageItems = items.filter(item => statuses.includes(item.status))
      return <section className="prototype-tracker-column" key={stage}><div className="prototype-tracker-heading"><strong>{stage}</strong><span>{stageItems.length}</span></div>{stageItems.length ? stageItems.map(item => <ApplicationCard key={item.id} item={item} compact onUpdate={updates => updateApplication(item.id, updates)}/>) : <div className="prototype-empty-column">No applications here yet.</div>}</section>
    })}</div> : <EmptyPanel icon={BriefcaseBusiness} title="No applications to track yet" text="Save an opportunity first, then update its status here." action="Find opportunities" onAction={() => changeSection('find')}/>}
  </>
}

function ApplicationCard({ item, onUpdate, onRemove, compact = false }) {
  return <article className="prototype-panel prototype-application-card">
    <div className="prototype-listing-top"><span className="prototype-company-mark">{item.company.slice(0, 1)}</span><span className="prototype-match">{item.match}% fit</span></div>
    <span className="prototype-listing-company">{item.company} · {item.type}</span><h2>{item.title}</h2><p>{item.location} · Deadline {item.deadline}</p>
    <label className="prototype-field-label">Application status<select value={item.status} onChange={event => onUpdate({ status: event.target.value })}><option>Saved</option><option>In progress</option><option>Submitted</option></select></label>
    <label className="prototype-field-label">Next step<input value={item.nextStep} placeholder="e.g. Tailor my resume" onChange={event => onUpdate({ nextStep: event.target.value })}/></label>
    {!compact && <label className="prototype-field-label">Notes<textarea value={item.notes} placeholder="Add a reminder or application note" onChange={event => onUpdate({ notes: event.target.value })}/></label>}
    {onRemove && <button className="prototype-remove-button" onClick={onRemove}><X size={13}/> Remove from shortlist</button>}
  </article>
}

function StudentProfile({ profile, setProfile }) {
  return <>
    <div className="prototype-page-heading"><div><span className="prototype-eyebrow">STUDENT PROFILE</span><h1>Tell us about your next step.</h1><p>Edit these example details to see how a profile can inform opportunity discovery.</p></div><span className="prototype-avatar large"><GraduationCap size={20}/></span></div>
    <section className="prototype-panel prototype-profile-card">
      <div className="prototype-profile-heading"><span className="prototype-company-mark"><UserRound size={20}/></span><div><h2>Profile details</h2><p>Changes are temporary in this prototype.</p></div></div>
      <div className="prototype-profile-fields">
        <label className="prototype-field-label">Full name<input value={profile.name} onChange={event => setProfile(current => ({ ...current, name: event.target.value }))}/></label>
        <label className="prototype-field-label">Degree<input value={profile.degree} onChange={event => setProfile(current => ({ ...current, degree: event.target.value }))}/></label>
        <label className="prototype-field-label">Current year<input value={profile.year} onChange={event => setProfile(current => ({ ...current, year: event.target.value }))}/></label>
        <label className="prototype-field-label">Location<input value={profile.location} onChange={event => setProfile(current => ({ ...current, location: event.target.value }))}/></label>
        <label className="prototype-field-label full">Skills, separated by commas<textarea value={profile.skills} onChange={event => setProfile(current => ({ ...current, skills: event.target.value }))}/></label>
      </div>
      <div className="prototype-profile-note"><ShieldCheck size={15}/> In the full app, your saved profile belongs to your private account.</div>
    </section>
  </>
}

function EmptyPanel({ icon: Icon, title, text, action, onAction }) {
  return <div className="prototype-panel prototype-empty-state"><span><Icon size={22}/></span><h2>{title}</h2><p>{text}</p>{action && <button className="button button-primary" onClick={onAction}>{action} <ArrowRight size={14}/></button>}</div>
}
