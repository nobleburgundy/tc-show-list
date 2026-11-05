// All venues. The page lists them alphabetically (ignoring "The"); visitors can
// reorder them on the Settings page, which saves to their browser.
// To add one: make a file like dubliner.js that exports { id, name, area, url, shows(date) }
// and add it here. shows() returns [{ title, start, end, url, cancelled, note }],
// or { shows, notice } to show a message under the venue.
import amsterdam from './amsterdam.js';
import berlin from './berlin.js';
import club331 from './club331.js';
import dubliner from './dubliner.js';
import icehouse from './icehouse.js';
import metronome from './metronome.js';
import parkway from './parkway.js';
import schooner from './schooner.js';
import uptownvfw from './uptownvfw.js';
import volsteads from './volsteads.js';
import whitesquirrel from './whitesquirrel.js';

const sortName = (v) => v.name.replace(/^the\s+/i, '').toLowerCase();

export const VENUES = [
  amsterdam, berlin, club331, dubliner, icehouse, metronome, parkway, schooner, uptownvfw, volsteads, whitesquirrel,
].sort((a, b) => sortName(a).localeCompare(sortName(b), 'en', { numeric: true }));
