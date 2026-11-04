const UA = 'tc-show-list/1.0 (plain-text show listing; low-volume)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch a URL as text, retrying a couple of times. Each URL is downloaded once per
// run, since today's and tomorrow's lists often read the same page.
const cache = new Map();
export function getText(url) {
  if (!cache.has(url)) cache.set(url, download(url));
  return cache.get(url);
}

async function download(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt >= 3) throw new Error(`Failed to fetch ${url}: ${err.message}`);
      await sleep(2000 * attempt);
    }
  }
}

export const getJson = async (url) => JSON.parse(await getText(url));
