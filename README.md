# EMRS Claim Forms by worksbeyond

A free, responsive, browser-based claim form portal for Eklavya Model Residential School staff.

## Forms available

1. **LTC Claim Form** — Part A employee details, family members, journey entries, advance, higher-class/road particulars, declarations and office-use details based on the provided 2-page LTC claim format.
2. **Medical Reimbursement** — actual **NESTS Annexure-I Medical Reimbursement Claim Form** from the NESTS Medical Attendance Rules, 2024 circular dated 23 December 2024. Guided fields for Medical Card holder, patient, hospital, CGHS empanelment, OPD/indoor treatment, emergency, insurance, advance, itemised totals and required declaration. PDF prints as a 2-page A4 portrait form; Word is editable with a page break, and Excel has two print-ready worksheets. The older medical claim register was replaced.
3. **TA & DA Claim Form** — Travelling Allowance Bill based on the supplied EMRS Karanjiya 2-page TA proforma and the accompanying 15-sheet TA/DA sample workbook; trip rows, fares, mileage, daily allowance, actual expenses, net total and original certification sections.

4. **CEA / Hostel Subsidy Claim** — the NESTS Annexure-B two-page prescribed CEA/Hostel Subsidy form (PDF pages 8–9 of the supplied 21 April 2025 circular): employee, spouse, three-child family roster, two-child claim roster, schools/class/academic years, disability, supporting documents, advance, reimbursement and declarations. Page 10 is the **separate school-head certificate**, not exported as a third claim page. A comprehensive searchable CEA Rules panel captures notice, eligibility, exceptions, rates as printed, hostel eligibility, disabilities, travel concessions and the five FAQs from the uploaded Annexure-A. Because NESTS published later revised claims guidance (30 June 2025), historical rates are not presented as confirmed current ceilings.

Each form can be downloaded in **PDF, Word (.docx), and Excel (.xlsx)**. Native editable Word tables and Excel cells; white print backgrounds. PDF uses native vector text and tables with A4 layout. **TA/DA exports are exactly two A4 landscape sides**: front bill (20 columns, journeys, totals, particulars and disbursement) and reverse certificate. Excel has two white print worksheets; choose **Print Entire Workbook**, double-sided, landscape, flip on short edge. Up to 14 TA/DA journey entries are supported per two-sided bill; exporting more than 14 raises an explicit error instead of omitting data. The daily allowance rate supports percent text, and an optional amount override prevents assuming an official entitlement calculation.

## Privacy

- No account, database, server upload, or API required.
- Drafts remain in memory until the user selects **Save draft**; saved draft goes to that browser's `localStorage`.
- **Load draft** retrieves only the selected form on that same device.
- Be cautious using saved drafts on shared computers. Reset clears on-screen fields; to clear saved drafts, use browser site-data controls.

## Run locally

```bash
npm install
npm run dev
```

Build: `npm run build` (outputs `dist/`).

## Deploy to Vercel

Link this GitHub repository as a **Vite** site; default root directory `/`, build command `npm run build`, output directory `dist`. Vercel builds automatically when `main` changes.

## Important note

This is a form-preparation aid. Downloaded claims must be verified against applicable service rules, admissibility entitlements, supporting bills and current institutional requirements before being submitted or signed. The site does not assert that a claim is approved.

**EMRS Claim Forms by worksbeyond** · Made with ❤️ by AiR

## Rules viewer: LTC, TA/DA, Medical, CEA/Hostel (24 October 2026 update)

All four major claim forms now share an indexed, searchable **Official Claim Rules & Circulars** dialog, opened by **Rules** on each dashboard card or **View Rules** inside the form editor.

**Hierarchy / important limitation:** NESTS service-specific circulars and the latest adopted government orders take precedence over general reference material. All topics are document-preparation notes, not entitlement approvals, rate certifications or legal advice. The viewer links direct government-hosted original PDFs (or their NESTS-hosted attachments), with later amendments prominently identified. The latest DoPT and Ministry of Finance circulars should be checked when processing an actual dated claim.

| Form | Principal EMRS-specific official source | Additional government reference |
| --- | --- | --- |
| LTC | [NESTS Guidelines for regulating LTC Claim, 30 May 2025](https://nests.tribal.gov.in/WriteReadData/RTF1984/1748954065.pdf) (including DoPT 30 Apr 2024 consolidated guidelines as Annexure A) | CCS LTC 1988 regime, DoPT LTC consolidated guidance/FAQs and current orders |
| TA/DA | [NESTS Clarification on approving/passing TA bills, 22 May 2025](https://nests.tribal.gov.in/WriteReadData/RTF1984/1747996862.pdf) | [Department of Expenditure TA 7th CPC OM dated 13 Jul 2017](https://doe.gov.in/files/cenetral-pay_document/TA_English.pdf) and subsequent clarifications |
| Medical | [NESTS Medical Attendance Rules, 23 Dec 2024](https://nests.tribal.gov.in/WriteReadData/RTF1984/1735100833.pdf) | [NESTS Medical Reimbursement Procedure, 1 Oct 2025](https://nests.tribal.gov.in/WriteReadData/RTF1984/1759320282.pdf) and CGHS context where adopted |
| CEA / Hostel | [NESTS CEA clarification and Annexure-B, 21 Apr 2025](https://nests.tribal.gov.in/WriteReadData/RTF1984/1745238066.pdf) | [NESTS revised approval guidelines, 30 Jun 2025](https://nests.tribal.gov.in/WriteReadData/RTF1984/1755757157.pdf), government-hosted DoPT allowance OM of 25 Apr 2024 and later FAQ clarifications |

Search covers a topic's title, source, date and detail. Each topic provides direct original-source links. The full document library offers dates, issuing bodies and PDF links. See `src/policyLibrary.js`, `src/RulesDialog.jsx` and `src/policy-library.css`.

No changes have been made to export calculation logic: rates, office approval, medical treatment admissibility, block-specific LTC and claim ceilings require case-by-case verification. Both beta sections, All Other Forms and Applications, remain separately identified as under development.
