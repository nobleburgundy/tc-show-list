// Shared reader for "The Events Calendar" (Tribe), a common WordPress events plugin.
// Venue sites using it have a JSON API at /wp-json/tribe/events/v1/events.
// Tip: a site uses it if its HTML mentions "wp-json/tribe/events".
import { getJson } from '../http.js';
import { decode } from '../text.js';

// Shows starting on `date` (YYYY-MM-DD) from the site at `base` (no trailing slash).
// `exclude` is a regex for titles to skip (e.g. happy hours).
export async function tribeShows(base, date, { exclude } = {}) {
  const q = new URLSearchParams({
    start_date: `${date} 00:00:00`,
    end_date: `${date} 23:59:59`,
    per_page: '50',
  });
  const data = await getJson(`${base}/wp-json/tribe/events/v1/events?${q}`);
  return (data.events || [])
    .filter((e) => e.start_date?.startsWith(date)) // skip multi-day events that began earlier
    .filter((e) => !exclude || !exclude.test(decode(e.title)))
    .map((e) => {
      const title = decode(e.title);
      return {
        title,
        start: e.all_day ? null : e.start_date.replace(' ', 'T'), // local time
        end: e.end_date ? e.end_date.replace(' ', 'T') : null,
        url: e.url || null,
        cancelled: /\bcancel+ed\b/i.test(title),
        note: '',
      };
    });
}
