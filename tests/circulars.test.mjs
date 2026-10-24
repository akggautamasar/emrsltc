import test from 'node:test';
import assert from 'node:assert/strict';
import {parseOfficial, extractPdf} from '../api/circulars.js';

const GENERAL = {key:'general',section:'General Circulars',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=938&lid=373'};
const EMPLOYEE = {key:'employee',section:'For Serving Employees',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=851&lid=487'};
const table = rows => '<html><body><table><tr><th>Circular</th><th>Date</th><th>Subject</th><th>Download</th></tr>' + rows.join('') + '</table></body></html>';

test('parses actual NESTS-style rows without inventing a document link', () => {
  const html = table([
    '<tr><td><b>#244</b></td><td>28-09-2026</td><td>Annual Financial Statements &amp; Notes</td><td><a href="/WriteReadData/RTF1984/1790569476.pdf">PDF</a></td></tr>',
    '<tr><td>#243</td><td>03-09-2026</td><td>Mentor &ndash; Mentee Programme</td><td>Download pending</td></tr>'
  ]);
  const records = parseOfficial(html,GENERAL);
  assert.equal(records.length,2);
  assert.deepEqual(records.map(x=>x.number),[244,243]);
  assert.equal(records[0].title,'Annual Financial Statements & Notes');
  assert.equal(records[0].date,'2026-09-28');
  assert.equal(records[0].pdfUrl,'https://nests.tribal.gov.in/WriteReadData/RTF1984/1790569476.pdf');
  assert.equal(records[1].pdfUrl,null);
});

test('employee corner and general circular numbers stay separate', () => {
  const html=table(['<tr><td>#39</td><td>25/03/2026</td><td>Medical Card Generation</td><td><a href="https://nests.tribal.gov.in/WriteReadData/RTF1984/1774419983.pdf">PDF</a></td></tr>']);
  const emp=parseOfficial(html,EMPLOYEE);
  const general=parseOfficial(html,GENERAL);
  assert.equal(emp[0].id,'employee-39');
  assert.equal(general[0].id,'general-39');
  assert.notEqual(emp[0].id,general[0].id);
});

test('unsafe off-domain PDF URLs are never treated as NESTS originals', () => {
  assert.equal(extractPdf('<a href="https://example.org/fake.pdf">PDF</a>',GENERAL.url),null);
  assert.equal(extractPdf('No PDF link supplied',GENERAL.url),null);
});

test('rejects impossible dates, duplicate numbers and non-circular rows', () => {
  const html = table([
    '<tr><td>#17</td><td>31-02-2026</td><td>Invalid dated entry</td><td>—</td></tr>',
    '<tr><td>#18</td><td>28-02-2026</td><td>Correct entry</td><td>—</td></tr>',
    '<tr><td>#18</td><td>28-02-2026</td><td>Duplicate entry</td><td>—</td></tr>',
    '<tr><td>Unknown</td><td>28-02-2026</td><td>Not a circular</td><td>—</td></tr>'
  ]);
  const rows=parseOfficial(html,GENERAL);
  assert.equal(rows.length,1);
  assert.equal(rows[0].number,18);
  assert.equal(rows[0].title,'Correct entry');
});
