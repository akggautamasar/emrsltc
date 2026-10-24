
/**
 * Print-faithful two-sided TA / DA bill for EMRS Karanjiya.
 * PAGE 1: Twenty-column journey bill and particulars.
 * PAGE 2: Employee + controlling officer certificates.
 * White paper, black rules, A4 landscape; deliberately no automatic 3rd page.
 */
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,PageOrientation,WidthType,BorderStyle,TableLayoutType,HeightRule,VerticalAlign} from 'docx';
import {jsPDF} from 'jspdf';
import {dateText,taRowAmount,sum} from './schema.js';

const MAX_ROWS=14;
const HEADERS=['Station','Date','Hours','Station','Date','Hours','Kind of journey','Class','No. of Fare','Amount','No. of KMs','Rate','Amount','No. of Days','Rate','Amount','Particulars','Amount','Total of each line','Remarks'];
const WIDTHS=[18,23,15,18,23,15,14,15,14,17,14,13,16,18,14,17,20,15,18,20];
const WIDTH_SUM=WIDTHS.reduce((a,b)=>a+b,0);
const CUM=WIDTHS.reduce((a,b,i)=>(a.push((a[i-1]||0)+b),a),[]);
const BLACK='222222';
const S=x=>x==null?'':String(x);
const num=x=>Number(x||0);
const fmt=x=>S(x).trim()===''?'':num(x).toLocaleString('en-IN',{maximumFractionDigits:2});
const D=x=>dateText(x).replaceAll('/','-');
const net=d=>sum(d.rows,taRowAmount)-num(d.advance);
const sheetName='EMRS Karanjiya';
const schoolName=d=>S(d.school||'EMRS Karanjiya, Dindori, MP');
const MAX_TEXT=500;
function validate(d){
 if(!Array.isArray(d.rows))throw Error('Journey details are missing.');
 if(d.rows.length>MAX_ROWS)throw Error('The two-page TA/DA form supports up to '+MAX_ROWS+' journey rows. Remove or consolidate entries before exporting; no journey will be omitted.');
 if([d.name,d.designation,d.headquarters,d.purpose].some(v=>S(v).length>MAX_TEXT))throw Error('A header field is too long to fit the two-page paper template.');
}
const journey=r=>[
 S(r.from),D(r.departureDate),S(r.departureTime),S(r.to),D(r.arrivalDate),S(r.arrivalTime),
 S(r.mode),S(r.travelClass),S(r.fareCount),fmt(r.fareAmount),S(r.km),S(r.kmRate),
 r.km!==''&&r.kmRate!==''?fmt(num(r.km)*num(r.kmRate)):'',
 S(r.daDays)||D(r.daDate),S(r.daRate),r.daAmount!==undefined&&S(r.daAmount)!==''?fmt(r.daAmount):(r.daDays!==''&&r.daRate!==''?fmt(num(r.daDays)*num(r.daRate)):''),
 S(r.expenseName),fmt(r.expenseAmount),fmt(taRowAmount(r)),S(r.remarks)
];
const certifications=[
 '1. I travelled by the class of accommodation for which travelling allowance has been claimed in the bill.',
 '2. I actually travelled by Mail Express train as claimed in the bill.',
 '3. No return ticket was available for the journey for which the claim has been made in the bill.',
 '4. I was actually and not merely constructively present in the camp for the days for which daily allowance has been claimed.',
 '5. I was not on casual leave or restricted holidays on the days for which daily allowance has been claimed in the bill.',
 '6. The Govt. conveyance was not utilised for the journey for which road mileage allowance has been claimed in the bill.',
 '7. I did not perform the road journey for which mileage allowance has been claimed at the higher rate prescribed in Rule 45 of the supplementary Rules, by taking a single seat in any public conveyance which regularly plies for hire between fixed points and charges fixed rates.',
 '8. I also certify that the journey was not performed in any other vehicle without payment of its hire charges or incurring its running expenses.',
 '10. I was not provided with free boarding and lodging at the expenses of the Central Govt./State Govt. or local body. I did not stay in a Govt. Office/EMRS during my tour.',
 '11. I have not received T.A. advance for the journey for which the claim is preferred / received advance of Rs. ............ on ............'
];
const officer=[
 '1. Certified that the journey was performed in school interest.',
 '2. Certified that the claim for personal effect is reasonable.',
 '3. Certified that the journey for which T.A./D.A. has been claimed in the present bill was actually performed by the official concerned in the interest of Organization.'
];
const employeeFields=d=>[
 '1. Date of commencement of continuous service: '+D(d.serviceDate),
 '2. Name of Home Town: '+S(d.homeTown),
 '3. Shortest route from headquarters to home town and normal mode of conveyance: '+S(d.shortestRoute),
 '4. Period of leave availed: '+S(d.leavePeriod),
 '5. Relationship of the members of family and age (who availed the concession): '+S(d.familyDetails),
 '6. Whether prior information of journey has been given to the school: '+S(d.priorNotice),
 '7. Particulars of advance taken (in words): '+S(d.advanceWords)
];
const save=(blob,name)=>{const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500)};
const fileName=(d,ext)=>'TA_DA_'+(S(d.name).replace(/[^a-z0-9 ]/gi,'').trim().replace(/\s+/g,'_')||'Claim')+'.'+ext;

// PDF: measured absolute layout; exactly one landscape page on each side.
function makePdf(d){
 const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});
 const W=pdf.internal.pageSize.getWidth(),H=pdf.internal.pageSize.getHeight();
 const L=6.5,R=W-6.5,T=6.5,U=R-L;
 const xs=[L,...CUM.map(c=>L+c/WIDTH_SUM*U)];
 const grid=(x,y,w,h)=>{pdf.setDrawColor(40);pdf.setLineWidth(.16);pdf.rect(x,y,w,h)};
 const text=(s,x,y,w,h,pt=7,style='normal',align='center',maxLines=3)=>{
  const value=S(s);if(!value)return;
  let size=pt, lines=[];
  do{pdf.setFont('helvetica',style);pdf.setFontSize(size);lines=pdf.splitTextToSize(value,Math.max(1,w-1.4));if(lines.length<=maxLines)break;size-=.35}while(size>3.1);
  if(lines.length>maxLines){const prev=lines.slice(0,maxLines-1);prev.push(lines.slice(maxLines-1).join(' '));lines=prev;while(pdf.getTextWidth(lines.at(-1))>w-1.4&&size>2.7){size-=.15;pdf.setFontSize(size)}}
  const spacing=size*.355, block=lines.length*spacing;
  const first=y+(h-block)/2+spacing*.73;
  pdf.text(lines,align==='left'?x+.8:align==='right'?x+w-.8:x+w/2,first,{align,lineHeightFactor:1.05,baseline:'alphabetic'});
 };
 const cell=(i,j,y,h,value,pt=7,style='normal',align='center',maxLines=3)=>{
  const x=xs[i],w=xs[j]-x;grid(x,y,w,h);text(value,x,y,w,h,pt,style,align,maxLines);
 };
 const horiz=(y,a=0,b=20)=>{pdf.line(xs[a],y,xs[b],y)};
 // School and bill heading
 cell(0,20,T,6,schoolName(d),10,'normal');
 cell(0,20,T+6,5,'TRAVELLING ALLOWANCE BILL',9,'bold');
 cell(0,6,T+11,6,'NAME - '+S(d.name),7,'bold');
 cell(6,12,T+11,6,'DESIGNATION - '+S(d.designation),7,'bold');
 cell(12,20,T+11,6,'HEAD QUARTER : '+S(d.headquarters),6.7);
 cell(0,10,T+17,6,'PURPOSE OF JOURNEY - '+S(d.purpose),7,'bold');
 cell(10,20,T+17,6,'PAY LEVEL - '+S(d.payLevel),7,'bold');
 const y0=T+23;
 const h0=6,h1=6,h2=13,h3=6;
 const group=[
 [0,6,'Particulars of the Journey & Halts'],[6,7,'Kind of journey'],
 [7,10,'Railway'],[10,13,'Mileage by Road'],[13,16,'Daily Allowance'],
 [16,18,'Actual Expenses'],[18,19,'Total of each line'],[19,20,'Remarks']
 ];
 group.forEach(([a,b,t])=>cell(a,b,y0,h0,t,6.8));
 // The visual grouped headers reproduce the source's 20 numbered columns.
 cell(0,3,y0+h0,h1,'Departure',7);
 cell(3,6,y0+h0,h1,'Arrival',7);
 cell(6,7,y0+h0,h1,'',6);
 cell(7,10,y0+h0,h1,'Steamer / Air',6.8);
 cell(10,13,y0+h0,h1,'',6);
 cell(13,16,y0+h0,h1,'',6);
 cell(16,18,y0+h0,h1,'',6);
 cell(18,19,y0+h0,h1,'',6);
 cell(19,20,y0+h0,h1,'',6);
 const yH=y0+h0+h1;
 HEADERS.forEach((v,i)=>cell(i,i+1,yH,h2,v,6.1,'normal','center',4));
 const yN=yH+h2;
 HEADERS.forEach((v,i)=>cell(i,i+1,yN,h3,String(i+1),6.3,'bold'));
 const rowsY=yN+h3,rowsH=89,rowHeight=rowsH/MAX_ROWS;
 for(let r=0;r<MAX_ROWS;r++){
  const data=d.rows[r]?journey(d.rows[r]):Array(20).fill('');
  for(let i=0;i<20;i++)cell(i,i+1,rowsY+r*rowHeight,rowHeight,data[i],5.8,'normal','center',3);
 }
 const endRows=rowsY+rowsH;
 // Summary drawn in the same right-justified structure as the worksheet.
 cell(0,13,endRows,6,'TOTAL',7,'bold','left');
 cell(13,18,endRows,6,'Rs. '+fmt(sum(d.rows,taRowAmount)),7,'bold','right');
 cell(18,20,endRows,6,'',7);
 cell(0,15,endRows+6,6,'',7);
 cell(15,19,endRows+6,6,'Deduction of advance',6.7,'normal');
 cell(19,20,endRows+6,6,fmt(d.advance)||'0',6.6);
 cell(0,15,endRows+12,6,'',7);
 cell(15,19,endRows+12,6,'Net amount required for payment',6.7);
 cell(19,20,endRows+12,6,fmt(net(d)),7,'bold');
 const fy=endRows+19;
 pdf.setDrawColor(130);pdf.setLineWidth(.15);
 pdf.setFont('helvetica','bold');pdf.setFontSize(7);
 pdf.text('PARTICULARS TO BE GIVEN BY EMPLOYEE ON LEAVE TRAVEL CONCESSION BILL',L,fy);
 pdf.setFont('helvetica','normal');
 employeeFields(d).forEach((entry,i)=>text(entry,L,fy+3+i*4.4,U*.61,4.4,6.1,'normal','left',2));
 pdf.setFont('helvetica','bold');pdf.setFontSize(7);
 pdf.text('CERTIFICATE OF DISBURSEMENT',L+U*.67,fy+9);
 text('Certified that the amount due on this bill has been disbursed to the proper person and his acquaintance.',L+U*.64,fy+13,U*.36,13,6.4,'normal','left',3);
 text('Passed for payment Rs. '+(S(d.passedAmount)||'................')+' /-  (Rs. '+(S(d.advanceWords)||'................')+' only)',L+U*.64,fy+1,U*.36,9,6,'normal','left',3);
 text('Signature of Employee',L+U*.26,fy+32,U*.25,4,6.5);
 text('PRINCIPAL\nEMRS KARANJIYA',L+U*.72,fy+31,U*.25,8,6.5,'bold');
 text('Date of Withdrawal: '+D(d.withdrawalDate)+'     for self/family/both: '+S(d.claimFor),L,fy+34,U*.61,5,6,'normal','left',2);
 // PAGE TWO (explicit)
 pdf.addPage('a4','landscape');
 pdf.setFont('helvetica','normal');
 const center=(s,y,pt=12,bold=false)=>{pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(pt);pdf.text(s,W/2,y,{align:'center'})};
 center('CERTIFICATE',14,15);
 center('EMRS Karanjiya',21,11,true);
 let y=31;
 certifications.forEach((line,i)=>{
  const lines=pdf.splitTextToSize(line,U-1);pdf.setFontSize(9);pdf.setFont('helvetica','normal');
  pdf.text(lines,L,y,{lineHeightFactor:1.18});
  y+=lines.length*4.2+(i===7?9:3.0);
 });
 pdf.setFontSize(9);
 pdf.text('Signature ................................................',R,129,{align:'right'});
 pdf.text('Designation of the employee',R,136,{align:'right'});
 pdf.text('Dated: '+D(d.employeeAdvanceDate||d.signatureDate)+' ................',L,142);
 center('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER',153,9,true);
 let oy=164;
 officer.forEach(line=>{const lines=pdf.splitTextToSize(line,U-1);pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.text(lines,L,oy);oy+=lines.length*4+3});
 pdf.text('Dated: '+D(d.controllingDate)+' ................',L,196);
 pdf.text('Signature',R,196,{align:'right'});
 if(pdf.internal.getNumberOfPages()!==2)throw Error('TA/DA PDF pagination failed.');
 pdf.save(fileName(d,'pdf'));
}

// Word: actual editable cells and text, with an explicit page break between the two sides.
const B={style:BorderStyle.SINGLE,size:4,color:BLACK};
const allBorders={top:B,bottom:B,left:B,right:B,insideHorizontal:B,insideVertical:B};
const wsizes=WIDTHS.map(x=>Math.round(x/WIDTH_SUM*15500));
const wordCell=(value,span=1,opts={})=>new TableCell({
 columnSpan:span,
 width:{size:opts.width||wsizes.slice(opts.start||0,(opts.start||0)+span).reduce((a,b)=>a+b,0),type:WidthType.DXA},
 verticalAlign:VerticalAlign.CENTER,
 borders:allBorders,
 margins:{top:38,bottom:38,left:35,right:35},
 children:[new Paragraph({alignment:opts.align||AlignmentType.CENTER,spacing:{before:0,after:0},children:[new TextRun({text:S(value),font:'Arial',size:opts.size||12,bold:!!opts.bold})]})]
});
const grouped=(cells,height)=>new TableRow({height:{value:height,rule:HeightRule.ATLEAST},children:cells.map(c=>wordCell(c.value,c.span,{start:c.start,size:c.size,bold:c.bold,align:c.align}))});
const wp=(strng,pt=8,bold=false,options={})=>new Paragraph({spacing:{before:0,after:options.after===undefined?50:options.after},alignment:options.center?AlignmentType.CENTER:AlignmentType.LEFT,pageBreakBefore:!!options.pageBreakBefore,children:[new TextRun({text:S(strng),font:'Arial',size:pt*2,bold})]});
function wordFrontTable(d){
 const groups=[
  {value:'Particulars of the Journey & Halts',span:6,start:0},
  {value:'Kind of journey',span:1,start:6},
  {value:'Railway / Steamer / Air',span:3,start:7},
  {value:'Mileage by Road',span:3,start:10},
  {value:'Daily Allowance',span:3,start:13},
  {value:'Actual Expenses',span:2,start:16},
  {value:'Total of each line',span:1,start:18},
  {value:'Remarks',span:1,start:19}
 ];
 const names=HEADERS.map((h,i)=>({value:h,span:1,start:i,size:11}));
 const nums=HEADERS.map((_,i)=>({value:i+1,span:1,start:i,size:11,bold:true}));
 const rows=[
  grouped(groups,270),
  grouped(names,480),
  grouped(nums,170),
  ...Array.from({length:MAX_ROWS},(_,i)=>grouped((d.rows[i]?journey(d.rows[i]):Array(20).fill('')).map((v,n)=>({value:v,span:1,start:n,size:10})),250))
 ];
 return new Table({width:{size:15500,type:WidthType.DXA},layout:TableLayoutType.FIXED,columnWidths:wsizes,borders:allBorders,rows});
}
async function makeWord(d){
 const fixed=(strng,span,start,bold=false)=>({value:strng,span,start,size:12,bold});
 const info=new Table({width:{size:15500,type:WidthType.DXA},layout:TableLayoutType.FIXED,borders:allBorders,rows:[
 grouped([fixed('NAME - '+S(d.name),6,0),fixed('DESIGNATION - '+S(d.designation),6,6),fixed('HEAD QUARTER : '+S(d.headquarters),8,12)],250),
 grouped([fixed('PURPOSE OF JOURNEY - '+S(d.purpose),10,0),fixed('PAY LEVEL - '+S(d.payLevel),10,10)],250)
 ]});
 const left=employeeFields(d).join('\n');
 const totals=new Table({width:{size:15500,type:WidthType.DXA},layout:TableLayoutType.FIXED,borders:allBorders,rows:[
  grouped([fixed('TOTAL',10,0,true),fixed('Rs. '+fmt(sum(d.rows,taRowAmount)),10,10,true)],250),
  grouped([fixed('Deduction of advance',17,0),fixed(fmt(d.advance)||'0',3,17,true)],220),
  grouped([fixed('Net amount required for payment',17,0),fixed(fmt(net(d)),3,17,true)],220)
 ]});
 const signatures=new Table({width:{size:15500,type:WidthType.DXA},borders:{},rows:[
 new TableRow({children:[
 new TableCell({width:{size:9300,type:WidthType.DXA},children:[wp('PARTICULARS TO BE GIVEN BY EMPLOYEE ON LEAVE TRAVEL CONCESSION BILL',6.5,true),...employeeFields(d).map(x=>wp(x,6.1,false,{after:18})),wp('Date of Withdrawal: '+D(d.withdrawalDate)+'     for self/family/both: '+S(d.claimFor),6),wp('Signature of Employee: ____________________',7)]}),
 new TableCell({width:{size:6200,type:WidthType.DXA},children:[wp('Passed for payment Rs. '+(S(d.passedAmount)||'................')+' /-',6.7,true),wp('CERTIFICATE OF DISBURSEMENT',7,true,{center:true}),wp('Certified that the amount due on this bill has been disbursed to the proper person and his acquaintance.',7),wp('PRINCIPAL — EMRS KARANJIYA',7,true,{center:true})]})
 ]})]});
 const first=[wp(schoolName(d),10,false,{center:true,after:0}),wp('TRAVELLING ALLOWANCE BILL',9,true,{center:true,after:10}),info,wordFrontTable(d),totals,signatures];
 const back=[wp('CERTIFICATE',15,false,{center:true,pageBreakBefore:true,after:0}),wp('EMRS Karanjiya',11,true,{center:true,after:100})];
 certifications.forEach((c,i)=>back.push(wp(c,9,false,{after:i===7?270:115})));
 back.push(wp('Signature ..........................................',9,false,{after:40}),wp('Designation of the employee',9,false,{after:110}),wp('Dated: '+D(d.employeeAdvanceDate||d.signatureDate)+' ................',9,false,{after:200}));
 back.push(wp('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER',9,true,{center:true,after:200}));
 officer.forEach(c=>back.push(wp(c,9,false,{after:115})));
 back.push(wp('Dated: '+D(d.controllingDate)+' ................                                                    Signature ................................',9));
 const doc=new Document({
 creator:'EMRS Claim Forms by worksbeyond',
 sections:[{properties:{page:{size:{width:16838,height:11906,orientation:PageOrientation.LANDSCAPE},margin:{top:280,bottom:240,left:290,right:290}}},children:[...first,...back]}]
 });
 const blob=await Packer.toBlob(doc);save(blob,fileName(d,'docx'));
}

// Excel: two distinct, white print worksheets; print ENTIRE WORKBOOK = front + back.
function makeWorkbookFront(wb,d){
 const sh=wb.addWorksheet('01 - TA DA Bill',{views:[{showGridLines:false}],pageSetup:{
 paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:1,
 margins:{left:.14,right:.14,top:.16,bottom:.14,header:0,footer:0},
 horizontalCentered:true
 }});
 sh.columns=WIDTHS.map(x=>({width:Math.max(8,Math.round(x*.57))}));
 sh.properties.defaultRowHeight=16;
 const span=(r,a,b,value,bold=false,height)=>{if(a<b)sh.mergeCells(r,a,r,b);const c=sh.getCell(r,a);c.value=value||'';c.alignment={vertical:'middle',horizontal:'center',wrapText:true};c.font={name:'Arial',size:r<5?10:8,bold,color:{argb:'FF111111'}};if(height)sh.getRow(r).height=height};
 span(1,1,20,schoolName(d),false,19);
 span(2,1,20,'TRAVELLING ALLOWANCE BILL',true,18);
 span(3,1,6,'NAME - '+S(d.name),true,20);
 span(3,7,12,'DESIGNATION - '+S(d.designation),true);
 span(3,13,20,'HEAD QUARTER : '+S(d.headquarters));
 span(4,1,10,'PURPOSE OF JOURNEY - '+S(d.purpose),true,20);
 span(4,11,20,'PAY LEVEL - '+S(d.payLevel),true);
 const groups=[[1,6,'Particulars of the Journey & Halts'],[7,7,'Kind of journey'],[8,10,'Railway'],[11,13,'Mileage by Road'],[14,16,'Daily Allowance'],[17,18,'Actual Expenses'],[19,19,'Total of each line'],[20,20,'Remarks']];
 groups.forEach(([a,b,t])=>span(5,a,b,t,false,18));
 span(6,1,3,'Departure',false,16);span(6,4,6,'Arrival');span(6,8,10,'Steamer / Air');
 HEADERS.forEach((h,i)=>{const c=sh.getCell(7,i+1);c.value=h;c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.font={name:'Arial',size:7}});sh.getRow(7).height=36;
 for(let i=0;i<20;i++){const c=sh.getCell(8,i+1);c.value=i+1;c.font={name:'Arial',size:8,bold:true};c.alignment={horizontal:'center'}}sh.getRow(8).height=15;
 for(let i=0;i<MAX_ROWS;i++){
   const vals=d.rows[i]?journey(d.rows[i]):Array(20).fill('');
   const r=9+i;for(let col=1;col<=20;col++){const c=sh.getCell(r,col);c.value=vals[col-1];c.alignment={vertical:'middle',horizontal:'center',wrapText:true};c.font={name:'Arial',size:7}}sh.getRow(r).height=19;
 }
 const totalAt=9+MAX_ROWS;
 span(totalAt,1,10,'TOTAL',true,20);
 span(totalAt,11,18,'Rs. '+fmt(sum(d.rows,taRowAmount)),true);
 span(totalAt+1,1,15,'',false,20);span(totalAt+1,16,19,'Deduction of advance');sh.getCell(totalAt+1,20).value=num(d.advance);
 span(totalAt+2,1,15,'',false,20);span(totalAt+2,16,19,'Net amount required for payment');sh.getCell(totalAt+2,20).value={formula:'SUM(S9:S'+(totalAt-1)+')-T'+(totalAt+1),result:net(d)};
 let f=totalAt+3;
 span(f,1,12,'PARTICULARS TO BE GIVEN BY EMPLOYEE ON LEAVE TRAVEL CONCESSION BILL',true,21);
 span(f,13,20,'Passed for payment Rs. '+(S(d.passedAmount)||'................')+' /-',true);
 for(let i=0;i<employeeFields(d).length;i++){span(f+i+1,1,12,employeeFields(d)[i],false,18);}
 span(f+1,13,20,'CERTIFICATE OF DISBURSEMENT',true);
 span(f+2,13,20,'Certified that the amount due on this bill has been',false);
 span(f+3,13,20,'disbursed to the proper person and his acquaintance.');
 span(f+5,13,20,'PRINCIPAL — EMRS KARANJIYA',true);
 span(f+8,1,12,'Date of Withdrawal: '+D(d.withdrawalDate)+'  For '+S(d.claimFor),false,18);
 span(f+9,1,12,'Signature of Employee: ______________________',false,20);
 sh.getRow(f+10).height=6;
 const last=f+10;
 for(let row=1;row<=totalAt+2;row++){
  for(let col=1;col<=20;col++){
   const c=sh.getCell(row,col);
   c.border={top:{style:'thin',color:{argb:'FF333333'}},bottom:{style:'thin',color:{argb:'FF333333'}},left:{style:'thin',color:{argb:'FF333333'}},right:{style:'thin',color:{argb:'FF333333'}}};
  }
 }
 for(let row=1;row<=last;row++)for(let col=1;col<=20;col++){
  const c=sh.getCell(row,col);c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
  if(!c.font)c.font={name:'Arial',size:8,color:{argb:'FF000000'}};
 }
 sh.printArea='A1:T'+last;
 sh.headerFooter.oddFooter='';sh.pageSetup.fitToHeight=1;
 return sh;
}
function makeWorkbookBack(wb,d){
 const sh=wb.addWorksheet('02 - Certificate',{views:[{showGridLines:false}],pageSetup:{
 paperSize:9,orientation:'landscape',fitToPage:true,fitToWidth:1,fitToHeight:1,
 margins:{left:.25,right:.25,top:.20,bottom:.19,header:0,footer:0},horizontalCentered:true
 }});
 sh.columns=[{width:120}];sh.properties.defaultRowHeight=19;
 const line=(v,height=23,bold=false,size=11,align='left')=>{
  const row=sh.addRow([v]);row.height=height;const c=row.getCell(1);
  c.font={name:'Arial',size,bold,color:{argb:'FF000000'}};
  c.alignment={horizontal:align,vertical:'middle',wrapText:true};
  c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
 };
 line('CERTIFICATE',31,false,17,'center');
 line('EMRS Karanjiya',25,true,13,'center');
 line('',12);
 certifications.forEach((c,i)=>{line(c,c.length>180?54:c.length>110?36:25,false,10);if(i===7)line('',12)});
 line('',18);
 line('Signature ................................................',24,false,10,'right');
 line('Designation of the employee',22,false,10,'right');
 line('Dated: '+D(d.employeeAdvanceDate||d.signatureDate)+' ................',26,false,10);
 line('',13);
 line('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER',30,true,11,'center');
 officer.forEach(c=>line(c,c.length>130?44:27,false,10));
 line('',27);
 line('Dated: '+D(d.controllingDate)+' ................                   Signature ................................',27,false,10);
 sh.printArea='A1:A'+sh.rowCount;
 return sh;
}
async function makeExcel(d){
 const wb=new ExcelJS.Workbook();wb.creator='EMRS Claim Forms by worksbeyond';wb.created=new Date();
 makeWorkbookFront(wb,d);makeWorkbookBack(wb,d);
 const bin=await wb.xlsx.writeBuffer();
 save(new Blob([bin],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),fileName(d,'xlsx'));
}
export async function exportTA(d,format){
 validate(d);
 if(format==='pdf')return makePdf(d);
 if(format==='docx')return makeWord(d);
 if(format==='xlsx')return makeExcel(d);
 throw Error('Unsupported TA/DA export format');
}
