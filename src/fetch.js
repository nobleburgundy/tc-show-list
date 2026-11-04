// Gets today's shows from every venue and saves them to data/shows.json.
// One venue failing doesn't stop the rest; it's shown as unavailable instead.
import fs from 'node:fs/promises';
import path from 'node:path';
import { VENUES } from './venues/index.js';
import { todayCentral } from './format.js';

const DATA = path.resolve('data');

async function main() {
  const date = todayCentral();
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

  if (venues.every((v) => v.error)) throw new Error('Every venue failed; keeping the old data');

  await fs.mkdir(DATA, { recursive: true });
  await fs.writeFile(path.join(DATA, 'shows.json'),
    JSON.stringify({ date, fetchedAt: new Date().toISOString(), venues }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
