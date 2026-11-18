// Shared reader for First Avenue's venues (First Ave, 7th St Entry, Turf Club, Palace
// Theatre, Fitzgerald, Fine Line...), which all list shows on first-avenue.com.
// The month list, filtered by venue id, has each show as a .show_list_item with a
// month + day, venue label, title link, optional "with ..." line and a status badge
// ("postponed", "sold out"), but no times. Times are on each show's own page
// ("Show Starts" / "8PM"), so we read that page for the day's shows.
// Tip: a venue's id is in the "More at <venue>" link (/shows/?venues=<id>) on its
// first-avenue.com/venue/<name>/ page.
import * as cheerio from 'cheerio';
import { getText } from '../http.js';
import { parseTime } from '../format.js';

const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export const firstAvenueUrl = (venueId) => `https://first-avenue.com/shows/?venues=${venueId}`;

// `venueName` is matched against each show's venue label, in case the filter is ignored.
export async function firstAvenueShows(venueId, venueName, date) {
  const [y, m, d] = date.split('-').map(Number);
  const month = `https://first-avenue.com/shows/?post_type=event&venues=${venueId}&start_date=${y}${String(m).padStart(2, '0')}01`;
  const $ = cheerio.load(await getText(month));
  const items = $('.show_list_item');
  // A quiet month says "Sorry, there are no shows to display".
  if (!items.length && !/no shows to display/i.test($.text())) throw new Error('No shows on First Avenue list (layout changed?)');

  const label = venueName.toLowerCase();
  const today = items.filter((_, el) => {
    const it = $(el);
    if (!it.find('.venue_name').first().text().toLowerCase().includes(label)) return false;
    const mon = MON.indexOf(it.find('.month').first().text().trim().slice(0, 3).toLowerCase()) + 1;
    return mon === m && Number(it.find('.day').first().text().trim()) === d;
  }).get();

  return Promise.all(today.map(async (el) => {
    const it = $(el);
    const link = it.find('.show_name h4 a').first();
    const title = link.text().replace(/\s+/g, ' ').trim();
    const url = link.attr('href') || firstAvenueUrl(venueId);
    const support = it.find('.show_name h5').first().text().replace(/\s+/g, ' ').trim();
    const status = it.find('.status').first().text().replace(/\s+/g, ' ').trim().toLowerCase();
    const cancelled = /cancel/.test(status) || /\bcancel+ed\b/i.test(title);
    return {
      title,
      start: await showTime(url, date),
      end: null,
      url,
      cancelled,
      note: [support, status && !cancelled ? status[0].toUpperCase() + status.slice(1) : '']
        .filter(Boolean).join('. '),
    };
  }));
}

// The "Show Starts" time from a show's page, or null if it can't be read.
async function showTime(url, date) {
  try {
    const $ = cheerio.load(await getText(url));
    const label = $('.show_details h6').filter((_, h) => /show starts/i.test($(h).text())).first();
    const time = parseTime(label.next('h2').text().replace(/\s+/g, ''));
    return time ? `${date}T${time}:00` : null;
  } catch {
    return null; // still list the show, just without a time
  }
}
