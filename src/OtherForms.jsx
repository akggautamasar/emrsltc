import React,{useState} from 'react';
import {ArrowLeft,Search,Printer,FileText,BookOpen} from 'lucide-react';
import BetaNotice from './BetaNotice.jsx';

const catalogue=[
{id:'cl',title:'Casual Leave Application',category:'Leave & Attendance',description:'Simple application for casual leave.',fields:[['employee','Employee name'],['designation','Designation'],['school','School / Institution'],['from','Leave from'],['to','Leave to'],['days','Number of days'],['reason','Reason for leave'],['station','Station / Contact during leave'],['date','Application date']]},
{id:'hq',title:'Headquarters / Station Leave Permission',category:'Leave & Attendance',description:'Request permission to leave headquarters.',fields:[['employee','Employee name'],['designation','Designation'],['school','School / Institution'],['from','Departure date'],['to','Return date'],['destination','Destination'],['reason','Purpose'],['contact','Contact number'],['date','Application date']]},
{id:'join',title:'Joining Report',category:'Service & Establishment',description:'Report joining or resuming duty.',fields:[['employee','Employee name'],['designation','Designation'],['school','School / Institution'],['joining','Date of joining'],['session','Forenoon / Afternoon'],['reference','Order / leave reference'],['remarks','Remarks'],['date','Report date']]},
{id:'noc',title:'NOC / Permission Request',category:'Permissions & NOCs',description:'Request permission to apply for another position or examination.',fields:[['employee','Employee name'],['designation','Designation'],['school','School / Institution'],['organisation','Recruiting organisation'],['post','Post / examination'],['notification','Advertisement / notification number'],['deadline','Last date'],['reason','Request details'],['date','Application date']]},
{id:'relieve',title:'Relieving Report',category:'Service & Establishment',description:'Draft an employee relieving request/report.',fields:[['employee','Employee name'],['designation','Designation'],['school','School / Institution'],['order','Transfer / relieving order'],['relieving','Proposed relieving date'],['destination','Next posting / destination'],['remarks','Remarks'],['date','Report date']]}
];
const planned=[
 {
  "title": "Casual Leave (CL) application",
  "category": "Leave & Attendance"
 },
 {
  "title": "Earned Leave (EL) application",
  "category": "Leave & Attendance"
 },
 {
  "title": "Half Pay Leave / Commuted Leave",
  "category": "Leave & Attendance"
 },
 {
  "title": "Medical Leave application",
  "category": "Leave & Attendance"
 },
 {
  "title": "Child Care Leave (CCL) application",
  "category": "Leave & Attendance"
 },
 {
  "title": "Maternity / Paternity Leave",
  "category": "Leave & Attendance"
 },
 {
  "title": "Special Casual Leave",
  "category": "Leave & Attendance"
 },
 {
  "title": "Leave extension / cancellation",
  "category": "Leave & Attendance"
 },
 {
  "title": "Leave encashment application",
  "category": "Leave & Attendance"
 },
 {
  "title": "Joining report after leave",
  "category": "Leave & Attendance"
 },
 {
  "title": "Station leave / headquarters permission",
  "category": "Leave & Attendance"
 },
 {
  "title": "Compensatory leave request",
  "category": "Leave & Attendance"
 },
 {
  "title": "LTC claim and LTC advance",
  "category": "Claims & Allowances"
 },
 {
  "title": "TA/DA tour claim",
  "category": "Claims & Allowances"
 },
 {
  "title": "Medical reimbursement",
  "category": "Claims & Allowances"
 },
 {
  "title": "Children Education Allowance (CEA)",
  "category": "Claims & Allowances"
 },
 {
  "title": "Hostel Subsidy",
  "category": "Claims & Allowances"
 },
 {
  "title": "Composite Transfer Grant (CTG)",
  "category": "Claims & Allowances"
 },
 {
  "title": "Transfer Travelling Allowance",
  "category": "Claims & Allowances"
 },
 {
  "title": "Salary arrears claim",
  "category": "Claims & Allowances"
 },
 {
  "title": "Pay fixation / pay protection request",
  "category": "Claims & Allowances"
 },
 {
  "title": "HRA declaration / request",
  "category": "Claims & Allowances"
 },
 {
  "title": "Tough Location / Special Duty Allowance request",
  "category": "Claims & Allowances"
 },
 {
  "title": "Festival / other permitted advance application",
  "category": "Claims & Allowances"
 },
 {
  "title": "Initial joining report",
  "category": "Service & Establishment"
 },
 {
  "title": "Employee personal information form",
  "category": "Service & Establishment"
 },
 {
  "title": "Service book verification / correction request",
  "category": "Service & Establishment"
 },
 {
  "title": "Family details declaration",
  "category": "Service & Establishment"
 },
 {
  "title": "Nomination forms (gratuity, insurance, etc.)",
  "category": "Service & Establishment"
 },
 {
  "title": "NPS / PRAN details or correction",
  "category": "Service & Establishment"
 },
 {
  "title": "Bank account change request",
  "category": "Service & Establishment"
 },
 {
  "title": "PAN / income tax declaration",
  "category": "Service & Establishment"
 },
 {
  "title": "Annual increment verification",
  "category": "Service & Establishment"
 },
 {
  "title": "Probation clearance / confirmation",
  "category": "Service & Establishment"
 },
 {
  "title": "Experience / service certificate request",
  "category": "Service & Establishment"
 },
 {
  "title": "No Dues / No Demand certificate",
  "category": "Service & Establishment"
 },
 {
  "title": "Transfer request",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Mutual transfer request",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Joining report after transfer",
  "category": "Transfers & Permissions"
 },
 {
  "title": "No Objection Certificate (NOC)",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Permission to apply for another job",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Forwarding application through proper channel",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Permission for higher studies",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Passport-related prior intimation / NOC",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Permission to leave headquarters",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Representation / service grievance",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Resignation application",
  "category": "Transfers & Permissions"
 },
 {
  "title": "Teacher lesson plan",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Teacher diary / work-done report",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Examination duty claim",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Invigilation / evaluation remuneration bill",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Training / workshop nomination",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Training completion / joining report",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Tour programme and approval",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Student excursion consent / duty approval",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Stock issue / return form",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Purchase indent / requisition",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Stock verification report",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Condemnation / disposal proposal",
  "category": "School & Teaching Administration"
 },
 {
  "title": "Retirement benefits application",
  "category": "Retirement & Pension"
 },
 {
  "title": "Gratuity nomination / claim",
  "category": "Retirement & Pension"
 },
 {
  "title": "NPS exit / withdrawal request",
  "category": "Retirement & Pension"
 },
 {
  "title": "GIS / group insurance nomination",
  "category": "Retirement & Pension"
 },
 {
  "title": "Group insurance claim",
  "category": "Retirement & Pension"
 },
 {
  "title": "Leave encashment on retirement",
  "category": "Retirement & Pension"
 },
 {
  "title": "Final settlement / no dues",
  "category": "Retirement & Pension"
 },
 {
  "title": "Family pension documentation",
  "category": "Retirement & Pension"
 },
 {
  "title": "Death / dependent benefit claim",
  "category": "Retirement & Pension"
 }
];
export default function OtherForms({onBack}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('All'),[sort,setSort]=useState('az'),[chosen,setChosen]=useState(null),[values,setValues]=useState({});
 const all=[...catalogue.map(x=>({...x,ready:true})),...planned.map(x=>({...x,ready:false}))];
 const categories=['All',...new Set(all.map(x=>x.category))];
 const visible=all.filter(x=>(category==='All'||x.category===category)&&(x.title+' '+x.category).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='za'?b.title.localeCompare(a.title):sort==='ready'?Number(b.ready)-Number(a.ready)||a.title.localeCompare(b.title):a.title.localeCompare(b.title));
 const print=()=>{const title=chosen.title;const fields=chosen.fields.map(([key,label])=>'<tr><th style="text-align:left;padding:10px;border:1px solid #777;width:38%">'+label+'</th><td style="padding:10px;border:1px solid #777">'+String(values[key]||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</td></tr>').join('');const html='<html><head><title>'+title+'</title><style>body{font:14px Arial;margin:30px;color:#111}h2{text-align:center}table{border-collapse:collapse;width:100%}.note{font-size:11px;margin-top:20px}@page{size:A4;margin:15mm}</style></head><body><h2>'+title+'</h2><p>To: The Principal / Competent Authority</p><table>'+fields+'</table><p style="margin-top:35px">Employee signature: _____________________</p><p class="note">General-purpose draft. Verify the prescribed institutional format and approval rules before official use.</p></body></html>';const w=window.open('','_blank');if(!w){alert('Allow pop-ups to print this form.');return}w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),250)};
 return <main className="container" style={{padding:'36px 0 70px',minHeight:'70vh'}}>
 <button className="back-button" onClick={chosen?()=>setChosen(null):onBack}><ArrowLeft size={17}/> {chosen?'All Other Forms':'Dashboard'}</button>
 <BetaNotice section="All Other Forms"/>
 {chosen?<div style={{maxWidth:850,margin:'24px auto'}}><div className="section-kicker">GENERAL-PURPOSE DRAFT</div><h1>{chosen.title}</h1><p>{chosen.description}</p><p style={{padding:14,background:'#fff6dc',borderRadius:12,margin:'16px 0'}}>This is an editable general-purpose draft, not a verified KVS/NVS/NESTS prescribed proforma. Check institutional rules before submission.</p><div className="form-section"><div className="field-grid">{chosen.fields.map(([key,label])=><div className="field" key={key}><label>{label}</label><input value={values[key]||''} onChange={e=>setValues(v=>({...v,[key]:e.target.value}))}/></div>)}</div></div><div style={{display:'flex',gap:12,marginTop:20,flexWrap:'wrap'}}><button className="primary-btn" onClick={print}><Printer size={17}/> Print / Save PDF</button><button className="back-button" onClick={()=>setValues({})}>Clear fields</button></div></div>:
 <><div className="section-kicker" style={{marginTop:20}}>EMPLOYEE DOCUMENT LIBRARY</div><h1 className="beta-section-heading">All Other Forms <span className="beta-status-chip">BETA</span></h1><p>Find employee forms by category or name. All upcoming templates are labelled Coming soon until their official formats are verified.</p>
 <div style={{display:'flex',flexWrap:'wrap',gap:12,margin:'26px 0'}}><label style={{flex:'2 1 230px'}}>Search forms<input style={{display:'block',width:'100%',padding:12,marginTop:6}} placeholder="Search by form name..." value={query} onChange={e=>setQuery(e.target.value)}/></label><label style={{flex:'1 1 180px'}}>Category<select style={{display:'block',width:'100%',padding:12,marginTop:6}} value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label style={{flex:'1 1 150px'}}>Sort by<select style={{display:'block',width:'100%',padding:12,marginTop:6}} value={sort} onChange={e=>setSort(e.target.value)}><option value="az">Name A–Z</option><option value="za">Name Z–A</option><option value="ready">Available first</option></select></label></div>
 <p style={{marginBottom:18}}>{visible.length} forms found · {catalogue.length} beta drafts available</p><div className="form-cards">{visible.map(f=><article className="form-card blue" key={f.title} style={{padding:22,display:'flex',flexDirection:'column',gap:10}}><div className="form-card-top"><div className="card-icon"><FileText size={24}/></div><span style={{fontSize:12,fontWeight:700,color:f.ready?'#137547':'#85640a'}}>{f.ready?'Beta draft':'Coming soon'}</span></div><span className="card-type">{f.category}</span><h3>{f.title}</h3><p>{f.description||'Prescribed format and rules to be verified before release.'}</p>{f.ready?<button className="start-card-button" style={{marginTop:'auto'}} onClick={()=>{setChosen(f);setValues({});window.scrollTo(0,0)}}>Start form →</button>:<span style={{marginTop:'auto',fontSize:12,color:'#777'}}>Coming soon · official format pending</span>}</article>)}</div>{visible.length===0&&<p>No forms match your filters.</p>}</>}
 </main>
}
