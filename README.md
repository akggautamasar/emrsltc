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

## Rules viewer

The home page has a **Rules** button next to **Start form** for each form, and form editors have **View Rules**. For Medical Reimbursement, the searchable viewer summarises the uploaded NESTS Medical Attendance Rules, 2024 (pages 1–12) by topic, and links to the [official NESTS circular PDF](https://nests.tribal.gov.in/WriteReadData/RTF1984/1735100833.pdf). LTC and TA/DA buttons clearly show template guidance because separate authoritative LTC/TA rules were not provided. Review all later NESTS instructions before submission.

**CEA reference:** [Official 21 April 2025 NESTS CEA/Hostel Subsidy notice and Annexures](https://nests.tribal.gov.in/WriteReadData/RTF1984/1745238066.pdf). Later circulars are linked in the CEA rules dialog. No automatic entitlement/rate approval is provided.
