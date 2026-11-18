// Turf Club, Midway St. Paul. A First Avenue venue.
import { firstAvenueShows, firstAvenueUrl } from '../sources/firstavenue.js';

const VENUE_ID = 26147;

export default {
  id: 'turfclub',
  name: 'Turf Club',
  area: 'St. Paul',
  url: firstAvenueUrl(VENUE_ID),
  shows: (date) => firstAvenueShows(VENUE_ID, 'Turf Club', date),
};
