# Known issues

- SSH authentication to GitHub fails with `Permission denied (publickey)`. Authenticated HTTPS push transport to the same authorized repository works.
- Bot strength and per-game performance are estimates; the 48-game diagnostic has too many unresolved cutoffs to establish measured Elo. Separate local Blitz/Rapid player standings are implemented and do not imply equivalence to an online service.
- Firefox's downloaded executable cannot start on this Windows host: incorrect side-by-side configuration (missing mozglue assembly; Playwright reports spawn UNKNOWN). The full Firefox suite passes on GitHub Ubuntu CI, alongside Chromium desktop/mobile.
- Imported reviews are user-provided analysis records. Their shapes, history identity, numerical bounds and every PV/evidence sequence are validated and scores reconstructed; this cannot authenticate the original engine search cryptographically.
- Default JS bundle includes offline datasets (~609 KB gzip); route/data splitting remains a performance improvement. Default offline precache is approximately 4.9 MiB; the optional full engine is roughly 95 MB and requires explicit installation.
- Master exercises currently cover two verified positions from one historical game. Unverified or uncertain game continuations are excluded.
- Opening tiers cover curated families and reflect learning fit; uncurated entries have no invented tier or GM specialist.
