const groupIntro={
'Leave & Attendance':'I respectfully submit this request concerning my attendance and leave arrangements. The relevant dates and circumstances are furnished below for examination and necessary approval.',
'Transfers & Posting':'I respectfully submit this representation concerning my posting and transfer-related circumstances. I request that the matter be examined in accordance with the applicable transfer policy and administrative requirements.',
'Salary & Allowances':'I respectfully bring to your notice a matter concerning my pay, allowances or related service entitlements. I request verification of the relevant records and necessary action under the applicable rules.',
'Service & Permissions':'I respectfully seek your consideration and permission in connection with the service matter stated in the subject. The relevant particulars are submitted for examination and further necessary action.',
'School & Workplace':'I respectfully submit this request in the interest of effective discharge of official duties and smooth functioning of the institution. The issue and its practical implications are set out below.',
'Medical & Family':'I respectfully submit this request in connection with the medical or family-related circumstances stated in the subject. The relevant facts and supporting documents are provided for your consideration.',
'Grievances & Representations':'I respectfully submit this representation for examination of the matter mentioned above. I request an objective consideration of the facts and relevant records in accordance with the applicable procedure.',
'Retirement & Separation':'I respectfully submit this application concerning the settlement of service-related formalities and benefits. I request verification of the relevant records and timely action as admissible under applicable rules.'
};
const specials=[
[/salary not credited|salary arrears|final salary settlement/i,['The payment relating to the relevant period has not been received or requires reconciliation.','I request verification of the payroll records, identification of any pending discrepancies and release of admissible dues after due scrutiny.']],
[/transfer on medical grounds/i,['My request is based on medical circumstances that require consideration while determining a suitable place of posting.','I request sympathetic consideration, subject to the applicable transfer policy, administrative feasibility and supporting medical documents.']],
[/transfer on spouse grounds/i,['My request concerns the place of posting of my spouse and the practical difficulties arising from our separate postings.','I request consideration of an appropriate posting, subject to applicable transfer guidelines and availability.']],
[/noc|permission for competitive examination|permission for higher studies|forwarding application/i,['I seek prior permission or forwarding through the proper channel, as may be required under the applicable service and conduct rules.','I undertake to comply with all applicable conditions and request issuance of the necessary permission or NOC, if admissible.']],
[/pay fixation|increment|incorrect salary deduction/i,['I request examination of the applicable pay fixation, increment or deduction entries in my service and payroll records.','If any discrepancy is found, I request correction of the relevant entries and consequential admissible financial adjustment.']],
[/medical reimbursement|medical advance|medical card/i,['The matter concerns medical facilities or reimbursement and the relevant treatment or dependent particulars.','I request examination of the supporting records and processing of the matter as admissible under the applicable medical rules.']],
[/leave request|leave extension|medical leave|leave cancellation/i,['I request consideration of the specified leave period and grounds, subject to verification of eligibility, leave balance and institutional requirements.','Where a prescribed leave application form is mandatory, I shall submit it through the proper channel along with the necessary supporting documents.']],
[/show-cause/i,['I submit this response with reference to the notice received and request that the factual circumstances and enclosed records be taken on record.','I request that my explanation be considered objectively before any decision is taken, and that an opportunity to provide further clarification be afforded if required.']],
[/grievance|representation|appeal|reconsideration/i,['I request review of the facts and relevant orders or records concerning the matter, including any earlier representation.','I request a reasoned decision and communication of the outcome through the appropriate official channel.']]
];
export function composeApplication(item,d){
 const title=item.title;
 const intro=groupIntro[item.category]||groupIntro['Service & Permissions'];
 const match=specials.find(([re])=>re.test(title));
 const facts=(d.details||'').trim();
 const period=d.from||d.to?'The relevant period is '+[d.from,d.to].filter(Boolean).join(' to ')+'.':'';
 const reference=d.reference?'This application refers to '+d.reference.trim()+'.':'';
 const context=d.background?.trim()||'';
 const impact=d.impact?.trim()||'';
 const request=d.request?.trim()||'';
 const prior=d.prior?.trim()||'';
 const paragraphs=[
 intro,
 reference,
 context?'Background: '+context:'',
 facts?'Facts and circumstances: '+facts:'',
 period,
 impact?'Consequences / grounds for consideration: '+impact:'',
 match?match[1][0]:'',
 prior?'Earlier correspondence / steps taken: '+prior:'',
 request?'Relief requested: '+request:match?match[1][1]:'I request that the matter be examined and appropriate action be taken as per the applicable rules.',
 'I shall furnish any further information or documents that may be required and shall comply with the instructions of the competent authority.'
 ].filter(Boolean);
 return paragraphs;
}
