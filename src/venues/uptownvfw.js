// Uptown VFW (James Ballentine VFW Post 246), Minneapolis. Their WordPress events
// calendar is empty; shows are listed on their Opendate page instead.
import { opendateShows } from '../sources/opendate.js';

const LIST = 'https://app.opendate.io/c/uptown-vfw-681';

export default {
  id: 'uptownvfw',
  name: 'Uptown VFW',
  area: 'Minneapolis',
  url: 'https://uptownvfw.org/live-events/',
  shows: (date) => opendateShows(LIST, date),
};
