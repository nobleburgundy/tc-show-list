// Shared reader for Squarespace event pages. Any Squarespace events page returns
// JSON when you add ?format=json. Tip: a site is Squarespace if its HTML mentions
// "squarespace-cdn" or "SQUARESPACE_CONTEXT".
import { getJson } from '../http.js';
import { decode } from '../text.js';

// Epoch ms -> "2026-11-04T19:00:00" in Minnesota time.
function central(ms) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

// Shows starting on `date` from the events page at `pageUrl`, e.g. https://example.com/calendar
// `category` keeps only events tagged with that Squarespace category (e.g. "Live Events").
export async function squarespaceShows(pageUrl, date, { category } = {}) {
  const data = await getJson(`${pageUrl}?format=json`);
  if (!data.upcoming && !data.past) throw new Error('No events in Squarespace JSON (page moved?)');
  const origin = new URL(pageUrl).origin;

  // Shows that already ended today have moved to "past", so check both lists.
  const seen = new Set();
  return [...(data.upcoming || []), ...(data.past || [])]
    .filter((e) => !seen.has(e.id) && seen.add(e.id))
    .filter((e) => !category || (e.categories || []).includes(category))
    .map((e) => ({ e, start: central(e.startDate) }))
    .filter(({ start }) => start.startsWith(date))
    .map(({ e, start }) => {
      const title = decode(e.title);
      return {
        title,
        start,
        end: e.endDate ? central(e.endDate) : null,
        url: e.fullUrl ? origin + e.fullUrl : pageUrl,
        cancelled: /\bcancel+ed\b/i.test(title),
        note: '',
      };
    });
}
