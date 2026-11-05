// Reads data/shows.json and writes dist/: index.html (today), tomorrow.html and settings.html.
// Everything is fixed-width text like gopher_plain, but built from real headings and
// lists (laid out with CSS) so it reads well with screen readers and wraps cleanly.
import fs from 'node:fs/promises';
import path from 'node:path';
import { SITE } from './config.js';
import { esc } from './text.js';
import { longDate, timeShort, updatedLabel } from './format.js';

const DATA = path.resolve('data');
const OUT = path.resolve('dist');
const STATIC = path.resolve('static');

// "2026-11-04" -> "Wed Nov 4"
const shortDate = (iso) => longDate(iso).replace(/^(\w{3})\w*, (\w{3})\w* (\d+)$/, '$1 $2 $3');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
// Links to venue sites open in a new tab, so the list stays open.
const link = (href, text, cls = '') => (href
  ? `<a href="${esc(href)}" target="_blank" rel="noopener"${cls ? ` class="${cls}"` : ''}>${esc(text)}</a>`
  : `<span${cls ? ` class="${cls}"` : ''}>${esc(text)}</span>`);

function showHtml(s) {
  const cls = ['show', s.cancelled && 'cancelled'].filter(Boolean).join(' ');
  const attrs = [`class="${cls}"`];
  if (s.start) attrs.push(`data-start="${esc(s.start)}"`);
  if (s.end) attrs.push(`data-end="${esc(s.end)}"`);
  const note = [s.cancelled && 'Cancelled', s.note].filter(Boolean).join('. ');
  return `<li ${attrs.join(' ')}><span class="time">${esc(timeShort(s.start))}</span>`
    + `<span class="what">${link(s.url, s.title)}${note ? `<span class="note">${esc(note)}</span>` : ''}</span></li>`;
}

function venueHtml(v) {
  return `<section class="venue" data-venue="${esc(v.id)}">
<h2 class="row">${link(v.url, v.name.toUpperCase())}<span class="area">${esc(v.area)}</span></h2>
${v.notice ? `<p class="notice">${esc(v.notice)}</p>\n` : ''}<ul class="shows">
${v.shows.map(showHtml).join('\n')}
</ul>
</section>`;
}


function page({ title, current, date, offset, body, footer, script = '' }) {
  const nav = [['./', 'Today'], ['tomorrow.html', 'Tomorrow'], ['settings.html', 'Settings']].map(([href, label]) => (label === current
    ? `<a href="${href}" aria-current="page"><b>${label}</b></a>`
    : `<a href="${href}">${label}</a>`)).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="Today's shows at Twin Cities venues, in plain text.">
<link rel="stylesheet" href="style.css">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-title" content="TC Shows">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#141414" media="(prefers-color-scheme: dark)">
</head>
<body>
<header>
<div class="row"><h1><a href="./">${esc(SITE.title.toUpperCase())}</a></h1>${date ? `<span>${esc(shortDate(date))}</span>` : ''}</div>
<nav aria-label="Pages">${nav}</nav>
</header>
<main${date ? ` data-date="${esc(date)}" data-offset="${offset}"` : ''}>
${body}
</main>
<footer>${footer}</footer>
${script}</body>
</html>
`;
}

const readScript = (name) => fs.readFile(path.join(STATIC, 'js', name), 'utf8');

// One day's page (Today or Tomorrow). Venues with no shows that day aren't listed.
function dayPage({ date, venues }, { label, offset, fetchedAt, script }) {
  const withShows = venues.filter((v) => v.shows?.length);
  const failed = venues.filter((v) => v.error);
  const total = withShows.reduce((n, v) => n + v.shows.length, 0);

  const footer = [
    `${plural(total, 'show')} at ${plural(withShows.length, 'venue')}`,
    // Say which venues couldn't be checked, so "not listed" never quietly means "broken".
    failed.length ? `Couldn't check: ${failed.map((v) => esc(v.name)).join(', ')}` : '',
    `Updated ${esc(updatedLabel(fetchedAt))}`,
  ].filter(Boolean).join('<br>');

  return {
    total,
    html: page({
      title: `${SITE.title}: ${longDate(date)}`,
      current: label,
      date,
      offset,
      body: withShows.length ? withShows.map(venueHtml).join('\n') : `<p>No shows listed ${label.toLowerCase()}.</p>`,
      footer,
      script,
    }),
  };
}

async function main() {
  const data = JSON.parse(await fs.readFile(path.join(DATA, 'shows.json'), 'utf8'));
  const [today, tomorrow] = data.days;
  const script = `<script>\n${await readScript('day.js')}</script>\n`;
  const opts = { fetchedAt: data.fetchedAt, script };
  const index = dayPage(today, { ...opts, label: 'Today', offset: 0 });
  const next = dayPage(tomorrow, { ...opts, label: 'Tomorrow', offset: 1 });

  const venues = today.venues.map((v) => ({ id: v.id, name: v.name, area: v.area }));
  const settings = page({
    title: `${SITE.title}: Settings`,
    current: 'Settings',
    body: `<section>
<h2>VENUE ORDER</h2>
<p class="hint">Drag venues by the <span aria-hidden="true">≡</span> handle to set the order on the Today and Tomorrow pages.</p>
<p id="keys" class="sr-only">Use the up and down arrow keys to move this venue. Home and End move it to the top or bottom.</p>
<p id="nojs">This page needs JavaScript turned on.</p>
<ol id="order" class="sortable" hidden></ol>
<p><button type="button" class="link" id="reset" hidden>Reset to A–Z</button></p>
<p id="status" class="note" role="status" aria-live="polite"></p>
</section>`,
    footer: 'Your order is saved in this browser only.',
    script: `<script>\nvar VENUES = ${JSON.stringify(venues).replace(/</g, '\\u003c')};\n${await readScript('settings.js')}</script>\n`,
  });

  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  await fs.writeFile(path.join(OUT, 'index.html'), index.html);
  await fs.writeFile(path.join(OUT, 'tomorrow.html'), next.html);
  await fs.writeFile(path.join(OUT, 'settings.html'), settings);
  const files = ['style.css', 'favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png'];
  for (const f of files) await fs.copyFile(path.join(STATIC, f), path.join(OUT, f));
  console.log(`Built dist/: ${index.total} shows today, ${next.total} tomorrow`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
