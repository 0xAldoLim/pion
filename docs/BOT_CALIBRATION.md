# Bot calibration checkpoint

Run `pnpm calibrate --rounds 1 --max-plies 60 --time-scale 0.2 --seed 20261013` on 2026-10-13. The browser harness imports the production bot policies and executes the real bundled WASM engine. Full SAN transcripts, settings and outcomes are in BOT_CALIBRATION.json.

48 games: each of 12 bots played both colors against skill-5/depth-10 and skill-15/depth-14 reference profiles. 8 ended under chess rules; 40 reached the 60-ply cutoff. Pebble and Sprout lost their completed games; Monarch won its two completed games. Other profiles have insufficient completed results. Cutoffs remain unresolved rather than manufactured draws or evaluation adjudications.

Search times were scaled to 20% for this bounded diagnostic. The opponents are local engine profiles, not independently rated players. Four games per bot cannot establish Elo, confidence intervals for playing strength, or monotonic ordering between adjacent personalities. All displayed strength numbers remain provisional bands. No calibrated player rating is inferred from them.

For substantial calibration, run multiple seeds at original budgets, longer limits and more rounds: `pnpm calibrate --rounds 10 --max-plies 250 --time-scale 1 --seed 42`. Compare completed results with independently calibrated reference profiles before revising labels. This can take hours. The harness validates every played move and records actual termination reasons.

Production profiles vary UCI skill, search depth/time, error frequency, probability loss budget, candidate weighting, preferred opening sequence and tactical/positional tendencies. The full-strength profile takes the UCI bestmove. Quick/standard/thoughtful response pace changes the search budget and independently enforces minimum visible delays of 1.5 / 2.8 / 5 seconds. This changes practical strength and is included in the UI’s estimate caveat.

The original identifiers in this checkpoint remain stable, but the UI now uses seven reference-inspired characters across these twelve profiles. This historical run predates that visual rename. Play Now uses continuous estimated strength and separate local Blitz/Rapid player standings; the local Elo formula does not make its opponents statistically calibrated.
