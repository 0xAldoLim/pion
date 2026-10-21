# Pion

**Your chess journey, at your own pace.**

Pion is a free, open-source chess training app that runs in your browser. Play friendly opponents, learn through interactive lessons, explore openings, and review your games with Stockfish. No account is required, and your training data stays on your device.

[Getting started](docs/GETTING_STARTED.md) · [Run locally](#run-locally) · [Contribute](#contribute) · [License](#license)

## Play, learn, and improve

- **Play at your level.** Choose White, Black, or Random in **Play now**, then select a Blitz or Rapid time control. Practice against twelve difficulty profiles featuring Ponke, Lonke, Gonke, Konke, Bonke, Zonke, and Donke, or share a board in local hotseat mode.
- **Learn by making moves.** Work through 31 interactive lessons across six stages, with board demonstrations, progressive hints, and saved progress. Follow the guided path or jump into any lesson.
- **Understand your openings.** Study twelve opening families, explore variations and transpositions, and practice either color. Build a personal repertoire with notes, folders, PGN imports, and scheduled recall. During games, the recognized opening appears above your move history.
- **Train your tactical vision.** Solve puzzles by theme, revisit mistakes, and practice positions drawn from your reviewed games. Explore fourteen annotated master-game studies and two classic Morphy mating exercises.
- **Review the decisions that mattered.** Watch the board rewind and follow your game as Stockfish analyzes it locally. Inspect move-quality badges, see what the opponent can do after a mistake, and turn those positions into focused practice. Ponke's local coach connects explanations to the position on the board.
- **Make the board your own.** Switch between light and dark modes, seven board themes, and four piece sets. Adjust text size, contrast, motion, sounds, bot response pace, and practice assistance. Queue capture premoves and conditional recaptures, draw your own arrows during games, or use keyboard move and annotation controls.

## Start your first session

Once Pion is running, choose an activity from the navigation:

1. **Play now:** choose your side and a duration to start a local rated game against a bot. For unrated practice, open **Play** and select an opponent.
2. **Learn:** open **Guided path** for a starting point, **Lesson library** to choose a topic, or **Master studies** to explore historical games.
3. **Openings:** discover an opening, follow the board demonstration, and practice a short line before adding it to **My repertoire**.
4. **Game review:** finish a game and select **Review this game → Run review** to find useful moments to revisit.

The [getting-started guide](docs/GETTING_STARTED.md) walks through lessons, opening practice, repertoire review, and assistance settings.

### Blitz, Rapid, and practice

Pion keeps separate local ratings for the two **Play now** categories:

| Category | Available durations | Rating affected |
| --- | --- | --- |
| Blitz | 1, 3, or 5 minutes | Blitz only |
| Rapid | 10, 15, or 30 minutes | Rapid only |
| Practice | Your selected practice time control | Neither |

Both ratings start at 600. Rated opponents are matched within approximately 20 points of your Pion rating. Game results update only the selected category; practice leaves both ratings unchanged. Practice offers live evaluation, hints, undo, pause, and coaching. Rated games keep assistance off, with a full review available after the result is saved.

These ratings track progress within Pion. Bot strength is estimated, and Pion ratings and review accuracy scores are not interchangeable with ratings or scores on other chess platforms. Pion supports bot games and local hotseat play; online multiplayer is not included.

## Privacy, offline use, and backups

Games, ratings, lessons, repertoire, and preferences are stored in your browser. Analysis and coaching run on your device, with no account, advertising, telemetry, or paid analysis service. There is no automatic cloud sync between browsers or devices.

When using a production build, wait for **Offline ready** before disconnecting. Essential lessons, puzzles, opening content, master studies, and the default Stockfish lite engine are then available offline. Browsers that support app installation can also install Pion from their address bar or browser menu. Updates prompt you to reload so you can save your current activity first.

Use **Settings → Data & offline content → Export full backup** to keep a copy of your progress or move it to another browser. Clearing browser storage, changing the site's address, or using another browser profile can make existing data unavailable. Restoring a backup replaces the current local user data, so export a current copy before restoring.

## Run locally

You need **Node.js 24.11 or later**, **pnpm 11.25.0**, and Git. No API keys or backend services are required.

```sh
git clone https://github.com/0xAldoLim/pion.git
cd pion
pnpm install --frozen-lockfile
pnpm assets
pnpm dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). The asset command downloads the pinned Stockfish engine files and verifies their checksums. It requires an internet connection on the first run.

To try the installable app and offline behavior, stop the development server and run a production preview:

```sh
pnpm build
pnpm preview
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) and wait for **Offline ready**. Development and preview use different addresses and therefore have separate browser storage; use backups to transfer progress between them.

### Optional full Stockfish engine

The lite engine is included in the default setup. To offer the larger full engine, prepare its assets before building:

```sh
pnpm assets:deep
pnpm build
```

Users can then choose **Settings → Local engine → Install full engine pack**. Availability depends on whether the deployed build includes that pack. Both engines run in a single thread, without requiring cross-origin isolation.

## Host your own copy

After preparing the engine assets and running `pnpm build`, serve the generated `dist/` directory from a static host. Keep the application and its engine assets on the same origin. Use HTTPS, or localhost for testing, so the service worker and offline installation can work. No application server or database is needed.

When distributing a build, include the applicable license notices and corresponding source information described in [Licensing and source distribution](docs/LICENSING.md).

## Contribute

Bug reports, usability feedback, documentation improvements, lessons, and code contributions are welcome. Use [GitHub Issues](https://github.com/0xAldoLim/pion/issues) to report a problem or discuss an idea, and open a pull request for changes. For UI issues, include your browser, screen size, steps to reproduce, and a screenshot when useful. Share saved games or backups only after checking them for information you want to keep private.

Pion uses React, TypeScript, and Vite for the interface, Chessground and chess.js for the board and rules, Stockfish WASM for analysis, and Dexie/IndexedDB for local storage.

Run the checks relevant to your change:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm audit:licenses
pnpm build
pnpm exec playwright install chromium firefox
pnpm test:e2e
```

Browser tests use the production preview on port 4173. On Linux, Playwright may also require system dependencies; use `pnpm exec playwright install --with-deps chromium firefox`. The GitHub Actions workflow runs the full Chromium, mobile, and Firefox test suite.

Useful project references:

- [Architecture](docs/ARCHITECTURE.md) and [learning architecture](docs/LEARNING_ARCHITECTURE.md)
- [Opening explorer](docs/OPENING_EXPLORER.md) and [lesson content standards](docs/LESSON_CONTENT_STANDARDS.md)
- [Review scoring methodology](docs/SCORING.md) and [bot calibration](docs/BOT_CALIBRATION.md)
- [Dataset sources and attribution](docs/DATASET_PROVENANCE.md)

## License

Pion's application source is licensed under [GPL-3.0-or-later](LICENSE). Third-party components and datasets retain their own licenses, including CC0 puzzle and opening data and CC BY-SA 4.0 master-study material.

See [Third-party notices](THIRD_PARTY_NOTICES.md), [dataset provenance](docs/DATASET_PROVENANCE.md), and [licensing information](docs/LICENSING.md) for attribution and distribution details.
