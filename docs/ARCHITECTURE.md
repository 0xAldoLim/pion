# Architecture

Static React application. chess.js is the legal-move authority; Chessground is rendering/input only. All imported text is rendered as React text and validated with bounded schemas. Local assets share the application's origin and CSP excludes external connections.

`src/chess` owns tagged evaluations, scoring, PGN and position identity. `src/engine` owns UCI workers, a bounded priority queue and caches; live gameplay preempts background review. Bot and review channels serialize CPU work. An AbortSignal and generation identity guard every consumer against stale results. Browser workers terminate on timeout/crash and recover on the next request.

`src/storage` owns versioned Dexie tables, preferences, transactional restore, games, review evidence, puzzle attempts, repertoire, mistakes, training events and asset metadata. Persist moves immediately; store remaining clocks and pause time while the app is closed. Restore validates all tables before starting a replacement transaction.

`src/coach` uses legal board facts and engine lines, with conservative templates. Unsupported strategic interpretation is omitted. `src/learning` schedules mistakes and repertoire by retrieval success rather than activity counts.

Vite generates same-origin static chunks and a prompt-update PWA. The default lite WASM engine is precached; full single-thread assets are an optional integrity-checked Cache Storage pack. Threads remain one for the distributed engine builds. No cloud inference fallback.
