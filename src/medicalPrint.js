
/** Print-oriented NESTS Medical Reimbursement — Annexure-I, pages 8–9 of the 2024 rules. */
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import {jsPDF} from 'jspdf';
import {Document,Packer,Paragraph,TextRun,Table,TableRow,TableCell,AlignmentType,WidthType,PageOrientation,BorderStyle,VerticalAlign} from 'docx';
import {dateText,medicalTotal} from './schema.js';

const S=v=>v==null?'':String(v);
const rup=v=>S(v).trim()===''?'':Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});
const claimName=d=>'Medical_Reimbursement_'+(S(d.cardHolder).replace(/[^a-z0-9 ]/gi,'').trim().replace(/\s+/g,'_')||'Claim');
const fullContact=d=>[S(d.mobile),S(d.email)].filter(Boolean).join(' | ');
const advance=d=>S(d.advanceDetails);
const declaration='I hereby declare that the statements made in the application are true to the best of my knowledge and belief and the person for whom medical expenses were incurred is wholly dependent on me. I agree for the reimbursement as is admissible under the rules.';
const sections1=d=>[
 ['1. (a)','Name of the Medical Card Holder',S(d.cardHolder)],
 ['(b)','Medical Card No.',S(d.medicalCardNo)],
 ['(c)','Basic Pay',rup(d.basicPay)],
 ['(d)','Full Address',S(d.fullAddress)],
 ['(e)','Mobile No. and e-mail address, if any',fullContact(d)],
 ['2. (a)',"Patient's Name",S(d.patientName)],
 ['(b)','Relationship with the Medical card holder',S(d.relationship)],
 ['3.','Name & address of the hospital / diagnostic center / imaging center where treatment is taken or tests done',S(d.hospitalDetails)],
 ['4.','Whether the hospital/diagnostic/imaging center is empaneled under CGHS',S(d.cghsEmpanelled)],
 ['5.','Treatment for which reimbursement claimed',''],
 ['(a)','OPD Treatment / Test & investigations / Medicines',S(d.opdTreatment)],
 ['(b)','Indoor Treatment',S(d.indoorTreatment)],
 ['6.','Whether treatment was taken in emergency',S(d.emergency)]
];
const sections2=d=>[
 ['7.','Whether subscribing to any health/medical insurance scheme',S(d.hasInsurance)+(d.insuranceClaimed?' ; Amount claimed / received (Rs.): '+rup(d.insuranceClaimed):'')],
 ['8.','Details of Medical Advance taken, if any',advance(d)],
 ['9.','Total amount claimed',''],
 ['(a)','OPD Treatment',rup(d.opdAmount)],
 ['(b)','Tests / Investigation',rup(d.investigationAmount)],
 ['(c)','Medicines',rup(d.medicineAmount)],
 ['(d)','Indoor Treatment',rup(d.indoorAmount)]
];
function validate(d){
 if(!d||typeof d!=='object')throw Error('Medical claim data is missing.');
 if(Object.values(d).some(v=>S(v).length>1000))throw Error('Please shorten exceptionally long medical form entries so they fit the two-page Annexure-I.');
}
const deliver=(blob,filename)=>{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)};

function medPdf(d){
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 const W=210,left=17,right=193,labelX=46,valX=128;
 const text=(str,x,y,width,pt=9,style='normal')=>{
  pdf.setFont('times',style);pdf.setFontSize(pt);return pdf.splitTextToSize(S(str),width);
 };
 const print=(str,x,y,width,pt=9,style='normal')=>{const lines=text(str,x,y,width,pt,style);pdf.text(lines,x,y,{lineHeightFactor:1.12});return lines.length};
 const title=()=>{
  pdf.setFont('times','italic');pdf.setFontSize(9);pdf.text('ANNEXURE- I',right,19,{align:'right'});
  pdf.setFont('times','bold');pdf.setFontSize(11.5);
  pdf.text('NATIONAL EDUCATION SOCIETY FOR TRIBAL STUDENTS, NEW DELHI',W/2,31,{align:'center'});
  pdf.text('MEDICAL REIMBURSEMENT CLAIM FORM',W/2,39,{align:'center'});
  pdf.setFontSize(10);pdf.text('(To be filled up by the Medical Card holder in BLOCK LETTERS)',W/2,52,{align:'center'});
 };
 const entry=(no,label,value,y)=>{
  const n=text(label,labelX,y,78,9.5),v=text(value,valX,y,62,9.5);
  const lines=Math.max(n.length,v.length,1);
  if(y+lines*4.5>260)throw Error('The medical form text exceeds the Annexure-I front page. Shorten unusually long fields.');
  print(no,left,y,25,9.5);
  pdf.text(n,labelX,y,{lineHeightFactor:1.15});
  print(':',124,y,4,9.5);
  pdf.text(v,valX,y,{lineHeightFactor:1.15});
  return y+Math.max(8.5,lines*4.8+3.8);
 };
 title();
 let y=64;
 sections1(d).forEach(([n,l,v],i)=>{y=entry(n,l,v,y);if(i===6||i===7)y+=2});
 pdf.setFont('helvetica','normal');pdf.setFontSize(8);
 pdf.text('Page 1 of 2',W/2,283,{align:'center'});
 pdf.addPage();
 y=27;
 sections2(d).forEach(([n,l,v],i)=>{y=entry(n,l,v,y);if(i===1)y+=7});
 if(y>125)throw Error('Medical claim entries exceed the second page limit.');
 pdf.setFont('times','bold');pdf.setFontSize(12);
 pdf.text('DECLARATION',W/2,143,{align:'center'});
 pdf.setFont('times','normal');pdf.setFontSize(10);
 const statement=pdf.splitTextToSize(declaration,174);
 pdf.text(statement,left,159,{lineHeightFactor:1.45});
 pdf.setFont('times','bold');pdf.setFontSize(9.8);
 pdf.text('Date: '+dateText(d.date),left+10,189);
 pdf.text('Place: '+S(d.place),left+10,202);
 pdf.text('Signature of the Medical Card holder',W-20,202,{align:'right'});
 pdf.setFont('helvetica','normal');pdf.setFontSize(8);
 pdf.text('Page 2 of 2',W/2,283,{align:'center'});
 if(pdf.internal.getNumberOfPages()!==2)throw Error('Medical PDF must contain exactly two pages.');
 pdf.save(claimName(d)+'.pdf');
}
const border={style:BorderStyle.SINGLE,size:3,color:'DDDDDD'};
const none={style:BorderStyle.NONE,size:0};
const borders={top:none,bottom:none,left:none,right:none};
const par=(s,size=19,bold=false,alignment=AlignmentType.LEFT,after=70)=>new Paragraph({alignment,spacing:{after},children:[new TextRun({text:S(s),font:'Times New Roman',size,bold})]});
const docCell=(s,width,size=18,bold=false)=>new TableCell({width:{size:width,type:WidthType.DXA},borders,verticalAlign:VerticalAlign.CENTER,margins:{top:90,bottom:90,left:25,right:25},children:[par(s,size,bold,AlignmentType.LEFT,0)]});
const docTable=(data)=>new Table({width:{size:10100,type:WidthType.DXA},columnWidths:[950,5300,3850],rows:data.map(([no,label,value])=>new TableRow({children:[docCell(no,950),docCell(label,5300),docCell(':  '+value,3850)]}))});
async function medWord(d){
 const first=[
 par('ANNEXURE- I',18,false,AlignmentType.RIGHT,160),
 par('NATIONAL EDUCATION SOCIETY FOR TRIBAL STUDENTS, NEW DELHI',21,true,AlignmentType.CENTER,70),
 par('MEDICAL REIMBURSEMENT CLAIM FORM',22,true,AlignmentType.CENTER,230),
 par('(To be filled up by the Medical Card holder in BLOCK LETTERS)',20,true,AlignmentType.CENTER,300),
 docTable(sections1(d))
 ];
 const second=[
 new Paragraph({pageBreakBefore:true,children:[new TextRun({text:'',size:2})]}),
 docTable(sections2(d)),
 par('DECLARATION',22,true,AlignmentType.CENTER,180),
 par(declaration,20,false,AlignmentType.LEFT,230),
 par('Date: '+dateText(d.date),20,true,AlignmentType.LEFT,180),
 par('Place: '+S(d.place),20,true),
 par('Signature of the Medical Card holder',20,true,AlignmentType.RIGHT)
 ];
 const doc=new Document({creator:'EMRS Claim Forms by worksbeyond',sections:[{
  properties:{page:{size:{width:11906,height:16838,orientation:PageOrientation.PORTRAIT},margin:{top:780,bottom:720,left:690,right:690}}},
  children:[...first,...second]
 }]});
 deliver(await Packer.toBlob(doc),claimName(d)+'.docx');
}
const WHITE={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFFFFF'}};
const FONT={name:'Times New Roman',size:11,color:{argb:'FF111111'}};
function medExcel(d){
 const book=new ExcelJS.Workbook();book.creator='EMRS Claim Forms by worksbeyond';book.created=new Date();
 function sheet(name){const ws=book.addWorksheet(name,{views:[{showGridLines:false}],pageSetup:{paperSize:9,orientation:'portrait',fitToPage:true,fitToWidth:1,fitToHeight:1,margins:{left:.45,right:.45,top:.65,bottom:.55,header:0,footer:0},horizontalCentered:true}});ws.columns=[{width:10},{width:49},{width:4},{width:43}];ws.properties.defaultRowHeight=23;return ws;}
 function line(ws,row,a,b,value,center=false,bold=false,height=23){
  if(a<b)ws.mergeCells(row,a,row,b);
  const c=ws.getCell(row,a);c.value=S(value);c.font={...FONT,bold};c.alignment={horizontal:center?'center':'left',vertical:'middle',wrapText:true};c.fill=WHITE;ws.getRow(row).height=height;
 }
 function cells(ws,start,list){
  let r=start;
  for(const [n,label,v] of list){
   const long=label.length>75||S(v).length>110;const height=long?65:label.length>45||S(v).length>45?45:30;
   line(ws,r,1,1,n,false,false,height);
   line(ws,r,2,2,label);
   line(ws,r,3,3,':');
   line(ws,r,4,4,v);
   ws.getCell(r,4).border={bottom:{style:'hair',color:{argb:'FFBBBBBB'}}};
   r++;
  }
  return r;
 }
 const front=sheet('01 - Medical Claim');
 line(front,1,1,4,'ANNEXURE- I',false,false,25);
 line(front,3,1,4,'NATIONAL EDUCATION SOCIETY FOR TRIBAL STUDENTS, NEW DELHI',true,true,25);
 line(front,4,1,4,'MEDICAL REIMBURSEMENT CLAIM FORM',true,true,26);
 line(front,6,1,4,'(To be filled up by the Medical Card holder in BLOCK LETTERS)',true,true,25);
 cells(front,9,sections1(d));
 front.pageSetup.printArea='A1:D26';
 const back=sheet('02 - Declaration');
 cells(back,3,sections2(d));
 line(back,12,1,4,'DECLARATION',true,true,30);
 line(back,14,1,4,declaration,false,false,80);
 line(back,18,1,2,'Date: '+dateText(d.date));
 line(back,20,1,2,'Place: '+S(d.place));
 line(back,20,3,4,'Signature of the Medical Card holder');
 back.pageSetup.printArea='A1:D25';
 return book;
}
async function makeExcel(d){
 const book=medExcel(d);
 const bin=await book.xlsx.writeBuffer();
 deliver(new Blob([bin],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),claimName(d)+'.xlsx');
}
export async function exportMedical(d,format){
 validate(d);
 if(format==='pdf')return medPdf(d);
 if(format==='docx')return medWord(d);
 if(format==='xlsx')return makeExcel(d);
 throw Error('Unsupported medical export format.');
}
