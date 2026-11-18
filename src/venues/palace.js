// Palace Theatre, downtown St. Paul (17 W 7th Pl). A First Avenue venue.
import { firstAvenueShows, firstAvenueUrl } from '../sources/firstavenue.js';

const VENUE_ID = 26095;

export default {
  id: 'palace',
  name: 'Palace Theatre',
  area: 'St. Paul',
  url: firstAvenueUrl(VENUE_ID),
  shows: (date) => firstAvenueShows(VENUE_ID, 'Palace Theatre', date),
};
