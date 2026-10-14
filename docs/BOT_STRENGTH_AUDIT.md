# Bot skill-policy audit — 2026-10-14

A real implementation defect affected limited-strength bots. Stockfish's `bestmove` incorporates its Skill Level setting, while its analysis candidates describe stronger alternatives. Pion discarded the skill-limited choice on ordinary turns and re-selected a near-best analysis move. Depth and deliberate error settings still differed between profiles, but this selection undid much of the configured skill reduction.

The fix uses Stockfish's legal skill-limited choice on non-error turns. The existing deliberate-error branch, opening preferences, depths, time budgets, error probabilities, loss budgets, full-strength policy, and rating labels are unchanged. This is a correction to honoring the configured skill, rather than an arbitrary reduction based on a player's losses.

The bundled Stockfish.js 19.0.1 lite WASM engine was tested with the 600-rated practice profile and a matched 600 opponent at their original search settings. Each policy searched six legal positions three times with the result cache cleared. Three deterministic non-error selections were sampled per result. These are 36 searches and 108 policy selections per audit.

| Policy | Before: selections overriding limited choice | Before: selections stronger than limited choice | After: overrides / stronger selections |
|---|---:|---:|---:|
| Practice 600 | 47 / 54 | 35 / 54 | 0 / 54; 0 / 54 |
| Matched 600 | 40 / 54 | 32 / 54 | 0 / 54; 0 / 54 |

Raw positions, engine moves, decisions and summaries are in [BOT_STRENGTH_AUDIT.json](BOT_STRENGTH_AUDIT.json). Before and after searches are independent because Skill Level uses randomized move selection. “Stronger” here means the existing Pion win-percent interpretation of the same search's candidate score, not a measured improvement in game results.

This audit verifies that the configured engine choice reaches gameplay. It does not establish an exact human Elo, a rating confidence interval, or the user's playing level. The displayed ratings remain estimates. The earlier [calibration checkpoint](BOT_CALIBRATION.md) is historical and predates this policy correction.

Primary reference: [Stockfish's Skill Level documentation](https://official-stockfish.github.io/docs/stockfish-wiki/Stockfish-FAQ.html#how-do-skill-level-and-uci-elo-work) describes how a lower skill chooses a deliberately suboptimal move.
