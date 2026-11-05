// Volstead's Emporium, Uptown Minneapolis (basement speakeasy). Squarespace calendar.
import { squarespaceShows } from '../sources/squarespace.js';

const CALENDAR = 'https://www.volsteads.com/live-events';

export default {
  id: 'volsteads',
  name: "Volstead's Emporium",
  area: 'Minneapolis',
  url: CALENDAR,
  shows: (date) => squarespaceShows(CALENDAR, date),
};
