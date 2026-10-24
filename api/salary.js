/**
 * EMRS Salary Review — faithful Vercel adaptation of the FastAPI workflow in
 * akggautamasar/emrskaranjiya. Salary data never goes into the public bundle.
 * Private Vercel Blob holds monthly batches and immutable employee/admin events.
 *
 * Security upgrades from the source app:
 * - Admin password and HMAC key are server environment variables (not VITE_*)
 * - HttpOnly signed, expiring admin and employee sessions
 * - Employees must present their ID and a batch-specific review code
 * - Every mutating request enforces same-origin; no sensitive response is cached
 * - Event uploads are immutable to avoid concurrent-review lost updates
 */
import { get, put, list, del } from '@vercel/blob';
import { createHmac, createHash, randomUUID, timingSafeEqual } from 'node:crypto';

const PREFIX='emrs-salary/v1';
const ADMIN_COOKIE='emrs_salary_admin';
const EMP_COOKIE='emrs_salary_employee';
const HOUR=3600000, SESSION_HOURS=8;
const MAX_BATCHES=200, MAX_RECORDS=1000, MAX_EVENTS=5000;
const failedLogins=new Map();

const present = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.SALARY_SESSION_SECRET && process.env.SALARY_ADMIN_PASSWORD);
function respond(res,status,payload){
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  return res.status(status).json(payload);
}
function getCookies(req){
  return Object.fromEntries(String(req.headers.cookie||'').split(';').map(part=>{
    const i=part.indexOf('=');return i<0?['','']:[part.slice(0,i).trim(),part.slice(i+1).trim()];
  }));
}
function sign(input){return createHmac('sha256',process.env.SALARY_SESSION_SECRET).update(input).digest('base64url');}
function token(payload){
  const part=Buffer.from(JSON.stringify({...payload,exp:Date.now()+SESSION_HOURS*HOUR})).toString('base64url');
  return part+'.'+sign(part);
}
function verify(cookie,role){
  if(!cookie || !cookie.includes('.'))return null;
  const [payload,mac,...extra]=cookie.split('.');
  if(extra.length || !payload || !mac || mac.length!==43)return null;
  const expected=sign(payload);
  if(mac.length!==expected.length || !timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return null;
  try {
    const info=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
    return info.role===role && Number(info.exp)>Date.now() ? info : null;
  }catch{return null;}
}
function samePassword(input){
  const a=createHash('sha256').update(String(input||'')).digest();
  const b=createHash('sha256').update(String(process.env.SALARY_ADMIN_PASSWORD||'')).digest();
  return timingSafeEqual(a,b);
}
function cookie(req,name,value,age){
  const ssl=String(req.headers['x-forwarded-proto']||'https').includes('https');
  return name+'='+value+'; Path=/api/salary; HttpOnly; SameSite=Strict; Max-Age='+age+(ssl?'; Secure':'');
}
function sameOrigin(req){
  const origin=req.headers.origin;
  if(!origin)return true; // non-browser agents must still authenticate separately
  try{
    const expected=(req.headers['x-forwarded-proto']||'https')+'://'+req.headers.host;
    return new URL(origin).origin===expected;
  }catch{return false;}
}
const safeId = str => typeof str==='string' && /^[a-z0-9-]{36}$/.test(str);
const hashId = id => createHash('sha256').update(String(id)).digest('hex').slice(0,26);
const employeeCode=(batch,id)=>createHmac('sha256',process.env.SALARY_SESSION_SECRET)
  .update('employee-code:'+batch+':'+id).digest('hex').slice(0,12).toUpperCase();
const metaPath=id=>PREFIX+'/meta/'+id+'.json';
const recordsPath=id=>PREFIX+'/records/'+id+'.json';
const controlPrefix=id=>PREFIX+'/events/'+id+'/control/';
const employeePrefix=(id,empId)=>PREFIX+'/events/'+id+'/employee/'+hashId(empId)+'/';

async function listAll(prefix,max=MAX_EVENTS){
  let cursor,items=[];
  do{
    const p=await list({prefix,limit:Math.min(1000,max-items.length),cursor});
    items.push(...p.blobs);
    if(items.length>=max && p.hasMore)throw new Error('Storage event limit reached; contact an administrator.');
    cursor=p.hasMore?p.cursor:undefined;
  }while(cursor);
  return items;
}
async function readJSON(path){
  let result;
  try{result=await get(path,{access:'private'});}
  catch(error){if(error?.name==='BlobNotFoundError' || error?.status===404)return null;throw error;}
  if(!result||result.statusCode!==200)return null;
  return await new Response(result.stream).json();
}
async function storeJSON(path,obj){
  await put(path,JSON.stringify(obj),{access:'private',contentType:'application/json',cacheControlMaxAge:60});
}
async function getMetas(){
  const metaPaths=(await listAll(PREFIX+'/meta/',MAX_BATCHES)).map(x=>x.pathname).filter(x=>x.endsWith('.json'));
  const data=await Promise.all(metaPaths.map(x=>readJSON(x)));
  return data.filter(x=>x && safeId(x.id)).sort((a,b)=>b.uploadedAt.localeCompare(a.uploadedAt));
}
async function getBatch(id){
  if(!safeId(id))return null;
  const [meta,records]=await Promise.all([readJSON(metaPath(id)),readJSON(recordsPath(id))]);
  return meta&&Array.isArray(records)?{meta,records}:null;
}
async function loadEvents(id,empId=null){
  const [employeeFiles,controlFiles]=empId
    ?await Promise.all([listAll(employeePrefix(id,empId)),listAll(controlPrefix(id))])
    :[await listAll(PREFIX+'/events/'+id+'/'),[]];
  const paths=[...employeeFiles,...controlFiles].map(x=>x.pathname).filter(x=>x.endsWith('.json'));
  // Avoid unbounded concurrent connection spikes when checking many reviews.
  const events=[];
  for(let i=0;i<paths.length;i+=30){
    const block=await Promise.all(paths.slice(i,i+30).map(readJSON));
    events.push(...block.filter(Boolean));
  }
  return events.sort((a,b)=>String(a.at).localeCompare(String(b.at))||
    String(a.eventId).localeCompare(String(b.eventId)));
}
function calculate(records,events){
  let status='review',publishedAt=null;
  const reviews=Object.create(null),remarks=Object.create(null);
  for(const e of events){
    if(e.type==='published'){status='published';publishedAt=e.at;}
    else if(e.type==='reopened'){status='review';publishedAt=null;}
    else if(e.type==='review' && status==='review') reviews[e.empId]={status:e.status,comment:e.comment||'',at:e.at};
    else if(e.type==='remark') remarks[e.empId]=e.remark||'';
    else if(e.type==='bulk_remark'){
      for(const record of records)if(e.overwrite||!String(remarks[record.empId]||'').trim())remarks[record.empId]=e.remark||'';
    }
  }
  let ok=0,issue=0,pending=0;
  for(const row of records){
    const st=reviews[row.empId]?.status;
    if(st==='ok')ok++;else if(st==='issue')issue++;else pending++;
  }
  return {status,publishedAt,reviews,remarks,stats:{total:records.length,ok,issue,pending}};
}
async function appendEvent(id,empId,type,fields={}){
  const stamp=new Date().toISOString();
  const eventId=randomUUID();
  const path=(empId?employeePrefix(id,empId):controlPrefix(id))+
    stamp.replace(/[:-]/g,'')+'-'+eventId+'.json';
  await storeJSON(path,{type,eventId,empId:empId||null,at:stamp,...fields});
}
const validateString=(v,max=150)=>typeof v==='string'?v.trim().slice(0,max):'';
function limitedJSON(rows){
  if(!Array.isArray(rows)||rows.length<1||rows.length>MAX_RECORDS)return false;
  return rows.every(row=>row&&typeof row.empId==='string'&&row.empId.length<=60&&row.name?.length<=180
     && row.data && typeof row.data==='object'&&!Array.isArray(row.data));
}
const hasAdmin=req=>verify(getCookies(req)[ADMIN_COOKIE],'admin');
const hasEmployee=req=>verify(getCookies(req)[EMP_COOKIE],'employee');
const isAdminAction=action=>action.startsWith('admin_');
const delayFailedLogin=req=>{
  const key=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
  const existing=failedLogins.get(key)||{count:0,until:0};
  if(Date.now()>existing.until){existing.count=0;existing.until=Date.now()+5*60000;}
  return {key,existing};
};

export default async function handler(req,res){
  const action=String(req.query.action||'').trim();
  if(!present()) return respond(res,503,{error:'Salary Review storage or server credentials have not been configured.'});
  if(req.method==='POST'&&!sameOrigin(req))return respond(res,403,{error:'Request origin not allowed.'});
  try{
    if(action==='health'&&req.method==='GET'){
      return respond(res,200,{ready:true,storage:'private',brand:'EMRS'});
    }
    if(action==='admin_login' && req.method==='POST'){
      const {key,existing}=delayFailedLogin(req);
      if(existing.count>=8)return respond(res,429,{error:'Too many login attempts. Try again later.'});
      if(!samePassword(req.body?.password)){
        existing.count++;failedLogins.set(key,existing);
        return respond(res,401,{error:'Incorrect administrator password.'});
      }
      failedLogins.delete(key);
      res.setHeader('Set-Cookie',cookie(req,ADMIN_COOKIE,token({role:'admin'}),SESSION_HOURS*3600));
      return respond(res,200,{authenticated:true});
    }
    if(action==='admin_logout'&&req.method==='POST'){
      res.setHeader('Set-Cookie',cookie(req,ADMIN_COOKIE,'',0));
      return respond(res,200,{authenticated:false});
    }
    if(action==='employee_logout'&&req.method==='POST'){
      res.setHeader('Set-Cookie',cookie(req,EMP_COOKIE,'',0));
      return respond(res,200,{authenticated:false});
    }
    if(action==='admin_session'&&req.method==='GET')return respond(res,200,{authenticated:!!hasAdmin(req)});
    if(action==='employee_login' && req.method==='POST'){
      const empId=validateString(req.body?.empId,60);
      const code=validateString(req.body?.code,24).toUpperCase();
      if(!empId||!code)return respond(res,400,{error:'Enter your Employee ID and personal review code.'});
      const metas=await getMetas();
      for(const meta of metas){
        const batch=await getBatch(meta.id);
        if(!batch)continue;
        const row=batch.records.find(x=>x.empId===empId);
        if(!row)continue;
        const expected=employeeCode(meta.id,empId);
        if(code.length===expected.length && timingSafeEqual(Buffer.from(code),Buffer.from(expected))){
          res.setHeader('Set-Cookie',cookie(req,EMP_COOKIE,token({role:'employee',batchId:meta.id,empId}),SESSION_HOURS*3600));
          return respond(res,200,{authenticated:true});
        }
      }
      return respond(res,401,{error:'Employee ID or review code not recognised. Ask the office for your personal code.'});
    }
    if(action==='employee_me'&&req.method==='GET'){
      const auth=hasEmployee(req);
      if(!auth || !safeId(auth.batchId))return respond(res,401,{error:'Enter your Employee ID and review code to continue.'});
      const batch=await getBatch(auth.batchId);
      if(!batch)return respond(res,404,{error:'Salary batch no longer exists.'});
      const row=batch.records.find(x=>x.empId===auth.empId);
      if(!row)return respond(res,404,{error:'Employee record unavailable.'});
      const state=calculate([row],await loadEvents(auth.batchId,auth.empId));
      return respond(res,200,{batch:{id:batch.meta.id,label:batch.meta.label,status:state.status,
        publishedAt:state.publishedAt},employee:{...row,review:state.reviews[row.empId]||null,
        adminRemark:state.remarks[row.empId]||''},columns:batch.meta.columns});
    }
    if(action==='employee_review'&&req.method==='POST'){
      const auth=hasEmployee(req);
      if(!auth)return respond(res,401,{error:'Please sign in with your review code again.'});
      const batch=await getBatch(auth.batchId);
      if(!batch||!batch.records.some(x=>x.empId===auth.empId))return respond(res,404,{error:'Employee record not found.'});
      const status=req.body?.status, comment=validateString(req.body?.comment,800);
      if(!['ok','issue'].includes(status))return respond(res,400,{error:'Select Everything is OK or Something is wrong.'});
      if(status==='issue'&&comment.length<4)return respond(res,400,{error:'Describe the discrepancy before submitting an issue.'});
      const state=calculate(batch.records,await loadEvents(auth.batchId,auth.empId));
      if(state.status!=='review')return respond(res,409,{error:'This salary batch has been published and is locked.'});
      await appendEvent(auth.batchId,auth.empId,'review',{status,comment});
      return respond(res,200,{saved:true,status,comment});
    }
    if(isAdminAction(action)&&!hasAdmin(req))return respond(res,401,{error:'Administrator sign-in required.'});
    if(action==='admin_batches'&&req.method==='GET'){
      const metas=await getMetas();
      const rows=[];
      for(const meta of metas){
        const controls=await loadEvents(meta.id,'__control_only__');
        // Only the control events can publish/reopen a batch.
        const last=[...controls].reverse().find(e=>['published','reopened'].includes(e.type));
        rows.push({...meta,status:last?.type==='published'?'published':'review'});
      }
      return respond(res,200,{batches:rows});
    }
    if(action==='admin_batch'&&req.method==='GET'){
      const batch=await getBatch(String(req.query.id||''));
      if(!batch)return respond(res,404,{error:'Batch not found.'});
      const state=calculate(batch.records,await loadEvents(batch.meta.id));
      const rows=batch.records.map(({data,...record})=>({...record,status:state.reviews[record.empId]?.status||'pending',
        comment:state.reviews[record.empId]?.comment||'',adminRemark:state.remarks[record.empId]||''}));
      return respond(res,200,{batch:{...batch.meta,status:state.status,publishedAt:state.publishedAt},
        stats:state.stats,records:rows});
    }
    if(action==='admin_codes'&&req.method==='GET'){
      const batch=await getBatch(String(req.query.id||''));
      if(!batch)return respond(res,404,{error:'Batch not found.'});
      return respond(res,200,{label:batch.meta.label,codes:batch.records.map(r=>({
        empId:r.empId,name:r.name,code:employeeCode(batch.meta.id,r.empId)}))});
    }
    if(action==='admin_upload'&&req.method==='POST'){
      const label=validateString(req.body?.label,100);
      const filename=validateString(req.body?.filename,180);
      const columns=req.body?.columns;
      const rows=req.body?.records;
      if(label.length<3||!Array.isArray(columns)||columns.length<2||columns.length>100 ||
        !columns.every(x=>typeof x==='string'&&x.length<=100) || !limitedJSON(rows)){
        return respond(res,400,{error:'Invalid batch. Upload an Excel sheet with Employee ID, Employee name and employee rows.'});
      }
      const allIds=new Set();
      const records=[];
      for(const row of rows){
        const empId=validateString(row.empId,60);
        if(!empId||allIds.has(empId))return respond(res,400,{error:'Duplicate or missing Employee ID found: '+empId});
        allIds.add(empId);
        const data=Object.fromEntries(columns.map(header=>[header,String(row.data?.[header]??'').slice(0,400)]));
        records.push({empId,name:validateString(row.name,180),
          designation:validateString(row.designation,160),
          department:validateString(row.department,160),
          netPayable:validateString(String(row.netPayable??''),90),data});
      }
      if(Buffer.byteLength(JSON.stringify(records))>2_500_000)return respond(res,413,{error:'The payroll sheet is too large. Split it into separate monthly batches.'});
      const id=randomUUID(), now=new Date().toISOString();
      const meta={id,label,filename,count:records.length,columns,uploadedAt:now};
      await storeJSON(recordsPath(id),records);
      await storeJSON(metaPath(id),meta);
      return respond(res,201,{batch:meta});
    }
    if(['admin_publish','admin_reopen','admin_remark','admin_bulk_remark','admin_delete'].includes(action)&&req.method==='POST'){
      const id=String(req.body?.batchId||'');
      const batch=await getBatch(id);
      if(!batch)return respond(res,404,{error:'Batch not found.'});
      const state=calculate(batch.records,await loadEvents(id));
      if(action==='admin_publish'){
        if(state.status==='published')return respond(res,200,{status:'published'});
        if(state.stats.pending>0)return respond(res,409,{error:state.stats.pending+' employees have not submitted a review. Resolve pending responses before publishing.'});
        await appendEvent(id,null,'published');
        return respond(res,200,{status:'published'});
      }
      if(action==='admin_reopen'){
        if(state.status==='review')return respond(res,200,{status:'review'});
        await appendEvent(id,null,'reopened');
        return respond(res,200,{status:'review'});
      }
      if(action==='admin_remark'){
        const empId=validateString(req.body?.empId,60);
        if(!batch.records.some(x=>x.empId===empId))return respond(res,404,{error:'Employee not in this batch.'});
        await appendEvent(id,empId,'remark',{remark:validateString(req.body?.remark,1000)});
        return respond(res,200,{saved:true});
      }
      if(action==='admin_bulk_remark'){
        await appendEvent(id,null,'bulk_remark',{remark:validateString(req.body?.remark,1000),
          overwrite:Boolean(req.body?.overwrite)});
        return respond(res,200,{saved:true});
      }
      if(action==='admin_delete'){
        const all=await listAll(PREFIX+'/events/'+id+'/');
        await del([...all.map(x=>x.pathname),metaPath(id),recordsPath(id)]);
        return respond(res,200,{deleted:true});
      }
    }
    return respond(res,404,{error:'Unknown Salary Review request.'});
  }catch(error){
    console.error('Salary Review backend:',error?.name,error?.message);
    return respond(res,500,{error:'Salary Review could not complete this operation. Please retry or contact the administrator.'});
  }
}
