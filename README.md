# Twin Cities Shows

Today's shows at Minneapolis/St. Paul venues, as a plain-text static site.

```sh
npm install
npm run all     # fetch + build to dist/
npm run serve   # preview at http://localhost:8080
```

**Add a venue:** one file in `src/venues/`, listed in `src/venues/index.js`. Helpers in `src/sources/` handle common calendar plugins.

**Schooner Tavern:** they only post a monthly poster image, so type each month into `listings/schooner.txt`. The fetch log warns when a new one is up.

**Icons:** the guitar + skyline art is in `assets/`. After editing it, run `python3 scripts/make-icons.py` (needs Pillow and Chrome).

**Deploy:** push to `main` and set **Settings → Pages → Source** to **GitHub Actions**. It rebuilds just after midnight and four times during the day.

**If a venue breaks:** its site probably changed, so fix that venue's file. The footer names any venue that failed.
