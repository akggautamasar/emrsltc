
import React,{useEffect,useState} from 'react';
import {X,BookOpen,ExternalLink,Search,ShieldCheck,Info} from 'lucide-react';
import {medicalRules,medicalPolicyUrl,policyMeta,formsHelp} from './rules.js';
import {ceaRules,ceaPolicy} from './ceaRules.js';

export default function RulesDialog({form,onClose}){
 const [query,setQuery]=useState('');
 useEffect(()=>{
  const esc=e=>{if(e.key==='Escape')onClose()};
  document.addEventListener('keydown',esc);
  const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.removeEventListener('keydown',esc);document.body.style.overflow=overflow};
 },[onClose]);
 const medical=form==='medical';
 const cea=form==='cea';
 const isPolicy=medical||cea;
 const policy=cea?ceaPolicy:policyMeta;
 const policyUrl=cea?ceaPolicy.url:medicalPolicyUrl;
 const guide=formsHelp[form];
 const groups=isPolicy?(cea?ceaRules:medicalRules).filter(g=>(g.title+' '+g.page+' '+g.points.join(' ')).toLowerCase().includes(query.toLowerCase())):[];
 return <div className="rules-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <section className="rules-dialog" role="dialog" aria-modal="true" aria-label={isPolicy?policy.title:guide?.title}>
    <div className="rules-header">
      <div className="rules-header-title"><span className="rules-icon"><BookOpen size={20}/></span><div><span className="section-kicker">{isPolicy?'OFFICIAL POLICY REFERENCE':'DOCUMENT GUIDE'}</span><h2>{isPolicy?policy.title:guide?.title}</h2>{isPolicy&&<p>Issued {policy.date} · {policy.ref}</p>}</div></div>
      <button className="rules-close" onClick={onClose} aria-label="Close rules"><X size={21}/></button>
    </div>
    <div className="rules-body">
     {isPolicy?<><div className="rules-notice"><ShieldCheck size={18}/><p>{cea?ceaPolicy.note:'These are reading notes based on the uploaded NESTS circular. For full conditions, exceptions and changes, consult the official PDF. The policy decides admissibility; this form does not.'}</p></div><div className="rules-search"><Search size={17}/><input aria-label={cea?"Search CEA rules":"Search medical rules"} value={query} onChange={e=>setQuery(e.target.value)} placeholder={cea?"Search eligibility, age, hostel, disability, spouse, FAQ...":"Find a topic, e.g. emergency, dependent, hospital..."}/></div><div className="rule-groups">{groups.length?groups.map((group,i)=><details className="rule-group" key={group.title} open={!!query||i===0}><summary><strong>{group.title}</strong><small>{group.page}</small></summary><ul>{group.points.map((p,j)=><li key={j}>{p}</li>)}</ul></details>):<div className="rules-empty">No matching policy section. Try another term or open the official PDF below.</div>}</div></>:<><div className="rules-notice"><Info size={18}/><p>{guide.text}</p></div><ul className="rules-guide-list">{guide.points.map((p,i)=><li key={i}>{p}</li>)}</ul></>}
    </div>
    <div className="rules-footer">
      {isPolicy&&<a className="rules-pdf-link" href={policyUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Open full official NESTS PDF</a>}
      {cea&&<a className="rules-pdf-link" href={ceaPolicy.updatedGuidelines} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Later circulars</a>}<button className="rules-done" onClick={onClose}>Back to forms</button>
    </div>
  </section>
 </div>
}
