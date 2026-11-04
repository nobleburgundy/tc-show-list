// The White Squirrel Bar, St. Paul. Uses The Events Calendar's JSON API.
import { tribeShows } from '../sources/tribe.js';

const BASE = 'https://whitesquirrelbar.com';

export default {
  id: 'whitesquirrel',
  name: 'White Squirrel',
  area: 'St. Paul',
  url: `${BASE}/`,
  shows: (date) => tribeShows(BASE, date),
};
