// Animales Barbeque Co., North Loop Minneapolis (241 Fremont Ave N). Squarespace
// calendar with no categories; it mixes music with Survivor/game-day watch parties
// and line dancing, so those are dropped by title.
import { squarespaceShows } from '../sources/squarespace.js';

const CALENDAR = 'https://animalesbbq.com/calendar';
const NOT_SHOWS = /watch party|line danc/i;

export default {
  id: 'animales',
  name: 'Animales BBQ',
  area: 'Minneapolis',
  url: CALENDAR,
  shows: async (date) => (await squarespaceShows(CALENDAR, date)).filter((s) => !NOT_SHOWS.test(s.title)),
};
