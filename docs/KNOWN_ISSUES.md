# Known issues

- SSH authentication to GitHub fails with `Permission denied (publickey)`. Authenticated HTTPS push transport to the same authorized repository works.
- Implementation and acceptance testing are in progress. No stable-release claim yet.
- Bot Elo and per-game performance require statistical calibration before they can be represented as measured ratings.
- Firefox's downloaded executable cannot start on this Windows host: incorrect side-by-side configuration (missing mozglue assembly; Playwright reports spawn UNKNOWN). The full Firefox suite passes on GitHub Ubuntu CI, alongside Chromium desktop/mobile.
- Imported reviews are user-provided analysis records. Their shapes, history identity, numerical bounds and every PV/evidence sequence are validated and scores reconstructed; this cannot authenticate the original engine search cryptographically.
- Default JS bundle includes offline datasets (~593 KB gzip); route/data splitting remains a performance improvement.
