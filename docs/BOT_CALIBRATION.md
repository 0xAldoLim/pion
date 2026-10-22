# Bot calibration checkpoint

## Harness checkpoint — 2026-10-15

At this checkpoint, the harness added `--bots` and `--references` for bounded diagnostics, pairs both colors, clears the result cache between games, records production skill/depth/time settings, separates losses/draws/wins from unresolved cutoffs, and writes a new version-2 report instead of overwriting this historical checkpoint. Default output is `docs/BOT_CALIBRATION_CURRENT.json`; `--output docs/NAME.json` chooses another report. The default cutoff is 200 plies. Completed-only scores are explicitly subject to cutoff bias. Seeds control policy randomness; engine limited-skill randomness and machine-dependent search depth are not fully deterministic.

Real-WASM smoke command: `pnpm calibrate --bots pebble,monarch --references 5 --rounds 1 --max-plies 160 --time-scale 0.1 --seed 20261015 --output docs/BOT_CALIBRATION_SMOKE.json`. All four games ended under chess rules: Pebble lost both colors; Monarch won both colors. There were no adjudications or cutoffs. This verifies the harness and the deployed policy at scaled search budgets. It does **not** calibrate intermediate profiles, establish human Elo, prove adjacent ordering, or justify changing difficulty. No bot parameters were retuned in this milestone. Full transcripts and actual termination reasons are in the smoke report.

Human-comparable calibration still needs many games at normal budgets against independently calibrated opposition. Keep all current numbers labeled estimates until that evidence exists.

## Historical checkpoint

Historical checkpoint: this run predates the 2026-10-14 correction that respects Stockfish's skill-limited move on ordinary turns. See [BOT_STRENGTH_AUDIT.md](BOT_STRENGTH_AUDIT.md) for that defect, its bounded real-engine evidence and the limits of what it proves.

Run `pnpm calibrate --rounds 1 --max-plies 60 --time-scale 0.2 --seed 20261013` on 2026-10-13. The browser harness imports the production bot policies and executes the real bundled WASM engine. Full SAN transcripts, settings and outcomes are in BOT_CALIBRATION.json.

48 games: each of 12 bots played both colors against skill-5/depth-10 and skill-15/depth-14 reference profiles. 8 ended under chess rules; 40 reached the 60-ply cutoff. Pebble and Sprout lost their completed games; Monarch won its two completed games. Other profiles have insufficient completed results. Cutoffs remain unresolved rather than manufactured draws or evaluation adjudications.

Search times were scaled to 20% for this bounded diagnostic. The opponents are local engine profiles, not independently rated players. Four games per bot cannot establish Elo, confidence intervals for playing strength, or monotonic ordering between adjacent personalities. All displayed strength numbers remain provisional bands. No calibrated player rating is inferred from them.

For substantial calibration, run multiple seeds at original budgets, longer limits and more rounds: `pnpm calibrate --rounds 10 --max-plies 250 --time-scale 1 --seed 42`. Compare completed results with independently calibrated reference profiles before revising labels. This can take hours. The harness validates every played move and records actual termination reasons.

Production profiles vary UCI skill, search depth/time, error frequency, probability loss budget, candidate weighting, preferred opening sequence and tactical/positional tendencies. The full-strength profile takes the UCI bestmove. Quick/standard/thoughtful response pace changes the search budget and independently enforces minimum visible delays of 1.5 / 2.8 / 5 seconds. This changes practical strength and is included in the UI’s estimate caveat.

The original identifiers in this checkpoint remain stable, but the UI now uses seven reference-inspired characters across these twelve profiles. This historical run predates that visual rename. Play Now uses continuous estimated strength and separate local Blitz/Rapid player standings; the local Elo formula does not make its opponents statistically calibrated.

## Uncertainty audit — 22 October 2026

Production skill, depth/time, candidate-loss policy, delays and saved Blitz/Rapid standings are unchanged. Existing policy regressions and actual-WASM game workflows remain the behavioral checks. The 48-game historical report predates the skill-choice correction; the four-game current smoke remains a smoke test.

The harness now validates integer/finite bounds and writes version-3 summaries. `scoreRangeIncludingCutoffs` assigns every unresolved game first a loss, then a win: this exposes censoring and is **not** a confidence interval. `decisiveWinWilson95` is a binomial Wilson interval conditional on completed decisive games, excluding draws/cutoffs and assuming independent outcomes; paired openings and engine randomness limit that assumption. Neither statistic is human Elo or proof of adjacent profile ordering.

[BOT_CALIBRATION_UNCERTAINTY.json](BOT_CALIBRATION_UNCERTAINTY.json) derives these summaries from the preserved historical reports. It explicitly records zero new games. No larger benchmark is represented as completed: a meaningful normal-budget multi-seed study with calibrated opposition takes substantially longer than the smoke harness, and is required before retuning. The two endpoint games each have very wide conditional win intervals, reinforcing the existing provisional labels. Unit checks cover zero samples, tiny samples, symmetry and unresolved-result ranges.
