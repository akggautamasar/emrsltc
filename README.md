# EMRS Claim Forms by worksbeyond

A free, responsive, browser-based claim form portal for Eklavya Model Residential School staff.

## Forms available

1. **LTC Claim Form** — Part A employee details, family members, journey entries, advance, higher-class/road particulars, declarations and office-use details based on the provided 2-page LTC claim format.
2. **Medical Reimbursement** — employee/dependent medical **claim register** based on the uploaded one-page medical claim statement. The uploaded medical PDF is not an individual claim application; the dashboard identifies it as a register and does not invent statutory fields.
3. **TA & DA Claim Form** — Travelling Allowance Bill based on the supplied EMRS Karanjiya 2-page TA proforma and the accompanying 15-sheet TA/DA sample workbook; trip rows, fares, mileage, daily allowance, actual expenses, net total and original certification sections.

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
