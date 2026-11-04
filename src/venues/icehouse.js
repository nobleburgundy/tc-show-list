// Icehouse, Whittier Minneapolis. Their WordPress API has 750+ show posts with the
// date in a custom field it can't filter on, so we read the "Upcoming Shows" page
// instead. Each show is a .brxe-sh-row with a title, "November 4, 2026", and
// "Doors: 6:00 pm<br>Music: 8:00 pm".
import * as cheerio from 'cheerio';
import { getText } from '../http.js';
import { parseTime } from '../format.js';

const URL = 'https://www.icehousempls.com/shows';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

export default {
  id: 'icehouse',
  name: 'Icehouse',
  area: 'Minneapolis',
  url: URL,

  async shows(date) {
    const $ = cheerio.load(await getText(URL));
    const rows = $('.brxe-sh-row');
    if (!rows.length) throw new Error('No show rows on page (layout changed?)');

    const shows = [];
    rows.each((_, row) => {
      const r = $(row);
      if (toIso(r.find('.brxe-sh-row-date').text()) !== date) return;
      // Usually "Doors: 6:00 pm / Music: 8:00 pm"; two-set nights say
      // "6:30 PM Show — Doors 5:00 pm / 9:00 PM Show — Doors 8:30 pm".
      const times = r.find('[class*="brxe-sh-row-time"]').text();
      const sets = [...times.matchAll(/([\d:]+\s*[ap]m)\s*Show/gi)].map((x) => x[1]);
      const music = times.match(/Music:\s*([\d:]+\s*[ap]m)/i)?.[1] || sets[0] || times.match(/([\d:]+\s*[ap]m)/i)?.[1];
      const time = music && parseTime(music.replace(/\s+/g, ''));
      const title = r.find('.brxe-sh-row-title').text().replace(/\s+/g, ' ').trim();
      const later = sets.slice(1).map((s) => s.replace(/\s+/g, '').toLowerCase());
      shows.push({
        title,
        start: time ? `${date}T${time}:00` : null,
        end: null,
        url: r.find('.brxe-sh-row-link').attr('href') || URL,
        cancelled: /\bcancel+ed\b/i.test(title),
        note: [later.length ? `Also ${later.join(', ')}` : '', /sold out/i.test(r.text()) ? 'Sold out' : '']
          .filter(Boolean).join('. '),
      });
    });
    return shows;
  },
};

// "November 4, 2026" -> "2026-11-04"
function toIso(text) {
  const m = text.trim().match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return null;
  const mon = MONTHS.indexOf(m[1].toLowerCase()) + 1;
  return mon ? `${m[3]}-${String(mon).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
}
