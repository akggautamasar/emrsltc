import React, {useEffect, useRef, useState} from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, CalendarDays, Check,
  CheckCheck, CheckCircle2, ChevronDown, ChevronLeft, Download, Eye, EyeOff,
  FileSpreadsheet, FileText, FolderOpen, Hash, Info, KeyRound, LockKeyhole,
  LogOut, MessageCircle, PencilLine, Plus, Printer, RefreshCw, RotateCcw,
  Search, ShieldCheck, Sparkles, Trash2, UploadCloud, Users, Wallet, X, AlertCircle
} from 'lucide-react';
import './salary-review.css';

const salaryApi = async (action, data=null, method=data===null?'GET':'POST') => {
  const options={method,credentials:'same-origin',cache:'no-store'};
  if(method==='POST'){
    options.headers={'Content-Type':'application/json'};
    options.body=JSON.stringify(data ?? {});
  }
  const response=await fetch('/api/salary?action='+encodeURIComponent(action)+(method==='GET'&&data?.id?'&id='+encodeURIComponent(data.id):''),options);
  let payload={};
  try{payload=await response.json();}catch{}
  if(!response.ok)throw Error(payload.error || 'Server returned HTTP '+response.status);
  return payload;
};
const statusName = status => status==='ok'?'Everything is OK':status==='issue'?'Issue reported':status==='published'?'Published':status==='review'?'Under review':'Pending';
const formatStamp = value => value?new Date(value).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const escapeCsv = value=>'"'+String(value??'').replace(/"/g,'""')+'"';
const downloadCSV = (name, rows) => {
  const content='\uFEFF'+rows.map(row=>row.map(escapeCsv).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8;'}));
  const a=document.createElement('a');a.href=url;a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
function excelValue(cell){
  if(cell === null || cell === undefined)return '';
  if(cell instanceof Date)return cell.toLocaleDateString('en-IN');
  if(typeof cell==='object'){
    if(cell.result!==undefined)return excelValue(cell.result);
    if(Array.isArray(cell.richText))return cell.richText.map(x=>x.text).join('');
    if(cell.text!==undefined)return String(cell.text);
    if(cell.hyperlink!==undefined)return String(cell.hyperlink);
    return '';
  }
  if(typeof cell==='number')return Number.isFinite(cell)?String(cell):'';
  return String(cell);
}
async function parseSalaryExcel(file){
  if(file.size>3_000_000)throw Error('Please upload a salary workbook smaller than 3 MB.');
  const ExcelJS=await import('exceljs');
  const workbook=new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet=workbook.worksheets[0];
  if(!sheet||sheet.rowCount<2)throw Error('Sheet 1 is empty or has no employee rows.');
  const columns=Array.from({length:Math.min(sheet.columnCount,100)},(_,i)=>excelValue(sheet.getRow(1).getCell(i+1).value).trim());
  const empCol=columns.findIndex(h=>['empid','employee id','emp id'].includes(h.toLowerCase()));
  const nameCol=columns.findIndex(h=>['employee','employee name','name'].includes(h.toLowerCase()));
  if(empCol<0||nameCol<0)throw Error('Row 1 must contain EmpId (or Employee ID) and Employee (or Name) columns.');
  const validColumns=columns.map((header,i)=>({header,i})).filter(x=>x.header);
  if(new Set(validColumns.map(x=>x.header.toLowerCase())).size!==validColumns.length)
    throw Error('Two salary-sheet columns have the same header. Please rename duplicates before uploading.');
  const getIndex = options => columns.findIndex(h=>options.includes(h.toLowerCase()));
  const deptCol=getIndex(['department']),desigCol=getIndex(['designation']),netCol=getIndex(['net payable','net pay']);
  const records=[];
  for(let n=2;n<=sheet.rowCount;n++){
    const row=sheet.getRow(n);
    const empId=excelValue(row.getCell(empCol+1).value).trim();
    if(!empId)continue;
    const name=excelValue(row.getCell(nameCol+1).value).trim();
    const data={};
    for(const c of validColumns)data[c.header]=excelValue(row.getCell(c.i+1).value);
    records.push({empId,name,
      department:deptCol>=0?excelValue(row.getCell(deptCol+1).value):'',
      designation:desigCol>=0?excelValue(row.getCell(desigCol+1).value):'',
      netPayable:netCol>=0?excelValue(row.getCell(netCol+1).value):'',
      data});
  }
  if(!records.length)throw Error('No non-empty Employee ID records found in sheet 1.');
  if(records.length>1000)throw Error('Maximum 1,000 employees per monthly sheet.');
  if(new Set(records.map(x=>x.empId)).size!==records.length)throw Error('The salary sheet contains repeated Employee IDs.');
  return {filename:file.name,columns:validColumns.map(x=>x.header),records};
}

function SummaryCard({number,label,tone='navy'}){
  return <div className={'sr-summary-card sr-'+tone}><strong>{number}</strong><span>{label}</span></div>;
}
function Feedback({error,success}){
  return <>{error&&<div className="sr-error" role="alert"><AlertCircle size={17}/><span>{error}</span></div>}
    {success&&<div className="sr-success" role="status"><CheckCircle2 size={17}/><span>{success}</span></div>}</>;
}
function EmployeeSlip({payload,onReview,reviewBusy,onExit}){
  const {batch,employee,columns}=payload;
  const [status,setStatus]=useState(employee.review?.status||'');
  const [comment,setComment]=useState(employee.review?.comment||'');
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const locked=batch.status==='published';
  const submit=async event=>{
    event.preventDefault();setError('');setSuccess('');
    try{
      if(!status)throw Error('Choose one of the two review options.');
      if(status==='issue'&&comment.trim().length<4)throw Error('Provide a brief explanation of the discrepancy.');
      await onReview({status,comment});
      setSuccess('Your review response has been recorded. You can update it while this batch remains open.');
    }catch(e){setError(e.message);}
  };
  return <div className="sr-employee-result">
    <div className="sr-review-breadcrumb">
      <button type="button" onClick={onExit}><ArrowLeft size={16}/> Different employee</button>
      <span>Private employee salary view</span>
    </div>
    <div className="sr-slip">
      <div className="sr-slip-head">
        <div><div className="sr-kicker sr-kicker-light">YOUR SALARY DETAILS</div><h2>{employee.name||'Employee'}</h2>
          <p>{employee.designation}{employee.department?' · '+employee.department:''}</p>
          <small>Employee ID: {employee.empId}</small></div>
        <div className="sr-slip-head-right"><strong>{batch.label}</strong><span className={'sr-status '+(locked?'sr-final':'sr-pending')}>{locked?'Final':'Under review'}</span></div>
      </div>
      {employee.adminRemark&&<div className="sr-office-note"><Info size={18}/><div><b>Office remark</b><p>{employee.adminRemark}</p></div></div>}
      <div className="sr-table-wrapper"><table><tbody>{columns.map((header,i)=>{
        const key=header.toLowerCase();const highlighted=/total earn|total deduct|net payable|net pay/.test(key);
        return <tr key={header||i} className={highlighted?'sr-highlight-row':''}>
          <th scope="row">{header}</th><td>{String(employee.data?.[header]??'')}</td></tr>;
      })}</tbody></table></div>
    </div>
    <div className="sr-surface sr-review-form">
      <div className="sr-section-heading"><div><h3>Is your salary correct?</h3>
        <p>{locked?'This batch is published and employee changes are locked.':'Check all salary values carefully before sending your response.'}</p></div>
        {employee.review&&<span className={'sr-status '+(employee.review.status==='ok'?'sr-ok':'sr-issue')}>{statusName(employee.review.status)}</span>}
      </div>
      {!locked&&<form onSubmit={submit}>
        <div className="sr-review-choices">
          <label className={'sr-choice '+(status==='ok'?'selected-ok':'')}><input type="radio" value="ok" checked={status==='ok'} onChange={()=>setStatus('ok')}/><CheckCircle2 size={20}/><span>Everything is OK</span></label>
          <label className={'sr-choice '+(status==='issue'?'selected-issue':'')}><input type="radio" value="issue" checked={status==='issue'} onChange={()=>setStatus('issue')}/><AlertCircle size={20}/><span>Something is wrong</span></label>
        </div>
        <label className="sr-input-label">Comment {status==='issue'?'(required)':'(optional)'}
          <textarea maxLength={800} rows={3} value={comment} onChange={e=>setComment(e.target.value)}
            placeholder="Example: Present days should be 28 instead of 31."/>
        </label>
        <Feedback error={error} success={success}/>
        <button className="sr-primary" type="submit" disabled={reviewBusy}>{reviewBusy?'Saving review…':'Submit salary review'} <ArrowRight size={17}/></button>
      </form>}
      {locked&&<p className="sr-locked-note"><LockKeyhole size={17}/> This salary sheet is marked final. Contact the office directly for any correction.</p>}
      {employee.review&&<div className="sr-last-review"><CheckCircle2 size={16}/>
        Last response: {statusName(employee.review.status)}
        {employee.review.comment?' — '+employee.review.comment:''}
      </div>}
    </div>
    <p className="sr-private-note"><ShieldCheck size={15}/> This salary view is protected by your employee ID and batch-specific review code. Don't share your code or payslip with others.</p>
  </div>;
}
function AdminLogin({onLogin,busy}){
  const [password,setPassword]=useState(''),[reveal,setReveal]=useState(false),[error,setError]=useState('');
  const submit=async e=>{
    e.preventDefault();setError('');
    try{await onLogin(password);setPassword('');}catch(ex){setError(ex.message);}
  };
  return <div className="sr-auth-card sr-surface">
    <div className="sr-auth-icon"><KeyRound size={28}/></div><h2>Administrator sign in</h2>
    <p>Only authorised EMRS office personnel can upload payroll sheets and publish final results.</p>
    <form onSubmit={submit}>
      <label className="sr-input-label">Admin password
        <span className="sr-password-field"><input type={reveal?'text':'password'} value={password}
          onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"
          placeholder="Enter administrator password"/>
          <button type="button" onClick={()=>setReveal(v=>!v)} aria-label={reveal?'Hide password':'Show password'}>{reveal?<EyeOff size={18}/>:<Eye size={18}/>}</button>
        </span></label>
      <Feedback error={error}/>
      <button type="submit" className="sr-primary" disabled={busy}>{busy?'Verifying…':'Sign in securely'} <ArrowRight size={16}/></button>
    </form>
    <span className="sr-auth-help"><LockKeyhole size={14}/> Password is checked securely on the server.</span>
  </div>;
}
function AdminBatch({value,onBack,onRefresh,onPublish,onReopen,onDelete,onRemark,onBulkRemark,onDownloadCodes,onDownloadReview,busy}){
  const {batch,stats,records}=value;
  const [query,setQuery]=useState('');
  const [bulkRemark,setBulkRemark]=useState(''),[overwrite,setOverwrite]=useState(false);
  const [openRemarks,setOpenRemarks]=useState({});
  const [remarks,setRemarks]=useState({});
  const [message,setMessage]=useState('');
  const filtered=records.filter(row=>(row.name+' '+row.empId+' '+row.status).toLowerCase().includes(query.toLowerCase()));
  const saveRemark=async row=>{
    setMessage('');
    await onRemark(batch.id,row.empId,remarks[row.empId]??row.adminRemark??'');
    setMessage('Remark saved for '+row.name+'.');
  };
  const applyAll=async ()=>{
    if(!bulkRemark.trim()&&!window.confirm('Apply an empty bulk remark?'))return;
    await onBulkRemark(batch.id,bulkRemark,overwrite);setMessage('Bulk office remark saved.');
  };
  return <div className="sr-admin-batch">
    <div className="sr-review-breadcrumb"><button type="button" onClick={onBack}><ChevronLeft size={18}/> All batches</button>
      <span>Monthly salary review</span></div>
    <div className="sr-admin-batch-head">
      <div><div className="sr-kicker">MONTHLY SALARY BATCH</div><h2>{batch.label}</h2>
        <p>{batch.filename} · Uploaded {formatStamp(batch.uploadedAt)}</p></div>
      <span className={'sr-status '+(batch.status==='published'?'sr-final':'sr-pending')}>{batch.status==='published'?'Published final':'Review open'}</span>
    </div>
    <div className="sr-summary-grid">
      <SummaryCard number={stats.total} label="Employees"/>
      <SummaryCard number={stats.ok} label="Confirmed OK" tone="green"/>
      <SummaryCard number={stats.issue} label="Reported issues" tone="red"/>
      <SummaryCard number={stats.pending} label="Pending" tone="amber"/>
    </div>
    <div className="sr-batch-toolbar">
      <button onClick={()=>onDownloadCodes(batch.id)} disabled={busy}><KeyRound size={16}/> Download employee review codes</button>
      <button onClick={()=>onDownloadReview(value)} disabled={busy}><Download size={16}/> Export review CSV</button>
      <button onClick={onRefresh} disabled={busy}><RefreshCw size={16}/> Refresh</button>
      {batch.status==='review'
        ?<button className="sr-publish" disabled={busy||stats.pending>0} title={stats.pending?'Wait for all employees to review before finalising':''}
          onClick={()=>window.confirm('Publish final salary? Employee responses will become locked.')&&onPublish(batch.id)}><CheckCheck size={16}/> Publish final</button>
        :<button className="sr-reopen" disabled={busy} onClick={()=>window.confirm('Reopen this published salary batch for review?')&&onReopen(batch.id)}><RotateCcw size={16}/> Reopen review</button>}
    </div>
    {stats.pending>0&&batch.status==='review'&&<p className="sr-hint"><Info size={15}/> Publishing becomes available after all employees respond. {stats.pending} responses still pending.</p>}
    <div className="sr-surface sr-bulk-note"><div className="sr-section-heading"><div><h3>Office remark for employees</h3><p>Optional — explain deductions or salary changes to everyone.</p></div></div>
      <textarea rows={2} value={bulkRemark} onChange={e=>setBulkRemark(e.target.value)} placeholder="Example: Dearness Allowance revised this month."/>
      <div className="sr-bulk-actions"><label><input type="checkbox" checked={overwrite} onChange={e=>setOverwrite(e.target.checked)}/> Overwrite existing individual remarks</label>
        <button onClick={applyAll} disabled={busy}><PencilLine size={15}/> Apply to all employees</button></div>
    </div>
    {message&&<div className="sr-success"><Check size={15}/>{message}</div>}
    <div className="sr-surface sr-admin-records">
      <div className="sr-section-heading"><div><h3>Employee responses</h3><p>Find an employee, inspect issues and add an optional note.</p></div></div>
      <div className="sr-input-with-icon"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search employee, ID or status" aria-label="Search employees"/></div>
      <div className="sr-record-list">{filtered.map(row=><div className="sr-record" key={row.empId}>
        <div className="sr-record-head"><div><strong>{row.name}</strong><small>{row.empId} · {row.designation} · Net {row.netPayable}</small></div>
          <span className={'sr-status '+(row.status==='ok'?'sr-ok':row.status==='issue'?'sr-issue':'sr-pending')}>{statusName(row.status)}</span></div>
        {row.comment&&<p className="sr-record-issue"><AlertCircle size={14}/> Employee: {row.comment}</p>}
        {row.adminRemark&&<p className="sr-record-remark"><Info size={14}/> Office: {row.adminRemark}</p>}
        <button className="sr-edit-remark" type="button" onClick={()=>setOpenRemarks(m=>({...m,[row.empId]:!m[row.empId]}))}>
          <PencilLine size={14}/> {openRemarks[row.empId]?'Close remark editor':'Edit office remark'}
        </button>
        {openRemarks[row.empId]&&<div className="sr-remark-editor">
          <input maxLength={1000} value={remarks[row.empId]??row.adminRemark??''} onChange={e=>setRemarks(m=>({...m,[row.empId]:e.target.value}))}
            aria-label={'Office remark for '+row.name}/>
          <button onClick={()=>saveRemark(row)} disabled={busy}>Save</button>
        </div>}
      </div>)}
      {!filtered.length&&<p className="sr-empty-small">No employees match your search.</p>}</div>
    </div>
    <div className="sr-danger-area"><button disabled={busy} onClick={()=>window.confirm('Permanently delete this batch, all salary records and review events? This cannot be undone.')&&onDelete(batch.id)}>
      <Trash2 size={15}/> Permanently delete batch</button></div>
  </div>;
}
export default function SalaryReview({onBack}){
  const [tab,setTab]=useState('employee'),[admin,setAdmin]=useState(false);
  const [mode,setMode]=useState('checking'),[batches,setBatches]=useState([]),[current,setCurrent]=useState(null);
  const [employee,setEmployee]=useState(null),[empId,setEmpId]=useState(''),[reviewCode,setReviewCode]=useState('');
  const [file,setFile]=useState(null),[label,setLabel]=useState(''),[preview,setPreview]=useState(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const uploadFile=useRef(null);
  const run=async function(fn,{quiet=false}={}){
    if(!quiet){setBusy(true);setError('');setSuccess('');}
    try{return await fn();}catch(e){setError(e.message);throw e;}finally{if(!quiet)setBusy(false);}
  };
  const refreshAdmin=async()=>{const response=await salaryApi('admin_batches');setBatches(response.batches||[]);};
  const refreshCurrent=async id=>{
    const response=await salaryApi('admin_batch',{id},'GET');setCurrent(response);
  };
  const refreshEmployee=async()=>{
    const response=await salaryApi('employee_me');setEmployee(response);
  };
  useEffect(()=>{
    let active=true;
    (async()=>{
      try{
        const response=await salaryApi('admin_session');if(!active)return;
        setAdmin(response.authenticated);
        if(response.authenticated){await refreshAdmin();if(active)setMode('ready');}
        else setMode('ready');
      }catch(err){if(active){setMode('ready');setError(err.message);}}
      try{const view=await salaryApi('employee_me');if(active)setEmployee(view);}catch{}
    })();
    return()=>{active=false;};
  },[]);
  const loginAdmin=async password=>{
    await run(async()=>{
      await salaryApi('admin_login',{password});
      setAdmin(true);setSuccess('Administrator signed in.');
      await refreshAdmin();
    });
  };
  const logoutAdmin=()=>run(async()=>{
    await salaryApi('admin_logout',{});setAdmin(false);setCurrent(null);
  });
  const employeeLogin=e=>{
    e.preventDefault();
    run(async()=>{
      await salaryApi('employee_login',{empId,code:reviewCode});
      await refreshEmployee();
      setReviewCode('');
    }).catch(()=>{});
  };
  const logoutEmployee=()=>run(async()=>{
    await salaryApi('employee_logout',{});setEmployee(null);setEmpId('');
  }).catch(()=>{});
  const review=async values=>{
    await run(async()=>{
      await salaryApi('employee_review',values);
      await refreshEmployee();
    });
  };
  const chooseFile=async selected=>{
    if(!selected)return;
    setError('');setPreview(null);setFile(selected);setBusy(true);
    try{setPreview(await parseSalaryExcel(selected));}
    catch(err){setError(err.message);setFile(null);}
    finally{setBusy(false);}
  };
  const upload=e=>{
    e.preventDefault();if(!preview)return;
    run(async()=>{
      const response=await salaryApi('admin_upload',{...preview,label});
      setPreview(null);setFile(null);setLabel('');
      if(uploadFile.current)uploadFile.current.value='';
      await refreshAdmin();await refreshCurrent(response.batch.id);
      setSuccess('Monthly salary sheet uploaded for review. Download and distribute individual review codes.');
    }).catch(()=>{});
  };
  const openBatch=id=>run(()=>refreshCurrent(id)).catch(()=>{});
  const mutate=async(action,body,nextMessage,exit=false)=>{
    await run(async()=>{
      await salaryApi(action,body);
      if(exit){setCurrent(null);await refreshAdmin();}
      else if(current)await refreshCurrent(current.batch.id);
      setSuccess(nextMessage);
    });
  };
  const downloadCodes=async batchId=>{
    await run(async()=>{
      const data=await salaryApi('admin_codes',{id:batchId},'GET');
      downloadCSV('EMRS_salary_review_codes_'+data.label.replace(/[^a-z0-9-]/gi,'_')+'.csv',[
        ['Employee ID','Employee Name','Individual Review Code'],
        ...data.codes.map(x=>[x.empId,x.name,x.code])
      ]);
      setSuccess('Review codes CSV downloaded. Share each individual code privately with its employee.');
    });
  };
  const downloadReview=data=>{
    downloadCSV('EMRS_salary_review_'+data.batch.label.replace(/[^a-z0-9-]/gi,'_')+'.csv',[
      ['Employee ID','Employee','Department','Designation','Net Payable','Review Status','Employee Comment','Office Remark'],
      ...data.records.map(r=>[r.empId,r.name,r.department,r.designation,r.netPayable,r.status,r.comment,r.adminRemark])
    ]);
  };
  return <main className="sr-page"><div className="container sr-container">
    <div className="sr-toprow"><button className="back-button" type="button" onClick={onBack}><ArrowLeft size={16}/> Dashboard</button>
      <span><ShieldCheck size={16}/> EMRS salary verification</span></div>
    <section className="sr-hero"><div className="sr-hero-glow" aria-hidden="true"><Wallet size={80}/></div>
      <div className="sr-kicker sr-kicker-light">EMRS EMPLOYEE SERVICES</div><h1>Salary Review <span>Before Publishing</span></h1>
      <p>A clear review process before the final monthly salary is published. Employees can verify their details, report discrepancies and receive office remarks.</p>
      <div className="sr-hero-points"><span><CheckCircle2 size={15}/> Employee confirmation</span><span><ShieldCheck size={15}/> Private salary records</span><span><CalendarDays size={15}/> Monthly review batches</span></div>
    </section>
    <div className="sr-tabs" role="tablist" aria-label="Salary review access">
      <button role="tab" aria-selected={tab==='employee'} className={tab==='employee'?'active':''} onClick={()=>{setTab('employee');setError('');setSuccess('')}}><Users size={18}/> Employee review</button>
      <button role="tab" aria-selected={tab==='admin'} className={tab==='admin'?'active':''} onClick={()=>{setTab('admin');setError('');setSuccess('')}}><LockKeyhole size={18}/> Admin office</button>
    </div>
    <Feedback error={error} success={success}/>
    {mode==='checking'&&<div className="sr-loading"><RefreshCw size={19}/> Checking service…</div>}
    {mode==='ready'&&tab==='employee'&&(
      employee
        ?<EmployeeSlip key={employee.batch.id+employee.employee.empId} payload={employee}
          onReview={review} reviewBusy={busy} onExit={logoutEmployee}/>
        :<div className="sr-auth-card sr-surface">
          <div className="sr-auth-icon"><Wallet size={28}/></div><h2>Check your salary</h2>
          <p>Enter your Employee ID and the personal review code shared privately by the EMRS office. Your salary is not publicly searchable.</p>
          <form onSubmit={employeeLogin}>
            <label className="sr-input-label">Employee ID
              <input value={empId} onChange={e=>setEmpId(e.target.value)} required autoComplete="off"
                maxLength={60} placeholder="Enter your Employee ID"/>
            </label>
            <label className="sr-input-label">Individual review code
              <input value={reviewCode} onChange={e=>setReviewCode(e.target.value.toUpperCase())} required
                autoComplete="off" maxLength={16} placeholder="Review code from the office"/>
            </label>
            <button disabled={busy} className="sr-primary" type="submit">{busy?'Checking…':'View my salary'} <ArrowRight size={16}/></button>
          </form>
          <p className="sr-auth-help"><LockKeyhole size={15}/> Request your code from your office if you haven't received one.</p>
        </div>
    )}
    {mode==='ready'&&tab==='admin'&&(
      !admin?<AdminLogin onLogin={loginAdmin} busy={busy}/>
      :current?<AdminBatch key={current.batch.id} value={current} busy={busy}
        onBack={()=>{setCurrent(null);refreshAdmin().catch(e=>setError(e.message));}}
        onRefresh={()=>run(()=>refreshCurrent(current.batch.id)).catch(()=>{})}
        onPublish={id=>mutate('admin_publish',{batchId:id},'Batch published final.').catch(()=>{})}
        onReopen={id=>mutate('admin_reopen',{batchId:id},'Batch reopened for employee review.').catch(()=>{})}
        onDelete={id=>mutate('admin_delete',{batchId:id},'Salary batch permanently deleted.',true).catch(()=>{})}
        onRemark={(id,empId,remark)=>mutate('admin_remark',{batchId:id,empId,remark},'Office remark saved.')}
        onBulkRemark={(id,remark,overwrite)=>mutate('admin_bulk_remark',{batchId:id,remark,overwrite},'Office remark applied.')}
        onDownloadCodes={downloadCodes} onDownloadReview={downloadReview}/>
      :<div className="sr-admin-home">
        <div className="sr-admin-head"><div><div className="sr-kicker">OFFICE DASHBOARD</div><h2>Salary review administration</h2><p>Upload and open a monthly batch, manage employee responses and publish the final salary.</p></div>
          <button onClick={()=>logoutAdmin().catch(()=>{})} className="sr-logout"><LogOut size={16}/> Sign out</button></div>
        <div className="sr-surface sr-upload-card"><div className="sr-section-heading"><div><h3><UploadCloud size={19}/> Upload monthly Excel sheet</h3><p>Headers must include EmpId and Employee. Other salary columns are read automatically.</p></div></div>
          <form onSubmit={upload}>
            <label className="sr-input-label">Salary period
              <input value={label} onChange={e=>setLabel(e.target.value)} required minLength={3}
                placeholder="Example: October 2026" maxLength={100}/>
            </label>
            <label className="sr-input-label">Salary workbook (.xlsx)
              <input type="file" ref={uploadFile} accept=".xlsx" required onChange={e=>chooseFile(e.target.files?.[0])}/>
            </label>
            {preview&&<div className="sr-upload-preview"><CheckCircle2 size={17}/>{preview.records.length} employees · {preview.columns.length} columns · {preview.filename}</div>}
            <button type="submit" disabled={busy||!preview} className="sr-primary">{busy?'Preparing…':'Upload & open employee review'} <ArrowRight size={16}/></button>
          </form>
          <p className="sr-hint"><ShieldCheck size={15}/> Private storage. Employees need the individual code CSV generated after upload. Never send the full codes list to a public group.</p>
        </div>
        <div className="sr-section-heading sr-batches-heading"><div><h3>Salary batches</h3><p>Review earlier uploads and track whether employees have confirmed.</p></div>
          <button className="sr-refresh-mini" onClick={()=>run(refreshAdmin).catch(()=>{})}><RefreshCw size={15}/> Refresh</button></div>
        <div className="sr-batch-list">{batches.map(batch=><button className="sr-batch-list-item" key={batch.id}
          onClick={()=>openBatch(batch.id)}>
          <span className="sr-batch-list-icon"><FileSpreadsheet size={21}/></span>
          <span className="sr-batch-list-title"><b>{batch.label}</b><small>{batch.count} employees · Uploaded {formatStamp(batch.uploadedAt)}</small></span>
          <span className={'sr-status '+(batch.status==='published'?'sr-final':'sr-pending')}>{batch.status==='published'?'Final':'Under review'}</span>
          <ArrowRight size={18}/>
        </button>)}
        {!batches.length&&<div className="sr-empty-small">No monthly salary batches uploaded yet. Use the Excel upload form above to begin.</div>}</div>
      </div>
    )}
    <div className="sr-source-note"><BookOpen size={17}/>
      <p>Adapted from the <b>EMRS Salary Review Portal</b>: Excel uploads, one-employee salary view, OK/issue reports, office remarks, publishing, reopening and CSV exports. EMRS branding is institution-neutral. Review codes add confidentiality beyond the original Employee-ID-only lookup.</p>
    </div>
  </div></main>;
}
