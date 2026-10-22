# Lesson quality validation

22 October 2026. Existing lesson IDs, demonstrations, transfer/recall steps and saved records are retained. New tasks extend the existing player; no rating gates or remote services.

## Content audit

| Lessons audited | Objective and assessment | Improvement / limit |
| --- | --- | --- |
| coordinates | Named square, orientation, legal rook move | Reflected work intentionally remains recognition. |
| board-vision, piece-values, trades | Profitable captures, actual capturing piece and legal recaptures | Compare bishop/queen captures, pinned pawn recapture and a defensive queen move. |
| attacks-defenders, king-rules, special-moves | Real square control, check response, en-passant state | New queen-pawn structure, interposition and complete opening-board en passant. |
| forks | Two targets, checking priority and opponent defense | New pawn-filled fork, forcing preparation sequence, failed-fork question and defense against an enemy fork. |
| pins, skewers, discovered-attacks | Distinguish blocker/king geometry and forcing replies | File pin, rank skewer and bishop-line discovery, rather than color reflection alone. |
| back-rank, king-safety, defensive-resources | Escape squares and concrete legal defense | Create a flight square, capture a checking rook, block a bishop check. |
| development, castling, center, tempo, early-queen | Concrete development targets, legal castling, central contact and forcing exceptions | Queen-pawn structure, Black queenside castle, Caro-Kann break, bishop check with tempo and a verified mate overriding a general principle. |
| open-files, pawn-breaks | File classification and chain targets | Half-open file with a pawn target; French head break compared with the existing base break. These named-plan tasks do not claim unique engine-best moves. |
| queen-mate, rook-mate, calculation | Every king response and final mate/stalemate | Require each learner decision in legal multi-move sequences; save the exact partial line on reload. Immediate Qg6 is explicitly tested as stalemate. |
| promotion, opposition, passed-pawns | Promotion choice, king relationship and support | Capture-promotion, off-file spare pawn and king-supported pawn advance. No unsupported forced-win claim. |
| prophylaxis, sacrifices, remove-defender, candidate-tree | Concrete threats and legal forcing lines | Original demonstrations/questions audited and retained. More diverse advanced positions remain worthwhile only after beginner outcomes are observed. |

Every installed lesson FEN, demonstration and intended objective is replayed by the existing unit suite. New authored tasks are additionally checked against both the original and reflected diagrams; all accepted curated moves and full sequences are legal. Separate fixtures verify pinned recapture illegality, the failed fork's ...Bxe7, the enemy ...Nd3+ fork and actual final checkmate. Final content checks additionally enforce the specifically named queenside castle and capture-promotion, while accepting all safe queen retreats. The pawn-defender task also rejects a legal queen defense, enforcing its stated piece requirement. Plan-task alternatives may be playable: feedback explicitly describes the task rather than branding every deviation a blunder.

## Evidence and correctness

- Reflected transfers are labeled recognition and no longer generate new conceptual-application credit. Existing records remain intact; new evidence adds an optional activity field.
- Unseen, unaided, error-free application is separate from guided completion, recognition and recall. Every conversion decision is required before credit.
- A spaced-recall claim requires an earlier successful lesson event and at least 24 hours, as well as the due date. Immediate first exposure cannot count as retention.
- Quick challenges prefer unseen authored positions. Due recall can reopen completed work; hints/errors persist within an attempt.
- Confirmed scheduling defect: the early-repeat path returned a spread of the entire lesson record, overwriting new completion/evidence fields. It now returns only repetition fields. A unit regression and the consecutive-application browser journey cover this.
- Sequence progress and activity metadata are optional additions to existing records/backup v4. Old versions remain accepted. A malformed local sequence prefix is ignored by the player rather than executed.

## Verification

Eight desktop/mobile journeys pass: the existing board-awareness/review-to-learning workflows plus new capture-feedback/hint-reload/application and conversion-reload scenarios. Typecheck and production build pass. Full unit/static and release/offline results are recorded separately in TEST_RESULTS.md; these checks do not prove a rise in human Elo.
