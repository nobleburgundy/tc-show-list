// MetroNOME Brewery, downtown St. Paul (music in the taproom and Fingal's Cave).
// Uses The Events Calendar's JSON API. Note: the www. address is blocked for
// scripts, so use the bare domain.
import { tribeShows } from '../sources/tribe.js';

const BASE = 'https://metronomebrewery.com';

export default {
  id: 'metronome',
  name: 'MetroNOME Brewery',
  area: 'St. Paul',
  url: `${BASE}/live-music/`,
  shows: (date) => tribeShows(BASE, date, { exclude: /happy hour/i }),
};
