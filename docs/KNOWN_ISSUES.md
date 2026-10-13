# Known issues

- SSH authentication to GitHub fails with `Permission denied (publickey)`. Authenticated HTTPS push transport to the same authorized repository works.
- Implementation and acceptance testing are in progress. No stable-release claim yet.
- Bot Elo and per-game performance require statistical calibration before they can be represented as measured ratings.
- Firefox's downloaded executable cannot start on this Windows host: incorrect side-by-side configuration (Playwright reports spawn UNKNOWN). No Firefox application test has executed. Chromium desktop and Pixel 7 emulation pass.
- Backup currently restores raw user data but invalidates derived engine reviews; preserving validated review evidence is the next storage improvement.
- Default JS bundle includes offline datasets (~593 KB gzip); route/data splitting remains a performance improvement.
