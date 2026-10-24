
/* CEA / Hostel Subsidy — Annexure-B, physical PDF pages 8 and 9 ONLY.
   Strict 2-page A4 portrait layout across browser PDF, DOCX and XLSX exports.
   Page 10 school certificate intentionally excluded from claimant form. */
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import {jsPDF} from 'jspdf';
import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,WidthType,PageOrientation,BorderStyle,HeightRule} from 'docx';
import {dateText} from './schema.js';

const T=v=>v==null?'':String(v);
const tidy=v=>T(v).trim();
const display=v=>tidy(v)||'________________';
const money=v=>tidy(v)===''?'':Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});
const date=v=>dateText(v);
const firstYear=d=>tidy(d.financialYear)||'___________';
const childHeaders=['Sl No','Sequence','Name','Date of Birth','Age'];
const childRows=(d,claim=false)=>Array.from({length:claim?2:3},(_,i)=>{const v=(claim?d.claimedChildren:d.children)?.[i]||{};return [claim?i+1:i+1,claim?T(v.sequence):T(v.sequence||['1st Child','2nd Child','3rd Child'][i]),T(v.name),date(v.dob),T(v.age)]});
const studyRow=(d,i)=>{const st=d.studies?.[i]||{};return [
 'Academic year: '+display(st.academicYear),'Name of School / Residential School: '+display(st.school),'Class: '+display(st.classStudied)
]};
const declarations=d=>[
 '15. (i) Certified that the fee / amount indicated above has actually been paid by me.',
 '      (ii) Certified that my wife/husband '+(tidy(d.spouseCentralStatus)||'is / is not')+' a Central Government Servant.',
 '      (iii) Certified that my husband/wife Sri/Smt. '+display(d.spouseName)+' is presently working as '+display(d.spouseEmployerType)+' in '+display(d.spouseEmployerName)+' and that he/she '+(tidy(d.spouseClaimStatus)||'shall not apply / has not applied')+' for the Children Education Allowance for the child mentioned above.',
 '      (iv) Certified that I or my wife/husband has not claimed this re-imbursement from any other source and will not claim the same in future.',
 'The informations furnished above are complete and correct and I have not suppressed any relevant information. In the event of any change in the particulars given above affecting my eligibility for reimbursement of Children Education Allowance, I undertake to intimate the same promptly and also to refund excess payments, if any, made. Further, I am aware that, if at any stage, the information / documents furnished above are found to be false, I am liable for disciplinary action.'
];
const sig=d=>[
 ['Place',T(d.place)],['Date',date(d.date)],['Signature','____________________'],
 ['Name',T(d.name)],['Designation',T(d.designation)],['Employee I.D. No.',T(d.employeeId)],
 ['GPF / PRAN NO.',T(d.gpfPran)],['S.B.A/C NO.',T(d.sbaAccount)]
];
function validate(d){
 if(!d||typeof d!=='object')throw Error('CEA form entries are missing.');
 const arr=[...Object.values(d).filter(v=>typeof v==='string'),...(d.children||[]).flatMap(Object.values),...(d.claimedChildren||[]).flatMap(Object.values),...(d.studies||[]).flatMap(Object.values)];
 if(arr.some(v=>T(v).length>225))throw Error('A CEA entry is longer than the two-page Annexure-B template supports; shorten it before exporting.');
 if((d.children||[]).length>3||(d.claimedChildren||[]).length>2||(d.studies||[]).length>2)throw Error('Annexure-B has three all-child rows and two claimed-child columns. Reduce entries to fit the prescribed two pages.');
}
const filename=(d,ext)=>'CEA_Hostel_Subsidy_'+(T(d.name).replace(/[^a-z0-9 ]/gi,'').trim().replace(/\s+/g,'_')||'Claim')+'.'+ext;
const save=(blob,name)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)};

// PDF: precise absolute layout, vector text, fixed page boundary.
function makePdf(d){
 const pdf=new jsPDF({format:'a4',orientation:'portrait',unit:'mm',compress:true});
 const W=210,L=16,R=194,SW=R-L;
 pdf.setDrawColor(35);pdf.setTextColor(0);pdf.setLineWidth(.2);
 const put=(text,x,y,w,pt=9.1,bold=false,max=4)=>{
  pdf.setFont('times',bold?'bold':'normal');let p=pt;
  let lines=pdf.splitTextToSize(T(text),w);
  while(lines.length>max&&p>6){p-=.3;pdf.setFontSize(p);lines=pdf.splitTextToSize(T(text),w)}
  pdf.setFontSize(p);if(lines.length>max){lines=lines.slice(0,max);if(lines.length)lines[max-1]=lines[max-1].replace(/.$/,'…')}
  pdf.text(lines,x,y,{lineHeightFactor:1.13});return Math.max(1,lines.length)*p*.39;
 };
 const center=(txt,y,pt=10,bold=false)=>{pdf.setFont('times',bold?'bold':'normal');pdf.setFontSize(pt);pdf.text(T(txt),W/2,y,{align:'center'})};
 const line=(txt,y,pt=9,bold=false)=>put(txt,L,y,SW,pt,bold,4);
 const row=(no,label,value,y)=>{
  put(no,L,y,8,9,false,1);const h=put(label,L+10,y,83,8.6,false,3);
  put(':',L+97,y,5,9,false,1);const hv=put(value,L+105,y,72,8.6,false,3);
  return y+Math.max(h,hv,4.5)+3.1;
 };
 const table=(headers,rows,x,y,widths,rowHt=7.2)=>{
  let px=x;for(let i=0;i<headers.length;i++){pdf.rect(px,y,widths[i],7);put(headers[i],px+1,y+4.5,widths[i]-2,7.6,true,2);px+=widths[i];}
  rows.forEach((r,j)=>{px=x;r.forEach((v,i)=>{pdf.rect(px,y+7+j*rowHt,widths[i],rowHt);put(v,px+1,y+7+j*rowHt+4.5,widths[i]-2,7.4,false,2);px+=widths[i]})});
  return y+7+rowHt*rows.length;
 };
 // Page one: original proforma, 3 children, 2 claimed children, 2 school columns.
 center('PROFORMA FOR REIMBURSEMENT OF CHILDREN EDUCATION ALLOWANCE / HOSTEL SUBSIDY',20,10.3,true);
 center('ORDER NO. A-27012/02/2017-Ess. (AL) DATED-16/08/2017.',27,9.3,true);
 let y=39;
 y+=line('I hereby apply for the reimbursement of Children Education Allowance for my child / children for the financial year '+firstYear(d)+'. The relevant particulars are furnished below:-',y,9.7);
 y+=7;
 [
 ['1.','Name of the Employee',d.name],
 ['2.','Designation',d.designation],
 ['3.','I.D No.',d.employeeId],
 ['4.','Name of Spouse',d.spouseName],
 ['5.','If spouse is employed, State whether in Central Govt., PSU, State Govt. (give details)',d.spouseEmployment]
 ].forEach(([no,label,val])=>{y=row(no,label,val,y)});
 y+=4; y+=line('6. Details of all the children of the employee:',y,9.2);
 y+=3;
 y=table(childHeaders,childRows(d),L,y,[12,36,63,43,24],7.8);
 y+=8;
 y+=line('7. Details of children for whom CEA / Hostel Subsidy claimed:',y,9.2);
 y+=3;
 y=table(childHeaders,childRows(d,true),L,y,[12,36,63,43,24],7.8);
 y+=8;
 y+=line('8. Academic year, Name of School / Residential School and Class in which children studied:',y,9.2);
 y+=4;
 const half=SW/2;pdf.rect(L,y,half,7);pdf.rect(L+half,y,half,7);
 put('1st Child',L+33,y+4.8,half-38,8.5,true);put('2nd Child',L+half+33,y+4.8,half-38,8.5,true);
 y+=7;pdf.rect(L,y,half,35);pdf.rect(L+half,y,half,35);
 studyRow(d,0).forEach((v,i)=>put(v,L+2,y+6+i*10,half-4,7.3,false,2));
 studyRow(d,1).forEach((v,i)=>put(v,L+half+2,y+6+i*10,half-4,7.3,false,2));
 y+=35;
 pdf.setFont('times','bold');pdf.setFontSize(8);
 pdf.text('P.T.O',R,y+10,{align:'right'});
 if(y>281)throw Error('First page of CEA proforma is overfull; please shorten entries.');
 // Page two: full 9-15, declarations and signature fields.
 pdf.addPage('a4','portrait');
 center('Page-2',19,10,true);
 y=29;
 y+=line('9. Distance of Hostel of child from residence of employee (in case Hostel subsidy is claimed): '+display(d.hostelDistance),y,9);
 y+=3;
 y+=line('10. The Academic year for which CEA / Hostel Subsidy is applied for: '+display(d.academicYear),y,9);
 y+=3;
 y+=line('     (Indicating the amount already drawn): '+(tidy(d.alreadyDrawn)?'Rs. '+money(d.alreadyDrawn):'____________'),y,8.8);
 y+=5;
 y+=line('11. (a) Whether the child for whom the CEA is applied for is a disabled child: '+display(d.disabledChild),y,9);
 y+=3;
 y+=line('      (b) If yes, indicate the nature of disability: '+display(d.disabilityNature),y,8.8);
 y+=3;
 y+=line('      (c) Date of disability certificate: '+display(date(d.disabilityCertificateDate)),y,8.8);
 y+=3;
 y+=line('      (d) Indicate the percentage of disability: '+display(d.disabilityPercentage),y,8.8);
 y+=5;
 y+=line('12. Whether the Bonafide certificate from Head of Institution has been attached: '+display(d.bonafideAttached),y,9);
 y+=3;
 y+=line('13. For Hostel Subsidy, whether the certificate mentioning the amount is attached: '+display(d.hostelCertificateAttached),y,9);
 y+=3;
 y+=line('14. If Yes at Item No. 13, Amount claimed for Hostel Subsidy: '+(tidy(d.hostelClaimAmount)?'Rs. '+money(d.hostelClaimAmount):'__________'),y,9);
 y+=8;
 const ds=declarations(d);
 ds.forEach((v,i)=>{const h=put(v,L,y,SW,8.3,false,i===2?4:5);y+=h+(i===3?5:3)});
 const sigY=Math.max(y+5,231);
 if(sigY>265)throw Error('The CEA declaration needs more room than available on page 2. Shorten spouse employment details.');
 const d1=[['Place:',d.place],['Date:',date(d.date)]];
 const d2=[['Signature:','___________________'],['Name:',d.name],['Designation:',d.designation],['Employee I.D. No.:',d.employeeId],['GPF / PRAN NO.:',d.gpfPran],['S.B.A/C NO.:',d.sbaAccount]];
 d1.forEach(([k,v],i)=>put(k+' '+T(v),L,sigY+i*8,75,9));
 d2.forEach(([k,v],i)=>put(k+' '+T(v),L+100,sigY+i*8,78,8.8));
 if(pdf.internal.getNumberOfPages()!==2)throw Error('The CEA claim must be exactly 2 pages.');
 pdf.save(filename(d,'pdf'));
}

// Word uses native edit-ready tables, page break, A4 paper.
const border={style:BorderStyle.SINGLE,size:4,color:'555555'};
const bd={top:border,bottom:border,left:border,right:border};
const P=(txt,size=18,bold=false,align=AlignmentType.LEFT,after=100,extra={})=>new Paragraph({alignment:align,spacing:{before:0,after, line:240},...extra,children:[new TextRun({text:T(txt),font:'Times New Roman',size,bold})]});
const C=(txt,width,size=16,bold=false)=>new TableCell({width:{size:width,type:WidthType.DXA},borders:bd,margins:{top:75,bottom:75,left:70,right:70},children:[P(txt,size,bold,AlignmentType.LEFT,0)]});
const table=(headers,rows,widths)=>new Table({width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},columnWidths:widths,
 rows:[new TableRow({children:headers.map((v,i)=>C(v,widths[i],16,true))}),
 ...rows.map(v=>new TableRow({children:v.map((text,i)=>C(text,widths[i],16))}))]});
const narrowRow=(k,v)=>new TableRow({children:[C(k,4700,17),C(':  '+T(v),5300,17)]});
async function makeWord(d){
 const first=[
  P('PROFORMA FOR REIMBURSEMENT OF CHILDREN EDUCATION ALLOWANCE / HOSTEL SUBSIDY',19,true,AlignmentType.CENTER,45),
  P('ORDER NO. A-27012/02/2017-Ess. (AL) DATED-16/08/2017.',18,true,AlignmentType.CENTER,220),
  P('I hereby apply for the reimbursement of Children Education Allowance for my child / children for the financial year '+firstYear(d)+'. The relevant particulars are furnished below:-',19,false,AlignmentType.LEFT,140),
  new Table({width:{size:10000,type:WidthType.DXA},rows:[
   narrowRow('1. Name of the Employee',d.name),
   narrowRow('2. Designation',d.designation),
   narrowRow('3. I.D No.',d.employeeId),
   narrowRow('4. Name of Spouse',d.spouseName),
   narrowRow('5. If spouse is employed, State whether in Central Govt., PSU, State Govt. (give details)',d.spouseEmployment)
  ]}),
  P('6. Details of all the children of the employee:',18,false,AlignmentType.LEFT,80),
  table(childHeaders,childRows(d),[790,1900,3550,2370,1390]),
  P('7. Details of children for whom CEA / Hostel Subsidy claimed:',18,false,AlignmentType.LEFT,80),
  table(childHeaders,childRows(d,true),[790,1900,3550,2370,1390]),
  P('8. Academic year, Name of School / Residential School and Class in which children studied:',18,false,AlignmentType.LEFT,100),
  new Table({width:{size:10000,type:WidthType.DXA},rows:[
   new TableRow({children:[C('1st Child',5000,17,true),C('2nd Child',5000,17,true)]}),
   new TableRow({children:[C(studyRow(d,0).join('\n'),5000,16),C(studyRow(d,1).join('\n'),5000,16)]})
  ]}),
  P('P.T.O',16,true,AlignmentType.RIGHT,0)
 ];
 const second=[
  P('Page-2',19,true,AlignmentType.CENTER,140,{pageBreakBefore:true}),
  P('9. Distance of Hostel of child from residence of employee (in case Hostel subsidy is claimed): '+display(d.hostelDistance),18),
  P('10. The Academic year for which CEA / Hostel Subsidy is applied for: '+display(d.academicYear),18),
  P('     (Indicating the amount already drawn): '+(tidy(d.alreadyDrawn)?'Rs. '+money(d.alreadyDrawn):'_________'),17,false,AlignmentType.LEFT,150),
  P('11. (a) Whether the child for whom the CEA is applied for is a disabled child: '+display(d.disabledChild),17),
  P('      (b) If yes, indicate the nature of disability: '+display(d.disabilityNature),17),
  P('      (c) Date of disability certificate: '+display(date(d.disabilityCertificateDate)),17),
  P('      (d) Indicate the percentage of disability: '+display(d.disabilityPercentage),17),
  P('12. Whether the Bonafide certificate from Head of Institution has been attached: '+display(d.bonafideAttached),17),
  P('13. For Hostel Subsidy, whether the certificate mentioning the amount is attached: '+display(d.hostelCertificateAttached),17),
  P('14. If Yes at Item No. 13, Amount claimed for Hostel Subsidy: '+(tidy(d.hostelClaimAmount)?'Rs. '+money(d.hostelClaimAmount):'_________'),17,false,AlignmentType.LEFT,150),
  ...declarations(d).map(x=>P(x,17,false,AlignmentType.LEFT,115)),
  P('Place: '+T(d.place)+'                                      Signature: ___________________',17),
  P('Date: '+date(d.date)+'                                      Name: '+T(d.name),17),
  P('                                                                 Designation: '+T(d.designation),17),
  P('                                                                 Employee I.D. No.: '+T(d.employeeId),17),
  P('                                                                 GPF / PRAN NO.: '+T(d.gpfPran),17),
  P('                                                                 S.B.A/C NO.: '+T(d.sbaAccount),17)
 ];
 const doc=new Document({creator:'EMRS Claim Forms by worksbeyond',sections:[{properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.PORTRAIT},margin:{top:620,bottom:560,left:630,right:630}}},children:[...first,...second]}]});
 save(await Packer.toBlob(doc),filename(d,'docx'));
}

// Excel: exactly two print worksheets, white cells and plain black table lines.
const white={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
function makeSheet(book,name){
 const ws=book.addWorksheet(name,{views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:1,margins:{left:.32,right:.32,top:.38,bottom:.35,header:0,footer:0},horizontalCentered:true}});
 ws.columns=[{width:11},{width:18},{width:31},{width:19},{width:16}];
 ws.properties.defaultRowHeight=21;
 return ws;
}
function put(ws,row,c1,c2,value,{height=22,bold=false,align='left',bordered=false,size=10}={}){
 if(c1<c2)ws.mergeCells(row,c1,row,c2);
 const c=ws.getCell(row,c1);c.value=T(value);c.font={name:'Times New Roman',size,bold,color:{argb:'FF111111'}};c.alignment={horizontal:align,vertical:'middle',wrapText:true};c.fill=white;ws.getRow(row).height=Math.max(ws.getRow(row).height||0,height);
 if(bordered)c.border={top:border,left:border,right:border,bottom:border};
}
function excelTable(ws,start,headers,rows){
 const all=[headers,...rows];
 all.forEach((row,i)=>{row.forEach((v,col)=>put(ws,start+i,col+1,col+1,v,{height:i?27:28,bold:i===0,align:'center',bordered:true,size:10}))});
 return start+all.length;
}
async function makeExcel(d){
 const book=new ExcelJS.Workbook();book.creator='EMRS Claim Forms by worksbeyond';book.created=new Date();
 const f=makeSheet(book,'01 - CEA Claim');
 put(f,1,1,5,'PROFORMA FOR REIMBURSEMENT OF CHILDREN EDUCATION ALLOWANCE / HOSTEL SUBSIDY',{height:28,align:'center',bold:true,size:12});
 put(f,2,1,5,'ORDER NO. A-27012/02/2017-Ess. (AL) DATED-16/08/2017.',{height:24,align:'center',bold:true});
 put(f,4,1,5,'I hereby apply for reimbursement of CEA for my child/children for the financial year '+firstYear(d)+'. The relevant particulars are furnished below:',{height:38});
 const fields=[
 ['1. Name of the Employee',d.name],['2. Designation',d.designation],['3. I.D No.',d.employeeId],
 ['4. Name of Spouse',d.spouseName],['5. Spouse employed: Central Govt. / PSU / State Govt. (details)',d.spouseEmployment]
 ];
 fields.forEach(([k,v],i)=>{put(f,6+i,1,3,k,{height:i===4?37:23});put(f,6+i,4,5,v)});
 put(f,12,1,5,'6. Details of all the children of the employee:',{bold:true});
 excelTable(f,13,childHeaders,childRows(d));
 put(f,19,1,5,'7. Details of children for whom CEA / Hostel Subsidy claimed:',{bold:true});
 excelTable(f,20,childHeaders,childRows(d,true));
 put(f,24,1,5,'8. Academic year, School / Residential School and Class in which children studied:',{bold:true,height:35});
 put(f,25,1,3,'1st Child',{align:'center',bordered:true,bold:true});
 put(f,25,4,5,'2nd Child',{align:'center',bordered:true,bold:true});
 for(let i=0;i<3;i++){
  put(f,26+i,1,3,studyRow(d,0)[i],{height:30,bordered:true});
  put(f,26+i,4,5,studyRow(d,1)[i],{bordered:true});
 }
 put(f,30,4,5,'P.T.O',{align:'right',bold:true});
 f.pageSetup.printArea='A1:E30';
 const b=makeSheet(book,'02 - CEA Declaration');
 put(b,1,1,5,'Page-2',{align:'center',bold:true,height:27});
 let ri=3;
 const entries=[
 '9. Distance of Hostel of child from residence of employee: '+display(d.hostelDistance),
 '10. Academic year for which CEA / Hostel Subsidy is applied: '+display(d.academicYear),
 '    Amount already drawn: '+(tidy(d.alreadyDrawn)?'Rs. '+money(d.alreadyDrawn):'__________'),
 '11. (a) Disabled child for whom CEA is applied? '+display(d.disabledChild),
 '     (b) Nature of disability: '+display(d.disabilityNature),
 '     (c) Date of disability certificate: '+display(date(d.disabilityCertificateDate)),
 '     (d) Percentage of disability: '+display(d.disabilityPercentage),
 '12. Bonafide certificate from Head of Institution attached? '+display(d.bonafideAttached),
 '13. Hostel certificate mentioning the amount attached? '+display(d.hostelCertificateAttached),
 '14. If yes at item 13, Hostel Subsidy claimed: '+(tidy(d.hostelClaimAmount)?'Rs. '+money(d.hostelClaimAmount):'__________')
 ];
 entries.forEach((v,i)=>put(b,ri+i,1,5,v,{height:v.length>100?33:25}));
 ri+=entries.length+1;
 declarations(d).forEach((v,i)=>put(b,ri+i,1,5,v,{height:i===2?67:i===4?88:i===3?42:30}));
 ri+=6;
 for(let i=0;i<2;i++)put(b,ri+i,1,3,['Place: '+T(d.place),'Date: '+date(d.date)][i],{height:25});
 const sigLines=['Signature: ____________________','Name: '+T(d.name),'Designation: '+T(d.designation),'Employee I.D. No.: '+T(d.employeeId),'GPF / PRAN NO.: '+T(d.gpfPran),'S.B.A/C NO.: '+T(d.sbaAccount)];
 sigLines.forEach((v,i)=>put(b,ri+i,4,5,v,{height:27}));
 b.pageSetup.printArea='A1:E'+(ri+sigLines.length);
 const bin=await book.xlsx.writeBuffer();save(new Blob([bin],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),filename(d,'xlsx'));
}
export async function exportCEA(d,format){
 validate(d);
 if(format==='pdf')return makePdf(d);
 if(format==='docx')return makeWord(d);
 if(format==='xlsx')return makeExcel(d);
 throw Error('Unknown export format');
}
