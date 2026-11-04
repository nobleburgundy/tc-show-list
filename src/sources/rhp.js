// Shared reader for RHP Events (Rockhouse Partners), a WordPress plugin many music
// venues use, often on an events.<venue>.com site. No JSON feed, so we read the list
// page: each show is a .rhp-event-info block with a date ("Thu, Nov 05"), a title
// link (#eventTitle) and times ("Doors: 7 pm || Show: 8 pm").
// Tip: a site uses it if its HTML has "rhp-event" classes.
import * as cheerio from 'cheerio';
import { getText } from '../http.js';
import { parseTime } from '../format.js';

const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export async function rhpShows(listUrl, date) {
  const $ = cheerio.load(await getText(listUrl));
  const blocks = $('.rhp-event-info');
  if (!blocks.length) throw new Error('No RHP events on page (layout changed?)');
  const [, m, d] = date.split('-').map(Number);

  const shows = [];
  blocks.each((_, el) => {
    const b = $(el);
    // No year on the page; month + day is enough to find today's shows.
    const dm = b.find('.singleEventDate').text().trim().match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})/);
    if (!dm || MON.indexOf(dm[1].toLowerCase()) + 1 !== m || Number(dm[2]) !== d) return;

    const link = b.find('#eventTitle, a.url').first();
    const title = (link.text() || b.find('h2').first().text()).replace(/\s+/g, ' ').trim();
    const sub = b.find('.eventSubHeader').text().replace(/\s+/g, ' ').trim();
    const times = b.find('.rhp-event__time-text--list, .eventDoorStartDate').first().text();
    const t = times.match(/Show:\s*([\d:]+\s*[ap]\.?m)/i) || times.match(/([\d:]+\s*[ap]\.?m)/i);
    const time = t && parseTime(t[1].replace(/[\s.]/g, ''));

    shows.push({
      title: sub ? `${title} / ${sub}` : title,
      start: time ? `${date}T${time}:00` : null,
      end: null,
      url: link.attr('href') || listUrl,
      cancelled: /\bcancel+ed\b/i.test(b.text()),
      note: '',
    });
  });
  return shows;
}
