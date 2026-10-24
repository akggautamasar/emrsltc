import React, {useEffect, useMemo, useState} from 'react';
import {
  Search, CalendarDays, Hash, Filter, Bookmark, BookmarkCheck,
  ExternalLink, FileText, RefreshCw, ArrowLeft, X, Plus, ShieldCheck,
  AlertTriangle, Clock3, ChevronDown, Download, ListFilter, CheckCircle2,
  Info, BookOpen, Copy, Link2, Database, SearchX
} from 'lucide-react';
import {policyLibrary} from './policyLibrary.js';
import './circular-finder.css';

const GENERAL = 'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=938&lid=373';
const EMPLOYEE = 'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=851&lid=487';
const CACHE_KEY = 'emrs-circular-finder-cache-v1';
const SAVED_KEY = 'emrs-circular-finder-saved-v1';
const CUSTOM_KEY = 'emrs-circular-finder-personal-v1';

const clean = s => String(s ?? '').toLocaleLowerCase().normalize('NFKC')
  .replace(/[–—‐‑]/g,'-').replace(/[^\p{L}\p{N}]+/gu,' ').trim();

const SEARCH_TERMS = {
  leave:['vacation','absence','casual leave','earned leave','chutti','holiday'],
  salary:['pay','payroll','increment','arrears','remuneration','allowance'],
  food:['mess','diet','meal','nutrition','catering','ration'],
  medical:['hospital','treatment','cghs','reimbursement','health','medical card'],
  transfer:['posting','relieving','ctg','transfer grant'],
  hostel:['warden','residential','dormitory','housemaster'],
  ltc:['leave travel concession'],
  cea:['children education allowance','hostel subsidy'],
  ta:['travelling allowance','travel bill','tour','tada']
};
const parseDate = date => {
  const s = String(date || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return '';
};
const formatDate = value => {
  const date = parseDate(value);
  return date ? date.slice(8) + '/' + date.slice(5,7) + '/' + date.slice(0,4) : 'Date not listed';
};
function classify(title) {
  const v = clean(title);
  if (/medical|hospital|health|cghs|nurse|doctor|reimbursement|treatment/.test(v)) return 'Medical & Health';
  if (/cea|hostel subsidy|ltc|travel|travelling|ta da|claim|salary|allowance|pay|leave|increment|transfer|posting|attendance|recruitment|employee|staff|service|guest teacher|resignation|deputation/.test(v)) return 'Employee & Service';
  if (/hostel|mess|food|ration|dormitor|warden|student safety|cctv|residential/.test(v)) return 'Hostel & Welfare';
  if (/finance|grant|procurement|cash book|accounts|bank|budget|gem |tally|audit|expenditure|repair/.test(v)) return 'Finance & Administration';
  if (/teacher|curriculum|syllabus|class|academic|exam|admission|student|school|training|laboratory|education|band|sports/.test(v)) return 'Academics & Training';
  return 'Other Circulars';
}
const isHttps = value => {
  try {return new URL(value).protocol === 'https:';} catch {return false;}
};
const safeGet = (key, fallback) => {
  try {const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;} catch{return fallback;}
};

const seededReferences = Object.entries(policyLibrary).flatMap(([key, p]) =>
  p.sources.filter(source => source.agency.startsWith('NESTS') && source.url.endsWith('.pdf'))
    .map((source, i) => ({
      id:`reference-${key}-${i}`,
      title:source.title,
      date:new Date(source.date + ' 00:00:00 GMT').toString() === 'Invalid Date' ? '' : new Date(source.date + ' 00:00:00 GMT').toISOString().slice(0,10),
      section:'Policy Circulars',
      number:null,
      circularNo:'Policy',
      refNumber:p.reference,
      pdfUrl:source.url,
      listingUrl:GENERAL,
      source:'official-reference',
      details:source.details,
      agency:source.agency
    }))
);

function distinctRecords(official, personal) {
  const map = new Map();
  const pdfs = new Set();
  const unique = [...official,...seededReferences,...personal].filter(item => item && item.title);
  for (const original of unique) {
    const item = {...original,category:classify(original.title)};
    if (item.source !== 'personal' && item.pdfUrl && pdfs.has(item.pdfUrl)) continue;
    if (item.pdfUrl && item.source !== 'personal') pdfs.add(item.pdfUrl);
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

const containsPhrase = (haystack, term) => (' ' + haystack + ' ').includes(' ' + term + ' ');
function scoreItem(item, text) {
  const needle = clean(text);
  if (!needle) return 1;
  const title=clean(item.title), ref=clean(item.refNumber), cat=clean(item.category);
  const date=(item.date || '') + ' ' + (item.date ? formatDate(item.date) : '');
  const full=clean([item.title,item.refNumber,item.circularNo,item.category,item.details,item.agency,date,item.pdfUrl].filter(Boolean).join(' '));
  const numeric = needle.match(/^(?:circular\s*)?#?\s*(\d{1,4})$/);
  if (numeric && Number(numeric[1]) === Number(item.number)) return 260;
  if (needle === ref && ref) return 220;
  if (title === needle) return 180;
  if (containsPhrase(title, needle)) return 110;
  if (ref && containsPhrase(ref, needle)) return 96;
  if (containsPhrase(full, needle)) return 85;
  const words=needle.split(' ').filter(Boolean);
  if (words.length > 1 && words.every(w => containsPhrase(full, w))) return 64;
  const synonyms=SEARCH_TERMS[needle] || [];
  if (synonyms.some(term=>containsPhrase(title,clean(term)))) return 38;
  return 0;
}

const getSearch = (item) => [item.title,item.refNumber,item.circularNo,item.date,formatDate(item.date),item.category,item.details].filter(Boolean).join(' ');
const suggest = ['leave','LTC','medical','salary','mess','transfer','CEA','TA/DA','hostel'];
const SECTIONS = ['All sources','General Circulars','For Serving Employees','Policy Circulars','Personal entries'];
const CATEGORIES = ['All topics','Employee & Service','Medical & Health','Hostel & Welfare','Finance & Administration','Academics & Training','Other Circulars'];

export default function CircularFinder({onBack}) {
  const [live,setLive] = useState(() => {
    const saved=safeGet(CACHE_KEY,null);
    return Array.isArray(saved?.records) ? saved : {records:[],updatedAt:null,sources:[]};
  });
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [ref,setRef]=useState('');
  const [date,setDate]=useState('');
  const [section,setSection]=useState('All sources');
  const [category,setCategory]=useState('All topics');
  const [sort,setSort]=useState('relevance');
  const [savedIds,setSavedIds]=useState(()=>safeGet(SAVED_KEY,[]));
  const [personal,setPersonal]=useState(()=>safeGet(CUSTOM_KEY,[]));
  const [onlySaved,setOnlySaved]=useState(false);
  const [limit,setLimit]=useState(30);
  const [panel,setPanel]=useState(null);
  const [addOpen,setAddOpen]=useState(false);
  const [entry,setEntry]=useState({title:'',date:'',refNumber:'',pdfUrl:'',notes:''});
  const [feedback,setFeedback]=useState('');

  async function refresh() {
    setLoading(true);setError('');
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),17000);
    try {
      const response=await fetch('/api/circulars',{signal:controller.signal,cache:'no-store'});
      if(!response.ok) throw Error('Official NESTS listing could not be reached (HTTP ' + response.status + ').');
      const payload=await response.json();
      if(!Array.isArray(payload.records) || !payload.records.length) throw Error('Publisher returned an empty circular list.');
      setLive(payload);
      try {localStorage.setItem(CACHE_KEY,JSON.stringify(payload));} catch {}
      const failed=(payload.sources||[]).filter(s=>s.error);
      if(failed.length) setError(failed.map(s=>s.section + ' currently unavailable').join('; ') + '. Showing all other retrieved sources.');
    } catch(e) {
      setError((e.name === 'AbortError' ? 'The NESTS site took too long to respond.' : e.message || 'Could not refresh the official listing.')+
        ' Using cached official results if available, plus verified policy references.');
    } finally {
      clearTimeout(timeout);setLoading(false);
    }
  }
  useEffect(()=>{refresh();},[]);
  useEffect(()=>{try{localStorage.setItem(SAVED_KEY,JSON.stringify(savedIds));}catch{}},[savedIds]);
  useEffect(()=>{try{localStorage.setItem(CUSTOM_KEY,JSON.stringify(personal));}catch{}},[personal]);
  useEffect(()=>{setLimit(30);},[query,ref,date,section,category,onlySaved,sort]);

  const records=useMemo(()=>distinctRecords(live.records,personal),[live.records,personal]);
  const filtered=useMemo(()=>{
    const result=[];
    for(const item of records){
      if(section!=='All sources' && (section==='Personal entries' ? item.source!=='personal' : item.section!==section)) continue;
      if(category!=='All topics'&& item.category!==category) continue;
      if(onlySaved&&!savedIds.includes(item.id))continue;
      if(ref.trim()&&!clean([item.circularNo,item.refNumber,item.pdfUrl].join(' ')).includes(clean(ref)))continue;
      if(date.trim()){
        const normalized=parseDate(date.trim())||date.trim();
        if(!(String(item.date||'').includes(normalized)||formatDate(item.date).includes(normalized)))continue;
      }
      const rank=scoreItem(item,query);
      if(!rank)continue;
      result.push({...item,rank});
    }
    return result.sort((a,b)=>{
      if(sort==='newest')return String(b.date||'').localeCompare(String(a.date||'')) || b.rank-a.rank;
      if(sort==='oldest')return String(a.date||'9999').localeCompare(String(b.date||'9999'));
      if(sort==='title')return a.title.localeCompare(b.title);
      return (query.trim()?b.rank-a.rank:0) || String(b.date||'').localeCompare(String(a.date||'')) || (b.number||0)-(a.number||0);
    });
  },[records,query,ref,date,section,category,onlySaved,sort,savedIds]);
  const active=Boolean(query||ref||date||section!=='All sources'||category!=='All topics'||onlySaved);
  const visible=filtered.slice(0,limit);
  const toggleSaved=id=>setSavedIds(list=>list.includes(id)?list.filter(x=>x!==id):[...list,id]);
  const resetFilters=()=>{setQuery('');setRef('');setDate('');setCategory('All topics');setSection('All sources');setOnlySaved(false);setSort('relevance')};
  const addPersonal=e=>{
    e.preventDefault();
    if(entry.title.trim().length<5){setFeedback('Please enter a descriptive subject.');return}
    if(entry.pdfUrl.trim()&&!isHttps(entry.pdfUrl.trim())){setFeedback('Links must start with https://');return}
    const created={
      id:'personal-'+Date.now(),number:null,circularNo:'Personal',
      title:entry.title.trim(),date:entry.date,refNumber:entry.refNumber.trim(),
      details:entry.notes.trim(),pdfUrl:entry.pdfUrl.trim()||null,
      listingUrl:GENERAL,section:'Personal entries',source:'personal'
    };
    setPersonal(items=>[created,...items]);setEntry({title:'',date:'',refNumber:'',pdfUrl:'',notes:''});
    setAddOpen(false);setSection('Personal entries');setFeedback('Saved privately in this browser. This entry is not verified by NESTS.');
  };
  const downloadCsv=()=>{
    const rows=[['Circular','Date','Subject','Section','Reference','PDF URL','Listing URL','Source'],...filtered.map(item=>[
      item.circularNo, item.date, item.title, item.section, item.refNumber||'',item.pdfUrl||'',item.listingUrl||'',item.source
    ])];
    const value=rows.map(row=>row.map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob(['\ufeff',value],{type:'text/csv;charset=utf-8;'});
    const href=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=href;a.download='EMRS_NESTS_Circular_Search.csv';a.click();URL.revokeObjectURL(href);
  };

  return <main className="cf-page">
    <div className="container cf-container">
      <div className="cf-topline">
        <button type="button" className="back-button" onClick={onBack}><ArrowLeft size={17}/> Dashboard</button>
        <a href={GENERAL} target="_blank" rel="noopener noreferrer" className="cf-official-link">
          Official NESTS portal <ExternalLink size={14}/>
        </a>
      </div>
      <section className="cf-hero">
        <div className="cf-hero-shape" aria-hidden="true"><BookOpen size={62}/></div>
        <div className="cf-overline"><span className="cf-live-dot"/> EMRS DOCUMENT INTELLIGENCE</div>
        <h1>NESTS <span>Circular Finder</span></h1>
        <p>Find circulars by subject, partial reference, circular number or date. Search official General Circulars and For Serving Employees listings together.</p>
        <div className="cf-hero-chips">
          <span><Database size={14}/> {live.records.length ? `${live.records.length} official listing entries cached` : 'Live official directory'}</span>
          <span><ShieldCheck size={14}/> No fabricated PDF links</span>
        </div>
      </section>
      <section className="cf-searchbox" aria-label="Search NESTS circulars">
        <label className="cf-field cf-field-primary">
          <span><Search size={17}/> Search title, circular number or known subject</span>
          <div className="cf-input-wrap">
            <Search size={21}/>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              type="search" placeholder='Try "medical reimbursement", "mess", "#147", "leave"'
              autoComplete="off" aria-label="Search circulars"/>
            {query&&<button className="cf-clear-input" onClick={()=>setQuery('')} type="button" aria-label="Clear search"><X size={18}/></button>}
          </div>
        </label>
        <div className="cf-topic-strip">
          <span>Popular:</span>
          {suggest.map(v=><button className={clean(query)===clean(v)?'selected':''} type="button" key={v} onClick={()=>setQuery(query===v?'':v)}>{v}</button>)}
        </div>
        <div className="cf-filter-grid">
          <label className="cf-field">
            <span><Hash size={15}/> Reference / Circular no.</span>
            <input value={ref} onChange={e=>setRef(e.target.value)} placeholder="e.g. 1496 or 244"/>
          </label>
          <label className="cf-field">
            <span><CalendarDays size={15}/> Date / Year</span>
            <input value={date} onChange={e=>setDate(e.target.value)} placeholder="2025 or 01/10/2025"/>
          </label>
          <label className="cf-field">
            <span><Filter size={15}/> NESTS section</span>
            <select value={section} onChange={e=>setSection(e.target.value)}>{SECTIONS.map(v=><option key={v}>{v}</option>)}</select>
          </label>
          <label className="cf-field">
            <span><ListFilter size={15}/> Topic</span>
            <select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(v=><option key={v}>{v}</option>)}</select>
          </label>
        </div>
        <div className="cf-toolrow">
          <button type="button" onClick={()=>setOnlySaved(s=>!s)} className={onlySaved?'cf-tool is-active':'cf-tool'}>
            {onlySaved?<BookmarkCheck size={15}/>:<Bookmark size={15}/>} Saved ({savedIds.length})
          </button>
          <button type="button" onClick={()=>setAddOpen(v=>!v)} className="cf-tool"><Plus size={15}/> Add reference</button>
          <button type="button" onClick={downloadCsv} className="cf-tool" disabled={!filtered.length}><Download size={15}/> Export results</button>
          <button type="button" onClick={resetFilters} className="cf-tool cf-tool-reset" disabled={!active}><X size={15}/> Clear filters</button>
        </div>
      </section>
      {addOpen&&<section className="cf-add-panel">
        <div className="cf-panel-head"><h2>Add personal reference</h2><button onClick={()=>setAddOpen(false)} aria-label="Close add reference" type="button"><X size={18}/></button></div>
        <p>Keep a letter you found for future searching. Added entries are saved only in this browser and are marked personal/unverified, not official indexed documents.</p>
        <form className="cf-add-grid" onSubmit={addPersonal}>
          <label>Subject *<input required minLength={5} value={entry.title} onChange={e=>setEntry(x=>({...x,title:e.target.value}))}/></label>
          <label>Reference no.<input value={entry.refNumber} onChange={e=>setEntry(x=>({...x,refNumber:e.target.value}))}/></label>
          <label>Issue date<input type="date" value={entry.date} onChange={e=>setEntry(x=>({...x,date:e.target.value}))}/></label>
          <label>Document URL (https)<input type="url" placeholder="https://…" value={entry.pdfUrl} onChange={e=>setEntry(x=>({...x,pdfUrl:e.target.value}))}/></label>
          <label className="cf-add-wide">Notes / text keywords<textarea rows={2} value={entry.notes} onChange={e=>setEntry(x=>({...x,notes:e.target.value}))}/></label>
          <button type="submit" className="cf-action cf-action-primary">Save to this browser <Plus size={16}/></button>
        </form>
      </section>}
      {feedback&&<div role="status" className="cf-feedback"><CheckCircle2 size={16}/>{feedback}<button type="button" onClick={()=>setFeedback('')} aria-label="Dismiss message"><X size={15}/></button></div>}
      <div className="cf-status">
        <div>
          <span className="cf-status-count">{filtered.length}</span>
          <strong> matching documents</strong>
          <p>
            {loading?'Updating the official index…':live.records.length
              ? `Official listing fetched ${live.updatedAt?new Date(live.updatedAt).toLocaleDateString('en-IN'): 'previously'} · ${live.records.length} entries`
              :'Verified policy references available; official live index not loaded.'}
          </p>
        </div>
        <div className="cf-status-actions">
          <label>Sort <select value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="relevance">Best match</option><option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option><option value="title">A–Z</option></select></label>
          <button type="button" onClick={refresh} disabled={loading} className="cf-refresh"><RefreshCw size={16} className={loading?'cf-spin':''}/> Refresh</button>
        </div>
      </div>
      {error&&<div className="cf-warning" role="alert"><AlertTriangle size={18}/><p>{error} <a href={GENERAL} target="_blank" rel="noopener noreferrer">Official circulars <ExternalLink size={12}/></a> · <a href={EMPLOYEE} target="_blank" rel="noopener noreferrer">Employee corner <ExternalLink size={12}/></a></p></div>}
      <div className="cf-cards">
        {visible.map(item => <article className="cf-card" key={item.id}>
          <div className="cf-card-header">
            <span className="cf-card-number">{item.circularNo||'Circular'}</span>
            <span className="cf-card-section">{item.section}</span>
            <button type="button" title={savedIds.includes(item.id)?'Remove saved':'Save circular'}
              aria-label={savedIds.includes(item.id)?'Remove bookmark':'Bookmark circular'}
              onClick={()=>toggleSaved(item.id)} className={savedIds.includes(item.id)?'cf-bookmark on':'cf-bookmark'}>
              {savedIds.includes(item.id)?<BookmarkCheck size={18}/>:<Bookmark size={18}/>}
            </button>
          </div>
          <h2>{item.title}</h2>
          <div className="cf-card-meta"><span><CalendarDays size={14}/> {formatDate(item.date)}</span><span>{item.category}</span></div>
          {item.refNumber&&<p className="cf-card-ref"><Hash size={13}/> {item.refNumber}</p>}
          {item.details&&<p className="cf-card-description">{item.details}</p>}
          <div className="cf-card-actions">
            {item.pdfUrl&&isHttps(item.pdfUrl)
              ? <a className="cf-action cf-action-primary" href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileText size={16}/> {item.source==='personal'?'Open saved link':'Open official PDF'} <ExternalLink size={14}/></a>
              : <a className="cf-action cf-action-alt" href={item.listingUrl||GENERAL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={16}/> View on NESTS listing</a>}
            <button type="button" className="cf-action cf-action-secondary" onClick={()=>setPanel(item)}>Details</button>
          </div>
          <div className="cf-card-footer">
            {item.source==='official-live'?<span className="cf-verified"><ShieldCheck size={13}/> NESTS listing</span>
            :item.source==='official-reference'?<span className="cf-verified"><ShieldCheck size={13}/> Verified policy reference</span>
            :<span className="cf-personal"><Info size={13}/> Personal · unverified</span>}
            {!item.pdfUrl&&<span className="cf-missing-link">PDF link not available in index</span>}
          </div>
        </article>)}
      </div>
      {!visible.length&&<div className="cf-empty">
        <SearchX size={38}/>
        <h2>No matching circulars in the current index</h2>
        <p>Try fewer keywords, a broader date or a different section. For exact text inside a PDF or an unknown internal reference, use the official document or add a known link to your personal index. The website does not claim to have extracted every PDF’s full text.</p>
        <button type="button" onClick={resetFilters}>Reset filters</button>
      </div>}
      {visible.length<filtered.length&&<button type="button" className="cf-load-more" onClick={()=>setLimit(n=>n+30)}>
        Show more circulars ({filtered.length-visible.length} remaining) <ChevronDown size={17}/>
      </button>}
      <div className="cf-disclaimer"><Info size={18}/>
        <p><b>Source accuracy:</b> Live rows are read from NESTS official listings. Only source-published download links appear as PDFs; a missing PDF opens the original listing instead of a guessed URL. Matching uses published subject/date/number metadata and manually added references—not the full scanned text of every PDF. Saved personal entries are not verified by NESTS.</p>
      </div>
    </div>
    {panel&&<div className="cf-modal-overlay" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&setPanel(null)}>
      <section role="dialog" aria-modal="true" aria-label="Circular details" className="cf-modal">
        <div className="cf-panel-head"><span className="cf-card-number">{panel.circularNo}</span><button type="button" aria-label="Close circular details" onClick={()=>setPanel(null)}><X size={19}/></button></div>
        <h2>{panel.title}</h2>
        <p className="cf-modal-meta"><CalendarDays size={15}/> {formatDate(panel.date)} · {panel.section}</p>
        {panel.refNumber&&<p className="cf-modal-ref">Reference: {panel.refNumber}</p>}
        {panel.details&&<p>{panel.details}</p>}
        <p className="cf-modal-message">{panel.source==='official-live'?'This subject and date were indexed from the official NESTS circular listing. Full letter text and internal reference number may only be visible after opening the original PDF.':panel.source==='official-reference'?'This document was linked in the official policy-reference library.':'This is a privately saved reference; the letter and link have not been independently verified.'}</p>
        <div className="cf-modal-actions">
          <a className="cf-action cf-action-primary" href={panel.pdfUrl&&isHttps(panel.pdfUrl)?panel.pdfUrl:panel.listingUrl||GENERAL} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> {panel.pdfUrl?'Open document':'Official listing'}</a>
          <button type="button" className="cf-action cf-action-secondary" onClick={()=>{navigator.clipboard?.writeText(getSearch(panel));setFeedback('Circular details copied if clipboard access is permitted.');setPanel(null);}}><Copy size={16}/> Copy details</button>
          {panel.source==='personal'&&<button type="button" className="cf-action cf-action-danger" onClick={()=>{if(window.confirm('Delete this personal reference from this browser?')){setPersonal(rows=>rows.filter(row=>row.id!==panel.id));setPanel(null)}}}>Remove personal entry</button>}
        </div>
      </section>
    </div>}
  </main>;
}
