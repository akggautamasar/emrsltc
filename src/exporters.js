
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,HeadingLevel,AlignmentType,PageOrientation,WidthType,BorderStyle} from 'docx';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';
import {dateText,sum,taRowAmount} from './schema.js';

const str=x=>x==null?'':String(x);
const money=x=>Number(x||0).toFixed(2);
const safe=x=>str(x).trim()||'—';
const download=(blob,name)=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)};
const fileName=(type,d,ext)=>[type,str(type==='medical'?d.rows?.[0]?.name:d.name).replace(/[^a-z0-9 -]/gi,'').trim().replace(/\s+/g,'_')||'blank'].join('_')+'.'+ext;
const ltcCertificate=[
'1. The information as given above is true to the best of my knowledge and belief;',
'2. That my husband/wife is not employed in Government service/that my husband/wife is employed in Government service and the concession has not been availed of by him/her separately for himself/herself or for any of the family members for the concerned block of years.',
'3. That my husband/wife for whom LTC is claimed by me is employed in a Public Sector Undertaking/Corporation/Autonomous Body, etc., which provides Leave Travel Concession facilities but he/she has not preferred and will not prefer any claim in this behalf to his/her employer; and',
'4. That my husband/wife for whom LTC is claimed by me is not employed in any Public Sector Undertaking/Corporation/Autonomous Body financed wholly or partly by the Central Government or a Local Body, which provides Leave Travel Concession facilities to its employees and their families.'
];
const taCertificate=[
'1. I travelled by the class of accommodation for which travelling allowance has been claimed in the bill.',
'2. I actually travelled by Mail Express train as claimed in the bill.',
'3. No return ticket was available for the journey for which the claim has been made in the bill.',
'4. I was actually and not merely constructively present in the camp for the days for which daily allowance has been claimed.',
'5. I was not on casual leave or restricted holidays on the days for which daily allowance has been claimed in the bill.',
'6. The Govt. conveyance was not utilised for the journey for which road mileage allowance has been claimed in the bill.',
'7. I did not perform the road journey for which mileage allowance has been claimed at the higher rate prescribed in Rule 45 by taking a single seat in any public conveyance that regularly plies for hire between fixed points and charges fixed rates.',
'8. I also certify that the journey was not performed in any other vehicle without payment of its hire charges or incurring its running expenses.',
'10. I was not provided with free boarding and lodging at the expenses of the Central Govt./State Govt., or local body, I did not stay in a Govt. Office/EMRS during my tour.',
'11. I have not received T.A. advance for the journey for which the claim is preferred / received advance as detailed in the claim.'
];
const taOfficer=[
'1. Certified that the journey was performed in society\'s interest.',
'2. Certified that the claim for personal effect is reasonable.',
'3. Certified that the journey for which T.A./D.A. has been claimed in the present bill were actually performed by the official concerned in the interest of society.'
];
const ltcJourneyHeaders=['Date','Departure Place','Arrival Place','Distance (km)','Mode','Class','No. fares','Fares paid (Rs.)','Remarks'];
const ltcJourneyRows=d=>d.journeys.map(r=>[dateText(r.date),r.from,r.to,r.distance,r.mode,r.classUsed,r.fares,r.amount,r.remarks]);
const ltcHigherHeaders=['From','To','Mode of conveyance','Class entitled','Class travelled','No. fares','Fares paid'];
const ltcHigherRows=d=>d.higher.map(r=>[r.from,r.to,r.mode,r.entitled,r.travelled,r.fares,r.amount]);
const ltcRoadHeaders=['From','To','Class entitled','Rail fare'];
const ltcRoadRows=d=>d.road.map(r=>[r.from,r.to,r.entitled,r.fare]);
const medicalHeaders=['S.No.','Name of Employee','Designation','Employee ID','Medical Claim Amount (Rs.)','Name of Dependent Family Member','Relationship','Spouse Working in Govt. Service (Yes/No)','Present Status'];
const medicalRows=d=>d.rows.map((r,i)=>[i+1,r.name,r.designation,r.employeeId,money(r.amount),r.dependent,r.relation,r.spouseGov,r.status]);
const taHeaders=['Departure station','Date','Time','Arrival station','Date','Time','Journey','Class','No. fares','Fare amount','Road KM','Rate/KM','Road amount','DA date','DA days','DA rate','DA amount','Actual expenses','Total','Remarks'];
const taRows=d=>d.rows.map(r=>[r.from,dateText(r.departureDate),r.departureTime,r.to,dateText(r.arrivalDate),r.arrivalTime,r.mode,r.travelClass,r.fareCount,r.fareAmount,r.km,r.kmRate,money(Number(r.km||0)*Number(r.kmRate||0)),dateText(r.daDate),r.daDays,r.daRate,money(Number(r.daDays||0)*Number(r.daRate||0)),(r.expenseName?r.expenseName+': ':'')+money(r.expenseAmount),money(taRowAmount(r)),r.remarks]);
const ltcInfo=d=>[['1. Name',d.name],['2. Designation',d.designation],['3. Pay',d.pay],['4. Headquarters',d.headquarters],['5. Nature of leave sanctioned',d.leaveNature],['Leave from',dateText(d.leaveFrom)],['Leave to',dateText(d.leaveTo)]];
const taInfo=d=>[['Name',d.name],['Designation',d.designation],['Headquarters',d.headquarters],['Pay level',d.payLevel],['Purpose of journey',d.purpose],['Bill month',d.billMonth]];
const ltcFooterInfo=d=>[['8. Amount of advance drawn',money(d.advance)],['Sanction number/date for higher class',d.higherSanction],['Concerned LTC block',str(d.blockFrom)+' to '+str(d.blockTo)],['Spouse employer (if applicable)',d.spouseEmployer],['Date',dateText(d.declarationDate)],['Signature of Government servant','________________________'],['For office use: Total amount admissible',money(d.admissible)],['Less: Advance',money(d.officeAdvance)],['Net payable / receivable',money(Number(d.admissible||0)-Number(d.officeAdvance||0))],['Office remarks',d.officeRemarks],['Dy. Registrar (Admin)','________________________']];
const taFooterInfo=d=>[['TOTAL CLAIM',money(sum(d.rows,taRowAmount))],['Less: Advance',money(d.advance)],['Net amount required for payment',money(sum(d.rows,taRowAmount)-Number(d.advance||0))],['Date of commencement of continuous service',dateText(d.serviceDate)],['Name of home town',d.homeTown],['Shortest route to home town and normal conveyance',d.shortestRoute],['Period of leave availed',d.leavePeriod],['Family members and age who availed LTC',d.familyDetails],['Whether prior information of journey was given to school',d.priorNotice],['Particulars of advance taken (in words)',d.advanceWords],['Date of withdrawal',dateText(d.withdrawalDate)],['For self / family / both',d.claimFor],['Passed for payment (Rs.)',d.passedAmount],['Employee signature / date',dateText(d.signatureDate)],['Controlling officer date',dateText(d.controllingDate)]];

// --- PDF: all text and tables are vector, white-background and printable.
function generatePdf(type,d){
 const landscape=type!=='ltc';const pdf=new jsPDF({orientation:landscape?'landscape':'portrait',unit:'mm',format:'a4',compress:true});
 const width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight(),margin=11;let y=14;
 const newPage=()=>{pdf.addPage();y=14};
 const ensure=(h=10)=>{if(y+h>height-14)newPage()};
 const title=(txt,size=12)=>{ensure(12);pdf.setFont('helvetica','bold');pdf.setFontSize(size);pdf.text(String(txt),width/2,y,{align:'center'});y+=size*.48+4;pdf.setFont('helvetica','normal')};
 const line=(txt,bold=false,pt=9)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(pt);const arr=pdf.splitTextToSize(str(txt),width-2*margin);const h=arr.length*pt*.42+2;ensure(h);pdf.text(arr,margin,y);y+=h;pdf.setFont('helvetica','normal')};
 const para=arr=>arr.forEach(t=>line(t,false,8));
 const pairs=arr=>arr.forEach(([k,v])=>line(k+': '+str(v),false,9));
 const table=(head,body,small=false)=>{
   ensure(12);autoTable(pdf,{startY:y,head:[head],body:body.length?body:[Array(head.length).fill('')],theme:'grid',margin:{left:margin,right:margin,top:14,bottom:14},styles:{font:'helvetica',fontSize:small?5.3:7,cellPadding:small?1.15:1.8,lineColor:[50,50,50],lineWidth:.15,textColor:[20,20,20],valign:'middle',overflow:'linebreak',fillColor:[255,255,255]},headStyles:{fillColor:[255,255,255],textColor:[0,0,0],fontStyle:'bold',lineWidth:.2},alternateRowStyles:{fillColor:[255,255,255]},showHead:'everyPage'});
   y=pdf.lastAutoTable.finalY+6;
 };
 if(type==='ltc'){
  title('PART A');title('(To be filled in by the Government servant)',9);
  pairs(ltcInfo(d));line('6. Particulars of members of family (including employee) in respect of whom LTC has been claimed:',true,9);
  table(['Sl. No.','Names','Age','Relationship with Govt. servant'],d.members.map((r,i)=>[i+1,r.name,r.age,r.relation]));
  line('7. Details of journey(s) performed by Government servant and members of his/her family:',true,9);
  table(ltcJourneyHeaders,ltcJourneyRows(d),true);
  pairs([ltcFooterInfo(d)[0]]);
  line('9. Journeys for which a higher class of accommodation was used (sanction details: '+str(d.higherSanction)+'):',true,9);
  table(ltcHigherHeaders,ltcHigherRows(d),true);
  line('10. Journeys performed by road between places connected by rail:',true,9);
  table(ltcRoadHeaders,ltcRoadRows(d));
  line('CERTIFIED THAT.-',true,10);para(ltcCertificate);pairs(ltcFooterInfo(d).slice(2));
 } else if(type==='medical'){
  title('MEDICAL CLAIM STATEMENT',12);line('Medical reimbursement claim register',false,9);
  table(medicalHeaders,medicalRows(d),true);
  line('Total claims: '+d.rows.length+'       Total amount claimed (Rs.): '+money(sum(d.rows,r=>r.amount)),true,10);
 }else{
  title(d.school||'EMRS KARANJIYA DINDORI MADHYA PRADESH 481884',12);title('TRAVELLING ALLOWANCE BILL',11);pairs(taInfo(d));
  line('Particulars of the Journey & Halts',true,9);table(taHeaders,taRows(d),true);
  pairs(taFooterInfo(d));
  line('Signature of Employee: ___________________   PRINCIPAL, EMRS KARANJIYA: ___________________',false,8);
  newPage();title('CERTIFICATE',12);title('EMRS KARANJIYA',10);para(taCertificate);
  line('Signature / Designation of the employee: ______________________________',false,8);
  line('Dated: '+dateText(d.employeeAdvanceDate),false,8);
  line('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER',true,10);para(taOfficer);
  line('Dated: '+dateText(d.controllingDate)+'           PRINCIPAL: __________________________',false,8);
 }
 const n=pdf.internal.getNumberOfPages();for(let i=1;i<=n;i++){pdf.setPage(i);pdf.setFontSize(7);pdf.setTextColor(105);pdf.text('Page '+i+' of '+n,width/2,height-6,{align:'center'});pdf.setTextColor(0)}
 pdf.save(fileName(type,d,'pdf'));
}

// --- DOCX: native editable paragraphs and tables.
const docP=(text='',bold=false)=>new Paragraph({spacing:{after:55},children:[new TextRun({text:str(text),bold,size:18,font:'Arial'})]});
const docTitle=t=>new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:100},children:[new TextRun({text:str(t),bold:true,size:25,font:'Arial'})]});
const docSub=t=>new Paragraph({spacing:{before:140,after:70},children:[new TextRun({text:str(t),bold:true,size:19,font:'Arial'})]});
const cell=t=>new TableCell({margins:{top:65,bottom:65,left:55,right:55},children:[new Paragraph({spacing:{after:0},children:[new TextRun({text:str(t),size:15,font:'Arial'})]})]});
const wordTable=(headers,rows)=>new Table({width:{size:100,type:WidthType.PERCENTAGE},borders:Object.fromEntries(['top','bottom','left','right','insideHorizontal','insideVertical'].map(k=>[k,{style:BorderStyle.SINGLE,size:4,color:'555555'}])),rows:[new TableRow({tableHeader:true,children:headers.map(h=>cell(h))}),...rows.map(row=>new TableRow({children:row.map(cell)}))]});
async function generateWord(type,d){
 const children=[];
 const addPairs=a=>a.forEach(([k,v])=>children.push(docP(k+': '+str(v))));
 if(type==='ltc'){
  children.push(docTitle('PART A'),docP('(To be filled in by the Government servant)'));addPairs(ltcInfo(d));
  children.push(docSub('6. Particulars of family members (including employee)'));children.push(wordTable(['Sl. No.','Names','Age','Relationship'],d.members.map((r,i)=>[i+1,r.name,r.age,r.relation])));
  children.push(docSub('7. Details of journeys performed'));children.push(wordTable(ltcJourneyHeaders,ltcJourneyRows(d)));addPairs([ltcFooterInfo(d)[0]]);
  children.push(docSub('9. Journeys in higher class of accommodation'));addPairs([['Sanction no. and date',d.higherSanction]]);children.push(wordTable(ltcHigherHeaders,ltcHigherRows(d)));
  children.push(docSub('10. Road journeys between rail-connected places'));children.push(wordTable(ltcRoadHeaders,ltcRoadRows(d)));
  children.push(docSub('CERTIFIED THAT.-'));ltcCertificate.forEach(x=>children.push(docP(x)));addPairs(ltcFooterInfo(d).slice(2));
 }else if(type==='medical'){
  children.push(docTitle('MEDICAL CLAIM STATEMENT'),docP('Medical reimbursement claim register'),wordTable(medicalHeaders,medicalRows(d)),docP('Total amount claimed (Rs.): '+money(sum(d.rows,r=>r.amount)),true));
 }else{
  children.push(docTitle(d.school),docTitle('TRAVELLING ALLOWANCE BILL'));addPairs(taInfo(d));children.push(docSub('Particulars of the Journey & Halts'),wordTable(taHeaders,taRows(d)));addPairs(taFooterInfo(d));
  children.push(docP('Signature of Employee: ____________________   PRINCIPAL, EMRS KARANJIYA: ____________________'));
  children.push(new Paragraph({pageBreakBefore:true,children:[new TextRun({text:'CERTIFICATE — EMRS KARANJIYA',bold:true,size:23})]}));
  taCertificate.forEach(x=>children.push(docP(x)));children.push(docP('Signature / Designation of employee: __________________________'));
  children.push(docSub('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER'));taOfficer.forEach(x=>children.push(docP(x)));children.push(docP('Dated: '+dateText(d.controllingDate)+'       PRINCIPAL: _____________________'));
 }
 const landscape=type!=='ltc';
 const doc=new Document({creator:'EMRS Claim Forms by worksbeyond',sections:[{properties:{page:{size:{width:landscape?16838:11906,height:landscape?11906:16838,orientation:landscape?PageOrientation.LANDSCAPE:PageOrientation.PORTRAIT},margin:{top:660,bottom:660,left:620,right:620}}},children}]});
 const blob=await Packer.toBlob(doc);download(blob,fileName(type,d,'docx'));
}

// --- XLSX: native editable, white paper, fine black borders, landscape TA/medical.
async function generateExcel(type,d){
 const book=new ExcelJS.Workbook();book.creator='EMRS Claim Forms by worksbeyond';book.created=new Date();
 const ws=book.addWorksheet(type==='ltc'?'LTC Claim':type==='medical'?'Medical Claim':'TA and DA',{views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:type==='ltc'?'portrait':'landscape',fitToPage:true,fitToWidth:1,fitToHeight:0,margins:{left:.3,right:.3,top:.45,bottom:.45,header:.1,footer:.1}}});
 const max=type==='ltc'?9:type==='medical'?9:20;ws.columns=Array.from({length:max},(_,i)=>({width:type==='ta'?(i===0||i===3?17:i===19?22:12):i===1?25:16}));
 const line=(text,bold=false)=>{const row=ws.addRow([text]);ws.mergeCells(row.number,1,row.number,max);row.font={name:'Arial',size:10,bold};row.height=18;return row};
 const table=(headers,rows)=>{const h=ws.addRow(headers);h.font={bold:true,name:'Arial',size:9};h.height=42;h.alignment={vertical:'middle',wrapText:true,horizontal:'center'};[h,...rows.map(r=>{let z=ws.addRow(r);z.height=30;z.alignment={vertical:'middle',wrapText:true};return z})].forEach(row=>row.eachCell({includeEmpty:true},c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};c.border={top:{style:'thin',color:{argb:'FF555555'}},bottom:{style:'thin',color:{argb:'FF555555'}},left:{style:'thin',color:{argb:'FF555555'}},right:{style:'thin',color:{argb:'FF555555'}}};c.font={name:'Arial',size:9,bold:row.number===h.number,color:{argb:'FF111111'}}}));};
 const pairs=arr=>arr.forEach(([k,v])=>line(k+': '+str(v)));
 if(type==='ltc'){
  line('PART A',true);line('(To be filled in by the Government servant)');pairs(ltcInfo(d));
  line('6. Particulars of family members (including employee)',true);table(['Sl. No.','Names','Age','Relationship','','','','',''],d.members.map((r,i)=>[i+1,r.name,r.age,r.relation]));
  line('7. Details of journeys performed',true);table(ltcJourneyHeaders,ltcJourneyRows(d));pairs([ltcFooterInfo(d)[0]]);
  line('9. Journeys in higher class of accommodation',true);pairs([['Sanction number and date',d.higherSanction]]);table([...ltcHigherHeaders,'',''],ltcHigherRows(d));
  line('10. Road journeys between rail-connected places',true);table([...ltcRoadHeaders,'','','','',''],ltcRoadRows(d));
  line('CERTIFIED THAT.-',true);ltcCertificate.forEach(x=>line(x));pairs(ltcFooterInfo(d).slice(2));
 }else if(type==='medical'){
  line('MEDICAL CLAIM STATEMENT',true);line('Medical reimbursement claim register');table(medicalHeaders,medicalRows(d));line('Total amount claimed (Rs.): '+money(sum(d.rows,r=>r.amount)),true);
 }else{
  line(d.school,true);line('TRAVELLING ALLOWANCE BILL',true);pairs(taInfo(d));
  line('Particulars of the Journey & Halts',true);table(taHeaders,taRows(d));pairs(taFooterInfo(d));
  line('Signature of Employee: ____________________');line('PRINCIPAL, EMRS KARANJIYA: ____________________');
  const back=book.addWorksheet('Certificates',{views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:1}});
  back.columns=[{width:115}];const add=(x,bold=false)=>{let r=back.addRow([x]);r.font={name:'Arial',size:10,bold};r.alignment={wrapText:true};r.height=Math.max(22,Math.ceil(str(x).length/110)*20)};
  add('CERTIFICATE — EMRS KARANJIYA',true);taCertificate.forEach(x=>add(x));add('Signature / Designation of employee: ___________________');add('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER',true);taOfficer.forEach(x=>add(x));add('Dated: '+dateText(d.controllingDate)+'     PRINCIPAL: ___________________');
 }
 ws.getRow(1).font={bold:true,size:14,name:'Arial'};
 ws.headerFooter.oddFooter='&CPage &P of &N';
 const array=await book.xlsx.writeBuffer();download(new Blob([array],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),fileName(type,d,'xlsx'));
}
export async function exportClaim(type,d,format){if(type==='ta'){const {exportTA}=await import('./taPrint.js');return exportTA(d,format);}if(format==='pdf')return generatePdf(type,d);if(format==='docx')return generateWord(type,d);if(format==='xlsx')return generateExcel(type,d);throw Error('Unsupported format')}
