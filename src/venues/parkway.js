// Parkway Theater, South Minneapolis. Squarespace calendar that also lists movies,
// so we keep only events in their "Live Events" category, minus "All Movie Pass" items.
import { squarespaceShows } from '../sources/squarespace.js';

const CALENDAR = 'https://theparkwaytheater.com/all-events';

export default {
  id: 'parkway',
  name: 'Parkway Theater',
  area: 'Minneapolis',
  url: 'https://theparkwaytheater.com/live-events',
  shows: async (date) => (await squarespaceShows(CALENDAR, date, { category: 'Live Events' }))
    .filter((s) => !/movie pass/i.test(s.title)),
};
