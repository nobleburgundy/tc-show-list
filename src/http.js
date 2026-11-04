const UA = 'tc-show-list/1.0 (plain-text show listing; low-volume)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch a URL as text, retrying a couple of times.
export async function getText(url) {
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
