import {test,expect} from '@playwright/test';
import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import ExcelJS from 'exceljs';
async function downloaded(page,format,extension){
 const promise=page.waitForEvent('download',{timeout:60000});
 await page.getByRole('button',{name:new RegExp('Download '+format,'i')}).click();
 const file=await promise;
 expect(file.suggestedFilename()).toMatch(new RegExp('\\.'+extension+'$'));
 expect(await file.failure()).toBeNull();
 const path=await file.path();
 const bytes=await readFile(path);
 expect((await stat(path)).size).toBeGreaterThan(350);
 if(extension==='pdf')expect(bytes.subarray(0,4).toString()).toBe('%PDF');
 else expect(bytes.subarray(0,2).toString()).toBe('PK');
 return {bytes,path};
}
test('dashboard renders all three claim types and branding',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Claim forms.*made effortless/i})).toBeVisible();
 await expect(page.getByRole('button',{name:/LTC Claim Form/})).toBeVisible();
 await expect(page.getByRole('button',{name:/Medical Reimbursement/})).toBeVisible();
 await expect(page.getByRole('button',{name:/TA & DA Claim Form/})).toBeVisible();
 await expect(page.getByText('Made with')).toBeVisible();
});
test('LTC form edits and exports PDF Word and Excel',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#ltc');
 await page.getByLabel('Full name').fill('Test Employee');
 await page.getByLabel('Designation').fill('Principal');
 await page.getByLabel('Name',{exact:true}).fill('Test Employee');
 await page.getByLabel('Age',{exact:true}).fill('45');
 await downloaded(page,'PDF','pdf');
 await downloaded(page,'Word','docx');
 await downloaded(page,'Excel','xlsx');
 expect(errors).toEqual([]);
});
test('medical statement generates all three formats',async({page})=>{
 await page.goto('/#medical');
 await page.getByLabel('Name of employee').fill('Medical Test');
 await page.getByLabel('Medical claim amount (Rs.)').fill('1350');
 await expect(page.getByText('₹1,350').first()).toBeVisible();
 await downloaded(page,'PDF','pdf');
 await downloaded(page,'Word','docx');
 await downloaded(page,'Excel','xlsx');
});
test('TA/DA mileage totals and formats',async({page})=>{
 await page.goto('/#ta');
 await page.getByLabel('Employee name').fill('TA Test');
 await page.getByLabel('Distance (km)').fill('10');
 await page.getByLabel('Rate per km (Rs.)').fill('10');
 await page.getByLabel('DA days / fraction').fill('1');
 await page.getByLabel('DA rate (Rs.)').fill('250');
 await expect(page.getByText('₹350').first()).toBeVisible();
 await downloaded(page,'PDF','pdf');
 await downloaded(page,'Word','docx');
 await downloaded(page,'Excel','xlsx');
});

test('TA/DA files are exactly two sides and retain bill column structure',async({page})=>{
 await page.goto('/#ta');
 await page.getByLabel('Employee name').fill('Two Page Test');
 await page.getByLabel('DA rate (Rs. or %)').fill('70%');
 await page.getByLabel('Daily allowance amount (Rs.)').fill('437.5');
 const pdf=await downloaded(page,'PDF','pdf');
 const pageCount=(pdf.bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
 expect(pageCount).toBe(2);
 const doc=await downloaded(page,'Word','docx');
 const xml=execFileSync('unzip',['-p',doc.path,'word/document.xml'],{encoding:'utf8'});
 expect(xml).toContain('CERTIFICATE TO BE FURNISHED BY CONTROLLING OFFICER');
 expect(xml).toMatch(/w:pageBreakBefore/);
 const excel=await downloaded(page,'Excel','xlsx');
 const wb=new ExcelJS.Workbook();
 await wb.xlsx.load(excel.bytes);
 expect(wb.worksheets.map(s=>s.name)).toEqual(['01 - TA DA Bill','02 - Certificate']);
 expect(wb.worksheets[0].pageSetup.fitToHeight).toBe(1);
 expect(wb.worksheets[1].pageSetup.fitToHeight).toBe(1);
 expect(wb.worksheets[0].getCell('G5').value).toBe('Kind of journey');
 expect(wb.worksheets[0].getCell('S9').value).toBe(437.5);
 expect(wb.worksheets[1].getCell('A1').value).toBe('CERTIFICATE');
});
