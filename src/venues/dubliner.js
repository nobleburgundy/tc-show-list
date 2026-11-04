// The Dubliner Pub, St. Paul. Their WordPress site has a JSON events feed
// (the "lre" recurring-events plugin), so no HTML scraping is needed.
import { getJson } from '../http.js';
import { decode } from '../text.js';

const BASE = 'https://thedublinerpub.com';

export default {
  id: 'dubliner',
  name: 'The Dubliner',
  area: 'St. Paul',
  url: `${BASE}/`,

  // Shows starting on `date` (YYYY-MM-DD, Central time).
  async shows(date) {
    // `end` is inclusive, so this also returns the next day; we filter below.
    const events = await getJson(`${BASE}/wp-json/lre/v1/events?start=${date}&end=${date}`);
    return events
      .filter((e) => e.start?.startsWith(date))
      .filter((e) => !/^test\b/i.test(e.title)) // placeholder posts left on the site
      .map((e) => {
        const x = e.extendedProps || {};
        return {
          title: decode(e.title),
          start: e.start, // local time, no zone, e.g. 2026-11-04T19:00:00
          end: e.end || null,
          url: e.url || x.permalink || null,
          cancelled: /cancel/i.test(x.eventStatus || ''),
          note: decode([x.eventLabel, x.rescheduleNote].filter(Boolean).join(' ')),
        };
      });
  },
};

