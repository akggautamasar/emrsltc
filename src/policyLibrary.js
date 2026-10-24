/**
 * Carefully scoped official-source reference notes for the four EMRS claim forms.
 * All URLs refer to government-hosted PDFs/portals verified 24 Oct 2026.
 * Distinguish NESTS adoption/instructions from general central-service context.
 * Never auto-decide eligibility, approvals, rate ceilings, or reimbursement.
 */
export const policyLibrary = {
  ltc: {
    title: 'LTC — NESTS / CCS (LTC) Rules',
    reference: 'NESTS/H-1/75/HR Misc./2024-25 (Part-I) · 30 May 2025',
    notice: 'For EMRS employees, begin with the NESTS LTC circular of 30 May 2025. It expressly refers to CCS (LTC) Rules, 1988, as amended, and includes DoPT consolidated instructions of 30 April 2024 as Annexure-A. Central Government orders issued afterward must also be checked. Rules are summarised here for preparing documents, not for determining a claim entitlement.',
    sources: [
      {id:'ltc-nests', agency:'NESTS · EMRS-specific', title:'Guidelines for regulating LTC Claim', date:'30 May 2025', url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1748954065.pdf', details:'Official NESTS circular plus the 12-page DoPT consolidated 2024 instructions as Annexure-A', kind:'PDF · primary'},
      {id:'ltc-dopt-2024', agency:'DoPT · annexed official OM', title:'Guidelines on Leave Travel Concession — DoPT-1714455840135', date:'30 April 2024', url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1748954065.pdf#page=2', details:'Exact DoPT consolidated OM reproduced within NESTS official circular, starting at PDF page 2', kind:'PDF · original annexure'},
      {id:'ltc-faqs', agency:'DoPT · original government OM', title:'Official FAQs on CCS (LTC) Rules, 1988 · OM 31011/07/2025 PP.A-IV', date:'1 July 2025', url:'https://documents.doptcirculars.nic.in/D2/D02est/FAQs%20on%20LTC5hctT.pdf', details:'Direct original 21-page DoPT FAQ on eligible family, dependency, blocks, class, ticket booking, advances, travel proof and concessions. Includes next block 2026–29; check later orders.', kind:'PDF · primary DoPT FAQ'},
      {id:'ltc-dopt-portal', agency:'DoPT · official document register', title:'DoPT circulars repository — latest LTC amendments', date:'Continuously updated', url:'https://dopt.gov.in/documents/orders-and-notices', details:'Check post-2024 LTC amendments, special air concessions and latest FAQs here before relying on a route or benefit', kind:'Official portal'}
    ],
    groups: [
      {title:'Who may claim? Service requirement and sanction', page:'NESTS circular, page 1 · points (a)–(d)', sources:['ltc-nests','ltc-dopt-2024'], points:[
        'Submit an LTC request together with the applicable leave request before the outward journey. Obtain prior approval/sanction from the competent authority; the website does not grant this permission.',
        'NESTS directs the office to verify eligibility and at least one year of service on the date the outward journey starts.',
        'For fresh NESTS recruits, the circular describes Home Town LTC for three occasions and Anywhere-in-India LTC on the fourth occasion within a four-year block, for the first two applicable four-year blocks. Determine the employee’s actual block and recruitment history before applying this arrangement.',
        'Technical-resignation cases are addressed separately: the 2025 NESTS direction treats such employees at par with fresh recruits until the previous service is counted by NESTS and relevant orders are issued.'
      ]},
      {title:'LTC blocks, home town, anywhere in India and family', page:'DoPT consolidated instructions · Annexure-A, pages 2 onward', sources:['ltc-dopt-2024','ltc-faqs'], points:[
        'The ordinary LTC system distinguishes Home Town LTC and Anywhere-in-India LTC, within the applicable two-year and four-year block scheme. Family members can travel separately subject to the rules.',
        'Check the declared home town, family eligibility, spouse claims, block entitlement and prior LTC recorded in the service book. Do not infer an unused LTC merely because a draft form has no earlier entries.',
        'The DoPT FAQs of 1 July 2025 explicitly identify 2026–2029 as the next four-year LTC block, with ordinary sub-blocks 2026–27 and 2028–29 where applicable. Check the employee’s home town declaration, entitlement pattern, carried-forward concession and subsequent orders.',
        'Special provisions for fresh recruits, family dependency, married/widowed daughters, adopted/stepchildren and spouse employment must be checked against the original CCS LTC rules and later FAQs.'
      ]},
      {title:'Leave, vacation, weekend and journey conditions', page:'NESTS circular, page 1 · (f), (h)', sources:['ltc-nests'], points:[
        'NESTS says LTC is not admissible for a weekend-only journey without any leave. It says LTC may be used during eligible leave including casual leave, special casual leave, child care leave and study leave; vacation counts as regular leave for this purpose.',
        'LTC reimbursement is for a point-to-point journey on the shortest direct route, subject to the entitlement and conditions; local journeys and incidental expenditure are excluded.',
        'Show actual travel dates, journey segments, class/mode and fare paid accurately, and retain the required evidence of travel.'
      ]},
      {title:'Travel class, premium trains and air journeys', page:'NESTS circular, point (g) · DoPT Annexure-A', sources:['ltc-nests','ltc-dopt-2024','ltc-dopt-portal'], points:[
        'NESTS links LTC travel entitlement to the Ministry of Finance TA order of 13 July 2017, but explicitly states that the air entitlement for Pay Levels 6–8 applies to official TA, not ordinary LTC.',
        'Air-ticket booking rules depend on whether an employee is entitled to air travel, the type of LTC journey and any special dispensation. Where authorised agents or lowest-fare procedures are mandated, follow the relevant order and preserve evidence.',
        'DoPT has issued later directions about premium trains and region-specific air concessions. A further DoPT special-air-LTC extension was issued on 9 September 2026 for eligible NER, J&K, Ladakh and A&N travel through 25 September 2028; verify the original current OM, categories and exact conditions through the DoPT order register before booking.'
        'An itinerary or fare higher than an eligible shortest-route equivalent may be restricted. Do not calculate a reimbursement ceiling solely from ticket price.'
      ]},
      {title:'LTC advance, tickets and claim deadlines', page:'NESTS circular, point (e) · DoPT Annexure-A', sources:['ltc-nests','ltc-dopt-2024'], points:[
        'NESTS permits LTC advance, when applied for and sanctioned, up to 80% of the estimated outward and return travel cost.',
        'The employee must produce the outward ticket within 10 days of drawing the advance and submit the reimbursement/adjustment claim within one month after completing the return journey. Failure triggers recovery of the advance in a lump sum under the NESTS instructions.',
        'The general DoPT document sets claim-filing limits and rules for journeys without an advance, relaxation and supporting evidence. Verify which deadline and any authorised relaxation apply to the individual claim.',
        'Record the advance amount, actual fare paid, adjustment and whether the employee has submitted tickets for each relevant leg.'
      ]},
      {title:'Preparing the claim and mandatory office checks', page:'NESTS circular, points (a)–(i) · Annexure-A', sources:['ltc-nests','ltc-dopt-2024'], points:[
        'Retain sanctioned LTC/leave requests, approved destination and home-town declaration where applicable, particulars of eligible family, ticket or journey proof, fare breakup and advance adjustment.',
        'The office must record the LTC availed in the employee’s service book and verify the relevant prior history; submitting this form does not replace those checks.',
        'Any Leave Encashment requested with LTC is a separate entitlement and approval exercise. Verify the applicable DoPT rules and the required advance declaration.',
        'Do not claim hotel, sightseeing, meals or local conveyance under LTC merely because they were incurred during travel.'
      ]}
    ]
  },
  ta: {
    title: 'TA & DA — NESTS / Ministry of Finance',
    reference: 'NESTS/H-4/Delegation of Powers to Principals/2024-25 · 22 May 2025',
    notice: 'NESTS issued a revised TA-bill approval procedure on 22 May 2025, superseding earlier instructions. It directs use of the Government of India travelling-allowance OM dated 13 July 2017, as amended. Official-tour TA is different from LTC and from transfer or retirement TA. No rate is computed automatically by this Rules viewer.',
    sources: [
      {id:'ta-nests',agency:'NESTS · EMRS-specific',title:'Clarification on approving/passing of bills for Travelling Allowance',date:'22 May 2025',url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1747996862.pdf',details:'Official travel approval/document table, transfer grant checklist and reference to Finance Ministry TA rules',kind:'PDF · primary'},
      {id:'ta-doe-2017',agency:'Department of Expenditure',title:'7th CPC Travelling Allowance Rules · OM 19030/1/2017-E.IV',date:'13 July 2017',url:'https://doe.gov.in/files/cenetral-pay_document/TA_English.pdf',details:'Central Government TA entitlements for tour/training, daily allowance, transfers and retirement; later amendments control where applicable',kind:'PDF · original OM'},
      {id:'ta-doe-2018',agency:'Department of Expenditure',title:'Daily Allowance when boarding/lodging is provided free',date:'1 February 2018',url:'https://doe.gov.in/files/cenetral-pay_document/OM_dt_01_02_18_Eng_0.pdf',details:'Clarifies local conveyance reimbursement during free boarding/lodging and removal of the earlier 25% DA arrangement',kind:'PDF · clarification'},
      {id:'ta-doe-2022',agency:'Department of Expenditure',title:'TA on transfer to/from NER, Islands and Ladakh',date:'16 June 2022',url:'https://doe.gov.in/files/circulars_document/DoE_OM_dated_16_06_2022.pdf',details:'Specific instructions on transfer of personal effects and vouchers; not an ordinary-tour allowance',kind:'PDF · clarification'},
      {id:'ta-doe-portal',agency:'Department of Expenditure',title:'Travelling Allowance and Related Matters — circulars register',date:'Continuously updated',url:'https://doe.gov.in/en/orders-circulars/44',details:'Check supplementary OMs for time limits, vouchers, air travel and changes affecting claim dates',kind:'Official portal'}
    ],
    groups: [
      {title:'NESTS approving authority — official visits',page:'NESTS circular · page 1',sources:['ta-nests'],points:[
        'For official visits directed by NESTS, the May 2025 circular identifies the Principal as the approving authority and calls for the NESTS office order, tickets, applicable reimbursement bills, relieving order and completed prescribed TA bill.',
        'For visits directed by the State Society, it identifies the Principal (including self) as approving authority. Outstation travel requires an approved post-journey Tour Diary from the State Society, tickets, bills where applicable, any relieving order and the TA bill.',
        'For local travel directed by the State Society, the circular calls for State Society approval of the month’s journeys and the prescribed TA bill.',
        'The 22 May 2025 clarification supersedes earlier instructions on approving/passing TA bills. Confirm later NESTS delegations or local administrative directions before sanctioning any expenditure.'
      ]},
      {title:'Travel entitlement by pay level and journey mode',page:'DoE OM of 13 July 2017 · travel entitlement annexure',sources:['ta-doe-2017','ta-doe-portal'],points:[
        'The Ministry of Finance 7th CPC OM regulates permissible mode/class of travel by the employee’s Pay Level under the relevant rules and exceptions.',
        'The 2017 domestic tour matrix provides: Levels 14+ Business/Club air or AC-I train; Levels 12–13 Economy air or AC-I train; Levels 6–11 Economy air or AC-II train; Levels 5 and below First Class/AC-III/AC Chair Car train.',
        'These are official-tour entitlements, not blanket LTC airfare entitlements. NESTS expressly cautions about Levels 6–8 in its LTC circular.',
        'Any personal upgrade, indirect route, cancellation charge or private vehicle mileage requires separate eligibility review.'
      ]},
      {title:'Daily allowance: accommodation, food and local conveyance',page:'DoE 2017 OM · DA annexure; 2018 clarification',sources:['ta-doe-2017','ta-doe-2018'],points:[
        'Daily allowance on tour is subject to distinct rules for accommodation, food and local travel; do not simply multiply days by a made-up uniform rate.',
        'The 2017 OM links admissible amounts and hotel/local transport conditions to Pay Level. Food allowance varies with duration of absence and must be assessed under the applicable rules.',
        'The 1 February 2018 clarification states that if free boarding and lodging are provided, actual eligible local travel expenses may still be claimed; the older flat 25% DA and 5th-CPC DA option were discontinued.',
        'Any amount shown in the form is an employee-entered draft, not a confirmed approved entitlement. Confirm 7th CPC rate revisions and later 25%-increase triggers before entering a ceiling.'
      ]},
      {title:'Tickets, tour diary, receipts and departure/arrival entries',page:'NESTS May 2025 checklist · DoE 2017 rules',sources:['ta-nests','ta-doe-2017'],points:[
        'For each journey record departure location/date/time, arrival location/date/time, mode and actual fare, supported by appropriate ticket/boarding proof.',
        'Keep the sanctioning/tour order, approved tour diary where required, reimbursement bills, supporting taxi/hotel receipts and any relieving order.',
        'Record all journey segments accurately, including local travel and relevant halt periods. Duplicate reimbursements or claims already met by organisers must not be included.',
        'The form’s two-sided travel bill is a preparation aid; pre-audit and competent-authority approval are separate from document generation.'
      ]},
      {title:'Transfer grant is not ordinary tour TA',page:'NESTS May 2025 circular · page 2',sources:['ta-nests','ta-doe-2017','ta-doe-2022'],points:[
        'For transfer grant, the NESTS circular identifies the Principal as approving authority for other staff and the State Society for Principals.',
        'Documents specified for transfer-grant cases include transfer order, joining order, last pay certificate, applicable reimbursement bills and the prescribed TA bill.',
        'The Finance Ministry has separate rules for Composite Transfer Grant, transportation of personal effects, family travel and transfer to or from special regions. Do not apply tour DA rates to a transfer claim.',
        'The June 2022 Finance Ministry order changes voucher requirements in defined transfer cases involving NER, island territories and Ladakh.'
      ]},
      {title:'Claim submission, audit and exclusions',page:'DoE TA circulars register · NESTS instructions',sources:['ta-doe-portal','ta-nests'],points:[
        'Check current claim-filing deadlines and permitted relaxation using the Finance Ministry’s TA circular register and applicable administrative directions.',
        'Air travel on government account may carry authorisation and ticket-booking requirements; ensure tickets and boarding evidence meet the applicable circular.',
        'Verify receipts, approved tour route, travel entitlement, official purpose, any advance and whether accommodation or meals were provided free.',
        'This website does not certify an expenditure, approve DA, or replace the prescribed scrutiny and sanction workflow.'
      ]}
    ]
  },
  medical: {
    title: 'Medical Reimbursement — NESTS Medical Attendance',
    reference: 'NESTS Medical Attendance Rules 2024 · procedure dated 1 October 2025',
    notice: 'For EMRS staff, apply NESTS Medical Attendance Rules, 2024 and the NESTS procedure dated 1 October 2025 first. General Ministry of Health/CGHS/CS(MA) material is useful context for rates and hospitals only where expressly adopted by NESTS; it is not a substitute for the NESTS policy.',
    sources: [
      {id:'med-nests-2024',agency:'NESTS · primary service policy',title:'NESTS Medical Attendance Rules, 2024 and Annexure-I claim form',date:'23 December 2024',url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1735100833.pdf',details:'Policy on coverage, dependants, OPD/IPD, emergency, insurance, reimbursement and prescribed Annexure-I',kind:'PDF · primary'},
      {id:'med-nests-2025',agency:'NESTS · updated procedure',title:'Guidelines for Procedure for Medical Reimbursement',date:'1 October 2025',url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1759320282.pdf',details:'OPD/IPD document checklists, sanction hierarchy, record retention and exceptional hospital cases',kind:'PDF · current procedure'},
      {id:'med-health',agency:'Ministry of Health / CGHS',title:'CGHS portal — empanelment and current government rate references',date:'Current reference',url:'https://cghs.gov.in/',details:'General CGHS hospital/rate information. Use only to interpret rates where the NESTS medical policy adopts them; eligibility and approvals remain under NESTS.',kind:'Government reference portal'},
      {id:'med-portal',agency:'NESTS · official circular register',title:'NESTS General Circulars — later medical instructions',date:'Continuously updated',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&lid=373&ls_id=938',details:'Check for later medical-rate, medical-card, authorisation and reimbursement updates',kind:'Official portal'}
    ],
    groups: [
      {title:'October 2025: OPD reimbursement documents',page:'NESTS 1 Oct 2025 · page 1',sources:['med-nests-2025','med-nests-2024'],points:[
        'Submit completed Medical Reimbursement Annexure-I, original consultation/medicine/laboratory and investigation invoices (self-certified), a copy of the prescription and a medical-card copy where applicable.',
        'The 2025 instructions distinguish outdoor (OPD) and indoor (IPD) claims; use the appropriate list rather than the same checklist for both.',
        'The existing online form produces Annexure-I only; it does not upload bills or validate prescriptions.'
      ]},
      {title:'October 2025: IPD/emergency documents',page:'NESTS 1 Oct 2025 · page 1',sources:['med-nests-2025','med-nests-2024'],points:[
        'For indoor treatment provide prior permission (if any), original emergency certificate (if any), ex-post-facto approval for emergency treatment, original prescription, original self-certified itemised invoices, discharge summary and the completed Annexure-I.',
        'Obtain a hospital/diagnostic-centre breakup of investigations showing individual tests, exact number of tests, rates, and X-ray films where applicable; CGHS test-rate restrictions are relevant to admissible reimbursement.',
        'Include ambulance charges if claimed and a copy of the medical card where applicable. All documents still require examination by the appropriate office.'
      ]},
      {title:'October 2025: OPD and day-care sanction limits',page:'NESTS 1 Oct 2025 · page 2',sources:['med-nests-2025'],points:[
        'Principal: up to ₹5,000 per case, subject to ₹25,000 per employee in 12 months.',
        'State Society Nodal Officer/Regional Office in-charge: above ₹5,000 per case or above ₹25,000 in 12 months, subject to an overall ceiling of ₹1,00,000 per employee.',
        'Cases beyond these delegated powers go to the Additional/Joint Commissioner, NESTS. These are approval-delegation limits, not automatic employee reimbursement entitlements.'
      ]},
      {title:'October 2025: IPD and emergency sanction limits',page:'NESTS 1 Oct 2025 · page 2',sources:['med-nests-2025'],points:[
        'Principal: up to ₹1,00,000 per employee in 12 months.',
        'State Society Nodal Officer/Regional Office in-charge: above ₹1,00,000 and up to ₹5,00,000 per employee in 12 months.',
        'Cases beyond those amounts are referred to the Additional/Joint Commissioner, NESTS. All sums remain subject to policy, medical scrutiny and admissible rates.'
      ]},
      {title:'Pre-audit, escalation and payment workflow',page:'NESTS 1 Oct 2025 · pages 2–3',sources:['med-nests-2025'],points:[
        'The EMRS accountant/official scrutinises and pre-audits medical bills, including claims relating to the Principal.',
        'Submit pre-audited claims to the Principal. Claims beyond the Principal’s delegated powers go with recommendation to State EMRS Society; cases beyond State Society limits go to NESTS HQ through the prescribed examination.',
        'The appropriate sanctioning authority processes the reimbursement, and the EMRS office records the sanctioned amount in the HRMS and salary-processing workflow.',
        'NESTS calls for a medical reimbursement register to be retained for ten years and medical bills for at least five years for audit.'
      ]},
      {title:'Private/non-empanelled hospitals and medical-card updates',page:'NESTS 1 Oct 2025 · page 3',sources:['med-nests-2025','med-portal'],points:[
        'NESTS specifies additional committee verification for emergency IPD treatment at hospitals other than NESTS/CGHS-empanelled or Central/State Government hospitals when the claim exceeds ₹1,00,000.',
        'The circular limits that exceptional committee route to emergency cases with a hospital-issued emergency certificate; a claim may still require other approvals and admissibility checks.',
        'Keep the NESTS medical card current; review NESTS later instructions on card generation and approval workflow rather than assuming every employee automatically has one.'
      ]}
    ]
  },
  cea: {
    title: 'Children Education Allowance & Hostel Subsidy',
    reference: 'NESTS clarification 21 April 2025 · revised approval guidelines 30 June 2025',
    notice: 'NESTS declared CEA/Hostel Subsidy admissible to EMRS employees under Government of India norms and provided the prescribed Annexure-B form in April 2025. Its revised approval guidelines dated 30 June 2025 must also be checked. Figures quoted from historical handbook pages are not automatically current payable rates.',
    sources: [
      {id:'cea-nests-apr',agency:'NESTS · primary policy and form',title:'Clarification on CEA and Hostel Subsidy · Annexures A/B',date:'21 April 2025',url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1745238066.pdf',details:'EMRS-specific clarification; reproduced government reference notes and prescribed Annexure-B pages 8–9',kind:'PDF · primary'},
      {id:'cea-nests-jun',agency:'NESTS · revised procedure',title:'Revised Guidelines for Approving Claims of CEA and Hostel Subsidy',date:'30 June 2025',url:'https://nests.tribal.gov.in/WriteReadData/RTF1984/1755757157.pdf',details:'Later approval instructions, take precedence in case of changes; verify the actual PDF before determining who sanctions a claim',kind:'PDF · later circular'},
      {id:'cea-dopt-year',agency:'DoPT OM · government-hosted copy',title:'CEA and Hostel Subsidy increase by 25% · DoPT A-27012/01/2023',date:'25 April 2024',url:'https://csharyana.gov.in/WriteReadData/Notifications-%26-Orders/Services-I/15038.pdf',details:'Official DoPT 2024 OM reproduced in a Haryana Government PDF. The ₹2,812.50/₹8,437.50 monthly figures relate to the stated 2024 effective date, not a live rate guarantee.',kind:'PDF · original DoPT OM'},
      {id:'cea-2026-faq',agency:'Department of Posts · Government of India',title:'Consolidated FAQs on CEA (based on DoPT instructions)',date:'2 April 2026',url:'https://utilities.cept.gov.in/dop/pdfbind.ashx?id=14737',details:'Department of Posts circular on pre-primary classes, one-time NEP-2020 repetition relaxation, leave, dies non and service cessation. Context only; NESTS directions govern EMRS processing.',kind:'PDF · official FAQs'},
      {id:'cea-portal',agency:'NESTS · official circular register',title:'NESTS General Circulars — CEA and Hostel Subsidy',date:'Continuously updated',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&lid=373&ls_id=938',details:'Check for further updates to approving authority, documents and reimbursement',kind:'Official portal'}
    ],
    groups: [
      {title:'EMRS adoption and order of precedence',page:'NESTS 21 Apr 2025 · page 1; 30 Jun 2025 circular',sources:['cea-nests-apr','cea-nests-jun'],points:[
        'NESTS confirms that CEA/Hostel Subsidy benefits for EMRS employees follow applicable Government of India norms and that Annexure-B is the prescribed claim form.',
        'For staff other than Principals/Principals in-charge, the April 2025 direction says processing is at EMRS level; claims of Principals/Principals in-charge go to EMRS Society level. Check the revised 30 June 2025 approval instructions for any change before sanction.',
        'The claim builder reproduces Annexure-B pages 8–9. The head-of-institution certificate on page 10 is a separate supporting document.'
      ]},
      {title:'Eligibility, eligible children and academic period',page:'NESTS 21 Apr 2025 · Annexure-A pages 3–6',sources:['cea-nests-apr'],points:[
        'The reference material ordinarily covers two eldest surviving eligible children, with stated exceptions for certain multiple births and qualifying failed-sterilisation cases; claiming a third child simply because an earlier child was not claimed is not automatically allowed.',
        'The reference discusses pre-primary classes, through Class XII, and specified post-Class-X diploma courses under their respective conditions.',
        'Claims are based on the relevant academic-year period and educational evidence; repeat-class, dies-non, spouse double-claim, disability and correspondence-study cases have individual conditions.',
        'Check the school’s recognition/affiliation and supporting attendance or fee documentation; entering a school name does not establish eligibility.'
      ]},
      {title:'Claim documents and spouse declarations',page:'NESTS Annexure-B pages 8–10',sources:['cea-nests-apr','cea-nests-jun'],points:[
        'Provide completed two-page Annexure-B with employee/children details, academic year, school/class particulars, claimed child particulars, declarations and signature.',
        'The head-of-institution certificate is separately provided in the source circular; where certificates are not available, consult applicable admissible alternatives and office requirements.',
        'Verify the spouse’s employment and whether the same child’s allowance/subsidy has been claimed by anyone else. Make accurate declarations and disclose previous advances or claims.',
        'Follow the most recent NESTS authority and forwarding instructions before submission.'
      ]},
      {title:'CEA/Hostel ceilings, distance and disability',page:'NESTS Annexure-A pages 4–6 · later DoPT updates',sources:['cea-nests-apr','cea-dopt-year','cea-2026-faq','cea-portal'],points:[
        'The April 2025 extract lists historical monthly CEA and Hostel Subsidy figures after the January 2024 DA-linked increase. Do not treat those reproduced amounts as guaranteed current ceilings.',
        'Hostel Subsidy in the referenced material has additional conditions for qualifying residential hostels, distance from employee residence, lodging/boarding charges and supporting evidence; day boarding is not equivalent to hostel stay.',
        'Different rules apply to eligible children with disabilities, including enhanced ceilings, permitted home-based education in specified cases and age-related conditions.',
        'DoPT’s 2024 updates cover the three pre-Class-I years and DA-linked allowance revisions. The Department of Posts issued further DoPT-based FAQs on 2 April 2026, including a narrowly defined one-time NEP-2020 class repetition relaxation. Check the underlying order, NESTS adoption and actual academic year before deciding a payable amount.'
      ]}
    ]
  }
};
export const policySourceCount = Object.values(policyLibrary).reduce((n, p) => n + p.sources.length, 0);
