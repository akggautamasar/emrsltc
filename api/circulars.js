/**
 * Official NESTS circular-list reader.
 * Never generates missing circulars, guessed reference numbers, dates or PDF links.
 * The NESTS origin is fixed (not caller supplied) to prevent SSRF.
 */
const LISTINGS = [
  {section:'General Circulars',key:'general',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=938&lid=373'},
  {section:'For Serving Employees',key:'employee',url:'https://nests.tribal.gov.in/show_content.php?lang=1&level=1&ls_id=851&lid=487'}
];
const SOURCE = LISTINGS[0].url;

const htmlDecode = (input = '') => String(input)
  .replace(/&#(x[0-9a-f]+|\d+);?/gi, (_, code) => {
    const val = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
    return val > 0 && val <= 0x10ffff ? String.fromCodePoint(val) : '';
  })
  .replace(/&(?:nbsp|amp|quot|apos|lt|gt|ndash|mdash|rsquo|lsquo|ldquo|rdquo|bull|hellip);/gi, entity => ({
    '&nbsp;':' ', '&amp;':'&', '&quot;':'"', '&apos;':"'", '&lt;':'<', '&gt;':'>',
    '&ndash;':'–', '&mdash;':'—', '&rsquo;':'’', '&lsquo;':'‘', '&ldquo;':'“',
    '&rdquo;':'”', '&bull;':'•', '&hellip;':'…'
  }[entity.toLowerCase()] || ' '))
  .replace(/&#?[a-z0-9]+;/gi, ' ');

const textContent = input => htmlDecode(String(input || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
  .replace(/\s+/g, ' ').trim();

const fixDate = value => {
  const match = value.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
  if (!match) return '';
  const [ , d, m, y] = match;
  const iso = y + '-' + m.padStart(2, '0') + '-' + d.padStart(2, '0');
  const dt = new Date(iso + 'T12:00:00Z');
  return !Number.isNaN(dt.valueOf()) && dt.getUTCDate() === Number(d) &&
    dt.getUTCMonth() === Number(m) - 1 ? iso : '';
};

const extractPdf = (row, sourceUrl) => {
  // The NESTS table contains download anchors or onclick links. Only retain
  // explicit, authority-hosted links and never infer a PDF from a serial number.
  const decoded = htmlDecode(row).replace(/\\\//g, '/');
  const matches = [
    ...decoded.matchAll(/(?:https?:\/\/[^"'<>)\s]+|\.{0,2}\/[^"'<>\s]+|(?:WriteReadData|upload|uploads|documents)\/[^"'<>\s]+)\.pdf(?:\?[^"'<>\s]*)?/gi)
  ];
  for (const match of matches) {
    try {
      const url = new URL(match[0], sourceUrl);
      if (url.protocol !== 'https:' || !['nests.tribal.gov.in','www.nests.tribal.gov.in'].includes(url.hostname)) continue;
      return url.href;
    } catch { /* ignore invalid path */ }
  }
  return null;
};
function parseOfficial(html, listing) {
  // Parse the publisher's own table rows, not any generated synthetic catalogue.
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];
  const items = [];
  const seen = new Set();
  for (const [, row] of rows) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1]);
    if (cells.length < 3) continue;
    const numberMatch = textContent(cells[0]).match(/^#\s*(\d{1,4})\s*$/);
    if (!numberMatch) continue;
    const number = Number(numberMatch[1]);
    const date = fixDate(textContent(cells[1]));
    const title = textContent(cells[2]);
    if (!date || title.length < 5 || seen.has(number)) continue;
    const allRow = cells.slice(3).join(' ') + ' ' + row;
    items.push({
      id: listing.key + '-' + number, number, circularNo: '#' + number,
      date, title, pdfUrl: extractPdf(allRow, listing.url), section: listing.section,
      listingUrl: listing.url, source: 'official-live'
    });
    seen.add(number);
  }
  return items.sort((a,b) => b.date.localeCompare(a.date) || b.number - a.number);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({error:'Method not allowed'});
  }
  res.setHeader('Cache-Control', 'public, s-maxage=14400, stale-while-revalidate=86400');
  const outcomes = await Promise.all(LISTINGS.map(async listing => {
    try {
      const response = await fetch(listing.url, {
        method:'GET', redirect:'follow',
        headers:{
          'User-Agent':'Mozilla/5.0 (compatible; EMRS-Circular-Finder/1.0; official-circular-index)',
          'Accept':'text/html,application/xhtml+xml'
        },
        signal:AbortSignal.timeout(13500)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const items = parseOfficial(await response.text(), listing);
      if (!items.length) throw new Error('No matching rows in publisher table');
      return {section:listing.section, url:listing.url, records:items};
    } catch (error) {
      return {section:listing.section, url:listing.url, records:[],
        error:String(error?.message || error).slice(0,180)};
    }
  }));
  const records = outcomes.flatMap(x => x.records)
    .sort((a,b) => b.date.localeCompare(a.date) || (b.number || 0) - (a.number || 0));
  if (!records.length) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({
      error:'Official NESTS circular listings could not be read',
      sourceType:'unavailable',
      sources:outcomes.map(({section,url,error})=>({section,url,error})),
      records:[]
    });
  }
  return res.status(200).json({
    sourceType:'official-live', updatedAt:new Date().toISOString(),
    sources:outcomes.map(({section,url,error,records})=>({section,url,error,count:records.length})),
    count:records.length, records
  });
}
