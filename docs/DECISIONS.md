# Decisions

1. 2026-10-13: preserve required SSH origin; SSH host key verified using GitHub's published Ed25519 key in task-local known_hosts. SSH authentication fails with `Permission denied (publickey)`. Configure HTTPS push URL for the **same authorized repository**, and verify actual push results. No unrelated destination or force push.
2. Use GPL-3.0-or-later for the combined distribution; retain upstream MIT/BSD/ISC/CC0 notices.
3. Replace Patzer's server coupling; reuse its compact CC0 puzzle selection and selected pure tactical ideas with attribution.
4. Tagged mate scores, complete FEN and settings identities, White-normalized scores. Never feed mate sentinels into probability formulas.
5. Conservative special classifications require evidence and sufficient search. No early-ply Book fallback, no forced-move eleventh category, no fabricated Elo calibration.
6. Original SVG characters/pieces and procedural local sounds keep assets reproducible and offline. No copied commercial artwork.
7. Asset binaries generated from locked packages during installation/build preparation. Retain engine source references, exact versions, SHA-256 hashes and GPL notices.
