// Gets today's and tomorrow's shows from every venue and saves them to data/shows.json.
// One venue failing doesn't stop the rest; the page names it in the footer instead.
import fs from 'node:fs/promises';
import path from 'node:path';
import { VENUES } from './venues/index.js';
import { todayCentral, addDays } from './format.js';

const DATA = path.resolve('data');

async function venuesOn(date) {
  console.log(`Shows for ${date}`);
  const venues = [];
  for (const v of VENUES) {
    const entry = { id: v.id, name: v.name, area: v.area, url: v.url, shows: [], notice: null, error: null };
    try {
      // shows() returns a list, or { shows, notice } to add a message under the venue.
      const result = await v.shows(date);
      const shows = Array.isArray(result) ? result : result.shows;
      entry.notice = Array.isArray(result) ? null : result.notice || null;
      entry.shows = shows.sort((a, b) => String(a.start).localeCompare(b.start));
      console.log(`  ${v.name}: ${entry.shows.length}`);
    } catch (err) {
      entry.error = err.message;
      console.error(`  ${v.name}: FAILED ${err.message}`);
    }
    venues.push(entry);
  }
  return venues;
}

async function main() {
  const today = todayCentral();
  const days = [];
  for (const date of [today, addDays(today, 1)]) days.push({ date, venues: await venuesOn(date) });

  if (days[0].venues.every((v) => v.error)) throw new Error('Every venue failed; keeping the old data');

  await fs.mkdir(DATA, { recursive: true });
  await fs.writeFile(path.join(DATA, 'shows.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), days }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
