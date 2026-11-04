// Date and time helpers. All times are Minnesota (Central) time.

// Today's date in Minnesota, as YYYY-MM-DD. Override with DATE=2026-11-07 for testing.
export function todayCentral(now = new Date()) {
  if (process.env.DATE) return process.env.DATE;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(now);
}

// "2026-11-04" + 1 -> "2026-11-05"
export function addDays(iso, n) {
  return new Date(Date.parse(`${iso}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
}

// "2026-11-04" -> "Wednesday, November 4"
export function longDate(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date(`${iso}T12:00:00Z`));
}

// "2026-11-04T19:00:00" -> "7:00p". Venue feeds give local times with no zone.
export function timeShort(local) {
  const m = String(local || '').match(/T(\d{2}):(\d{2})/);
  if (!m) return ''; // no time listed (e.g. a holiday note)
  const h = Number(m[1]);
  return `${((h + 11) % 12) + 1}:${m[2]}${h >= 12 ? 'p' : 'a'}`;
}

export function updatedLabel(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso)) + ' CT';
}

// "9:30pm" -> "21:30", "7pm" -> "19:00", "6-8pm" -> "18:00". Tolerates stray letters after.
export function parseTime(s) {
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:[-–]\s*\d{1,2}(?::\d{2})?\s*(am|pm)?)?/i);
  if (!m || !(m[3] || m[4])) return null;
  let h = Number(m[1]);
  const ampm = (m[3] || m[4]).toLowerCase();
  if (ampm === 'pm' && h < 12) h += 12;
  if (ampm === 'am' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2] || '00'}`;
}
