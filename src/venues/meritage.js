// The Underground, the basement bar under Meritage in downtown St. Paul (enter by the
// Hamm's Bear statue, 24 W 7th Pl). Meritage's site is a JavaScript app; its events
// come from the same JSON list the site's own Underground page loads.
// Each event: { date: "2026-11-06T00:00:00.000Z", startTime: "20:30:00", endTime, title, tagline }.
import { getJson } from '../http.js';
import { decode } from '../text.js';

const EVENTS = 'https://meritage-api-production.up.railway.app/api/events-intel/guest-events?venue=underground';
const PAGE = 'https://meritage-stpaul.com/underground';

export default {
  id: 'meritage',
  name: 'Meritage Underground',
  area: 'St. Paul',
  url: PAGE,

  async shows(date) {
    const data = await getJson(EVENTS);
    if (!Array.isArray(data.events)) throw new Error('No events list in response (API changed?)');
    return data.events
      .filter((e) => String(e.date).slice(0, 10) === date) // the date part is the local day
      .map((e) => {
        const start = /^\d{2}:\d{2}/.test(e.startTime || '') ? `${date}T${e.startTime.slice(0, 5)}:00` : null;
        // An end time earlier than the start (e.g. 1am on New Year's) is the next day.
        const endsNextDay = e.endTime && e.startTime && e.endTime < e.startTime;
        const endDate = endsNextDay ? new Date(Date.parse(`${date}T12:00:00Z`) + 864e5).toISOString().slice(0, 10) : date;
        const title = decode(e.title);
        return {
          title,
          start,
          end: /^\d{2}:\d{2}/.test(e.endTime || '') ? `${endDate}T${e.endTime.slice(0, 5)}:00` : null,
          url: PAGE,
          cancelled: /\bcancel+ed\b/i.test(title),
          note: '',
        };
      });
  },
};
