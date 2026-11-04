// 331 Club, Northeast Minneapolis. No feed, so we read the calendar on the home page.
// Each day is a div.event with month/day labels; each show is a div.column whose
// lines (split by <br>) are the act names, ending with a time like "9:30pm" or "6-8pm".
import * as cheerio from 'cheerio';
import { getText } from '../http.js';
import { parseTime } from '../format.js';

const URL = 'https://331club.com/';
const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export default {
  id: '331',
  name: '331 Club',
  area: 'Minneapolis',
  url: URL,

  async shows(date) {
    return parse(await getText(URL), date);
  },
};

export function parse(html, date) {
  const $ = cheerio.load(html);
  const [, m, d] = date.split('-').map(Number);
  const shows = [];

  $('.events .event').each((_, ev) => {
    const mon = MON.indexOf($(ev).find('.event-date .month').text().trim().slice(0, 3).toLowerCase()) + 1;
    const day = Number($(ev).find('.event-date .date').text().trim());
    if (mon !== m || day !== d) return; // the page has no year; month + day is enough for "today"

    $(ev).find('.column').each((_, col) => {
      const show = parseColumn($, col, date);
      if (show) shows.push(show);
    });
  });
  if (!$('.events .event').length) throw new Error('No calendar found on page (layout changed?)');
  return shows;
}

function parseColumn($, col, date) {
  const c = $(col).clone();
  c.find('br').replaceWith('\n');
  c.find('p').after('\n');
  const lines = c.text().split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!lines.length) return null;

  const time = parseTime(lines[lines.length - 1]);
  if (time) lines.pop();
  if (!lines.length) return null;

  // "Series featuring" + "Band" reads as one phrase; otherwise acts are separate lines.
  const title = lines.reduce((acc, l) => (!acc ? l : /featuring$|with$|:$/i.test(acc) ? `${acc} ${l}` : `${acc} / ${l}`), '');

  return {
    title,
    start: time ? `${date}T${time}:00` : null,
    end: null,
    url: $(col).find('a').first().attr('href') || null,
    cancelled: /cancel/i.test(title),
    note: '',
  };
}

