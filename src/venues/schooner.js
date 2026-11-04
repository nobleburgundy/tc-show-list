// Schooner Tavern, Minneapolis (Longfellow). They post each month's lineup only as a
// poster image, so the shows are typed into listings/schooner.txt by hand.
// Each run we also check which month's poster is on their site, to flag when a
// new one is up that hasn't been typed in yet.
import { getText } from '../http.js';
import { readListings, monthOf } from '../sources/listings.js';
import { longDate } from '../format.js';

const URL = 'https://www.schoonertavern.com/live-music';
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november', 'december'];

export default {
  id: 'schooner',
  name: 'Schooner Tavern',
  area: 'Minneapolis',
  url: URL,

  async shows(date) {
    const all = await readListings('schooner');
    const months = new Set(all.map((s) => monthOf(s.date)));

    const poster = await posterMonth().catch(() => null);
    if (poster && !months.has(poster)) {
      console.warn(`  Schooner: poster for ${poster} is up; add it to listings/schooner.txt`);
    }

    const shows = all.filter((s) => s.date === date).map((s) => ({
      title: s.title, start: s.start, end: null, url: URL, cancelled: false, note: '',
    }));
    if (!months.has(monthOf(date))) {
      const month = longDate(date).split(', ')[1].split(' ')[0];
      return { shows, notice: `${month} lineup not typed in yet. See poster.` };
    }
    return shows;
  },
};

// The poster's file name is like "november_2026_calender_web_V2.jpg". Returns "2026-11".
async function posterMonth() {
  const html = await getText(URL);
  const m = html.match(new RegExp(`alt="(${MONTHS.join('|')})[_ -](\\d{4})`, 'i'));
  if (!m) return null;
  return `${m[2]}-${String(MONTHS.indexOf(m[1].toLowerCase()) + 1).padStart(2, '0')}`;
}
