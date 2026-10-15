# Decisions

1. 2026-10-13: preserve required SSH origin; SSH host key verified using GitHub's published Ed25519 key in task-local known_hosts. SSH authentication fails with `Permission denied (publickey)`. Configure HTTPS push URL for the **same authorized repository**, and verify actual push results. No unrelated destination or force push.
2. Use GPL-3.0-or-later for the combined distribution; retain upstream MIT/BSD/ISC/CC0 notices.
3. Replace Patzer's server coupling; reuse its compact CC0 puzzle selection and selected pure tactical ideas with attribution.
4. Tagged mate scores, complete FEN and settings identities, White-normalized scores. Never feed mate sentinels into probability formulas.
5. Conservative special classifications require evidence and sufficient search. No early-ply Book fallback, no forced-move eleventh category, no fabricated Elo calibration.
6. Original SVG characters/pieces and procedural local sounds keep assets reproducible and offline. No copied commercial artwork.
7. Asset binaries generated from locked packages during installation/build preparation. Retain engine source references, exact versions, SHA-256 hashes and GPL notices.
8. The user supplied a seven-character reference. Create small vector adaptations preserving silhouettes and defining features; retain legacy bot IDs for saved-game compatibility and use the new names in the UI and new PGNs.
9. Separate visible bot response delay from engine search duration. Cached/book moves receive the same delay, clock time continues to count, and cancellation or a finished game prevents a deferred move.
10. Blitz and Rapid use independent local Elo standings, initial 600 / K=32 / floor 100. Match targets vary by Â±20; continuous engine policies approximate that target. Outcome, rating change and a settlement marker are stored atomically. Later autosaves cannot reopen a settled rated game.
11. Opening tiers rank learning fit, not objective chess strength. Attribute player examples to the family, with external source links. Do not invent specialist associations for uncurated variations.
12. Appearance becomes visible after its IndexedDB commit so immediate reloads preserve it. Controlled settings inputs remain optimistic. New games are persisted and receive their own URL before interaction begins.
13. Board geometry belongs to the shared Board component. Keep the visual frame outside Chessgroundâ€™s measured host, center its rounded playing container, and align evaluation with the playing squares rather than the move controls. Reuse Chessgroundâ€™s scroll handling instead of replacing its DOM on scroll.
14. Premoves use a transient queue of at most five and a separate preview. No preview enters the saved game or engine position. Validate each head move against the actual reply, cancel the sequence if illegal, preserve the chosen promotion, and deduct at least 0.1 seconds before increment. Existing preferences migrate to enabled; users can disable it.

15. 2026-10-15: preserve the chess foundation while replacing passive study with 31 stable, resumable short lessons. View/practice/transfer/spaced recall stay distinct. Add tables at v6 and preference defaults at v7; no inferred legacy mastery or destructive migrations.
16. Opening teaching uses legal position identities and authored explanations. ECO labels, personal repertoire, curated commentary and local engine recommendations have distinct sources. No invented popularity or expert authority. Legacy tiers move into optional detail.
17. Different legal opening moves get known-line or real-engine comparison and retry/continue choices. Guided exploration does not advance independent recall schedules. Practical training starts a normal unrated game from the actual position.
18. Daily focus needs actual completed current reviews and distinct-game evidence; assisted practice segments are excluded. Skill counts and non-overlapping review-period rates remain observations, not mastery scores.
19. Rated-active assistance has a shared deny policy and an active-review gate. Practice feedback defaults off, runs separately at full strength, and states observed depth/provisional status. User-controlled hints/undo remain independent.
20. Fourteen official broadcast games and original study annotations retain CC BY-SA 4.0 separately from application GPL and CC0 puzzle/ECO data. Historical predictions are not forced puzzles; no fake evaluations, quotations or date attribution.
21. Lazy routes/data reduce startup cost but remain fully precached offline. Keep base Chessground CSS before custom styles in the entry point; validate actual coordinates/frame bounds after code splitting.
22. Calibration tooling preserves historical reports, pairs colors, records actual terminations and leaves unresolved cutoffs unresolved. Four scaled-budget endpoint games validate the harness and do not justify Elo claims or retuning.

23. Final recommendation audit: do not infer a learner’s king-safety error from the opponent’s contextual back-rank geometry or infer a missed enemy tactic from the learner’s own fork. Require a mating threat/score or inspect the actual legal opponent PV reply. Cache categories only by immutable review-row identity.
