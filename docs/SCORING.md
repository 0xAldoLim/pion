# Pion scoring 1.0.0

All UCI scores are White-normalized tagged values. Mate winner and distance remain separate from centipawns, including mate-zero terminal positions. Every review evaluates unrestricted candidates and the played move using `searchmoves` at the same root FEN, equivalent depth/time/hash limits and cleared hash. MultiPV differs between candidate and restricted searches; recorded search depths expose this analysis uncertainty.

## Chess.com-inspired interpretation

Expected points = `1 / (1 + exp(-0.004 * cp))` from the mover's perspective. This is an independently chosen logistic model. Mate = 1 for the winning side, 0 for the losing side; drawn terminal positions = 0.5. Loss is nonnegative best-versus-played expected-point difference.

Best requires the top move and loss <=0.001. Ordinary bands: Excellent <0.02; Good >=0.02 and <0.05; Inaccuracy >=0.05 and <0.10; Mistake >=0.10 and <0.20; Blunder >=0.20. Boundaries fall into the more severe band. Accuracy = `100 * exp(-8 * loss)`; game aggregate is the per-side arithmetic mean. No proprietary parity is claimed.

## Pion Independent interpretation

Win percentage = `50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)`.

Per-move accuracy = `clamp(103.1668 * exp(-0.04354 * max(0, before - after)) - 3.1669, 0, 100)` as explicitly requested. Zero-loss accuracy is 99.9999 before display rounding. Mate handling uses the winner directly; never artificial centipawn sentinels. Categories use win-percentage loss divided by 100 and the same explicit ordinary thresholds.

Game aggregate follows the volatility/harmonic structure in Lichess's published approach: window length `floor(totalPlies / 10)` clamped 2–8; prepend repeated initial windows to align the rolling windows with adjacent evaluations; standard-deviation weights clamped 0.5–12; compute per-side weighted and harmonic means, then their arithmetic mean. Zero accuracy makes the harmonic component zero. Include book and forced moves without upstream's score shift/floor. Empty sides return null. Partial results are labeled provisional.

Current upstream Lichess source includes different precision constants and an uncertainty bonus. Pion retains the requested coefficients and omits that bonus. This is Pion's scoring interpretation, not an exact Lichess score replica. Primary references: https://lichess.org/page/accuracy and https://github.com/lichess-org/lila/blob/master/modules/analyse/src/main/AccuracyPercent.scala.

## Special precedence

Forced is metadata; with one legal move keep the ordinary label. A verified book path may supersede only losses below 0.05. Next: Brilliant, Great, Miss, ordinary band. Brilliant requires an actual offered nonpawn exchange loss >=2, both root searches at depth >=18, top move/negligible loss, non-crushing start, a deeper legal search after accepting the sacrifice, compensation and exclusion of immediate material-restoring trades. It is deliberately conservative and may be unavailable in fast analysis.

Great requires top move, negligible loss, search depth >=14 and >=0.20 probability gap to the next candidate. Miss requires a verified mate opportunity or an opponent's preceding error plus a concrete tactical best-move fact, and loss >=0.05. Evidence, legal variations, FENs, settings, actual depths, engine/version/mode and completion state are stored for every row. Switching modes reads separately calculated results.

Performance band is a visible uncalibrated heuristic: midpoint `300 + 17 * accuracy` with ±500 and a minimum 10-move sample. It is not Elo. Training competence comes from unseen-position success, hint use, retention and repeated bot results, separately measured.
