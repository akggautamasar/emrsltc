
/** Policy summaries are based on the user-provided, 12-page NESTS circular
 * dated 23-12-2024, including Medical Attendance Rules, 2024 and Annexure-I.
 * Page references are PDF page numbers (the printed policy uses 1-11).
 */
export const medicalPolicyUrl='https://nests.tribal.gov.in/WriteReadData/RTF1984/1735100833.pdf';
export const policyMeta={title:'NESTS Medical Attendance Rules, 2024',ref:'NESTS/H-1/58/Policy/2024-25',date:'23 December 2024',note:'The 2024 policy and Annexure-I are included in this circular. Check the NESTS circulars page for subsequent instructions and amendments.'};
export const medicalRules=[
 {title:'Who is covered?',page:'PDF pages 2–4',points:[
 'The policy applies to regular NESTS/EMRS employees, employees on deputation, and eligible dependent family members; it excludes casual, part-time and contractual personnel.',
 'Eligible family members include spouse, dependent parents or parents-in-law (as opted), eligible children, and certain dependent siblings, subject to the conditions stated in the policy.',
 'For a son, the policy specifies until earning starts or 25 years of age, whichever is earlier; different conditions apply to daughters and children with permanent disabilities.'
 ]},
 {title:'What treatments are covered?',page:'PDF pages 4–5',points:[
 'The rules cover OPD and indoor treatment, diagnostic investigations, dental, ophthalmic, prolonged illness, specified home-quarantine care and certain special or chronic disease follow-up treatment.',
 'Recognised systems include Allopathy, Homeopathy, Ayurveda, Unani and Siddha under the stated conditions.',
 'OPD reimbursement is regulated by CGHS/AIIMS rates and actual expenditure as set out in the policy; it requires the prescribed Annexure-I certification.'
 ]},
 {title:'Hospitalisation, approvals and emergencies',page:'PDF pages 5–7',points:[
 'For planned indoor treatment, prior permission of the competent authority is required, with details of the proposed hospital and treatment.',
 'For an emergency admission, the office must be informed at the earliest. The policy sets additional verification and ex-post-facto approval requirements, particularly for private hospitals.',
 'For emergencies in non-empanelled hospitals, the policy calls for a stamped emergency certificate, detailed bills including their breakup, and an explanatory covering letter. Admissibility is decided by the competent authority.',
 'CGHS package rates or actual expenditure, whichever is lower, apply where package rates are available. Other accommodation and entitlement limits may apply.'
 ]},
 {title:'Dependents, spouse and insurance',page:'PDF pages 3, 9–10',points:[
 'Where the spouse is employed in an organisation providing medical facilities, the policy requires a declaration about who will claim reimbursement, certified by the non-claiming organisation.',
 'Annexure-I requires the patient’s name, relationship to the card holder, whether the hospital is CGHS-empanelled, emergency status, and whether health/medical insurance is held.',
 'If health/medical insurance is used, the amount claimed or received must be disclosed in Annexure-I.'
 ]},
 {title:'Bills and documents',page:'PDF pages 6, 8, 11',points:[
 'Annexure-I asks for OPD, investigations, medicines and indoor treatment amounts separately, plus details of any medical advance.',
 'Provide relevant supporting bills, including the investigation breakup: individual tests, rates and number of tests, X-ray films, etc., as applicable.',
 'Special requirements apply to lost original papers, prolonged illness certificates and emergency treatment; review the relevant clause and any later procedural circular before submission.'
 ]},
 {title:'Important limitations',page:'PDF pages 6–8, 11',points:[
 'Vitamins, calcium and nutritional supplements are generally excluded except under the doctor-certification or prescription conditions specified in the policy.',
 'The policy warns that false or suppressed claim details may result in disciplinary or penal action.',
 'The authority decides entitlement and reimbursement. This website only prepares forms; it does not verify eligibility or approve claims.'
 ]},
 {title:'Prolonged diseases — Annexure-II',page:'PDF page 12',points:[
 'The annexure lists 14 conditions: heart ailments/FUC hypertension, diabetes mellitus, paralysis/cerebrovascular attack, FUC thyroid disorder, kidney disorders, bronchial asthma, cancer/malignant tumours, haemolytic disorder, tuberculosis, rheumatoid/osteoarthritis, osteoporosis, thalassemia, chronic liver disease and Parkinson’s.',
 'The list can be amended by the competent authority. The policy specifies a six-month renewal certificate for prolonged illness.'
 ]}
];
export const formsHelp={
 ltc:{title:'LTC form guidance',text:'The provided LTC Claim Form contains employee, leave, family, journey, higher-class travel, road journey and certification fields. A separate authoritative LTC entitlement/rules circular has not been supplied for this website.',points:['Enter each journey leg and fare as paid, including return travel.','Check applicable LTC block, leave sanction and spouse declaration before signing.','Verify admissible fare classes and amounts with the applicable current rules and your office.']},
 ta:{title:'TA & DA form guidance',text:'The uploaded TA/DA template is a two-sided travelling allowance bill with an employee certificate and controlling-officer certificate. This is template guidance, not an independent rulebook.',points:['Enter departure and arrival particulars for each journey.','Check actual fare receipts, distance, permitted mileage rates and DA entitlement.','The two-page print template supports up to 14 journey entries and separates bill and certificates.']}
};
