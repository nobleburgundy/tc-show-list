// Berlin, North Loop Minneapolis. Squarespace calendar page.
import { squarespaceShows } from '../sources/squarespace.js';

const CALENDAR = 'https://www.berlinmpls.com/calendar';

export default {
  id: 'berlin',
  name: 'Berlin',
  area: 'Minneapolis',
  url: CALENDAR,
  shows: (date) => squarespaceShows(CALENDAR, date),
};
