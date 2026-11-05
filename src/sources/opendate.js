// Shared reader for Opendate venue pages (app.opendate.io/c/<venue>), a ticketing
// platform many small venues use. The page is plain HTML: each show is a .confirm-card
// with a title link, an optional "with ..." line, "November 05, 2026" and
// "Doors: 7:00 PM - Show: 7:30 PM".
// Tip: a site uses it if its HTML links to app.opendate.io.
import * as cheerio from 'cheerio';
import { getText } from '../http.js';
import { parseTime } from '../format.js';

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

// "November 05, 2026" -> "2026-11-05"
function toIso(text) {
  const m = text.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  const mon = m && MONTHS.indexOf(m[1].toLowerCase()) + 1;
  return mon ? `${m[3]}-${String(mon).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
}

export async function opendateShows(pageUrl, date) {
  const $ = cheerio.load(await getText(pageUrl));
  const cards = $('.confirm-card');
  if (!cards.length && !/no upcoming/i.test($.text())) throw new Error('No Opendate cards on page (layout changed?)');

  const shows = [];
  cards.each((_, el) => {
    const c = $(el);
    const lines = c.find('p').map((__, p) => $(p).text().replace(/\s+/g, ' ').trim()).get();
    if (!lines.some((l) => toIso(l) === date)) return;

    const link = c.find('a.stretched-link, a[href*="/e/"]').first();
    const title = link.text().replace(/\s+/g, ' ').trim();
    const times = lines.find((l) => /doors:|show:/i.test(l)) || '';
    const t = times.match(/Show:\s*([\d:]+\s*[AP]M)/i) || times.match(/([\d:]+\s*[AP]M)/i);
    const time = t && parseTime(t[1].replace(/\s+/g, ''));
    // The "with ..." line lists support acts; skip it when the title already names them.
    const support = lines.find((l) => /^with\s/i.test(l));
    const note = support && !/\bwith\b|\bw\/|\bw\.\s/i.test(title) ? support : '';

    shows.push({
      title,
      start: time ? `${date}T${time}:00` : null,
      end: null,
      url: (link.attr('href') || pageUrl).replace(/\?default_theme=true$/, ''),
      cancelled: /\bcancel+ed\b/i.test(c.text()),
      note,
    });
  });
  return shows;
}
