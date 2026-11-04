// Reads a hand-typed listings file (listings/<name>.txt) for venues that only
// post their schedule as an image. Format is described at the top of each file.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseTime } from '../format.js';

export async function readListings(name) {
  const file = path.resolve('listings', `${name}.txt`);
  const text = await fs.readFile(file, 'utf8');
  const shows = [];
  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) return;
    const m = line.match(/^(\d{4}-\d{2}-\d{2})\s+(\S+)\s+(.+)$/);
    const time = m && parseTime(m[2]);
    if (!m || !time) throw new Error(`${name}.txt line ${i + 1} not understood: "${line}"`);
    shows.push({ date: m[1], start: `${m[1]}T${time}:00`, title: m[3].trim() });
  });
  return shows;
}

// "2026-11-04" -> "2026-11"
export const monthOf = (date) => date.slice(0, 7);
