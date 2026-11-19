# Gemrift

A responsive, dependency-free showcase for Gemrift, featuring authentic in-game
character captures, real gameplay screenshots, and a locally hosted gameplay video.
Current gameplay leads the page: brilliant-cut gold crystals, cracked slate
boulders, X-braced steel walls, embossed toolbar controls, and a unified raised
HUD display box for gems, time, and score. The page uses the game's navy cave
floor, slate steel, copper earth, and gold crystal palette.

## Current game experience

- The 18-second Hasty Allotment Plaza trailer is Windows gameplay with sound.
  Screenshots, the Milo pose strip, and the mini-map/HUD close-up are authentic
  captures from the current Godot 4.7.2 .NET build.
- The opening title screen provides a top-left 30-language selector, a 5-gem
  difficulty slider, and a *"Show me the game play"* demo alongside *Start game*.
- Junior is the default of five difficulty levels (`Junior`, `Senior`,
  `Principal`, `Expert`, `Distinguished`). Difficulty does not change cave
  layouts or enemy populations; at `Junior` and `Senior` the exit opens at the
  cave's gem quota, while from `Principal` up the exit requires every collectible
  gem in the cave (`diamondsRequiredMax`).
- The clock is relaxed by default: zero removes the remaining-time bonus, not
  the attempt. Strict clock is optional. Meeting the gem goal drops a green
  *Quota met* notice at the top of the cave view; fresh cave entries reveal
  cell-by-cell over two seconds while retries start immediately.
- Hold V to scout with play and the clock paused. The full-cave mini map can be
  hidden with Ctrl+X and restored with Ctrl+Z.
- Settings is organized into four tabs (`Game`, `Sound`, `Graphics`, `Controls`)
  with high contrast, reduced motion, grid-line intensity (`G`), miner cell box
  (`B`), sound captions, volume, and remappable controls and menu shortcuts.
  Attempts are unlimited; the death banner names the retry key.
- Live room resolutions (*"Show me resolution"* bulb) play verified step-by-step
  JSON replays directly on the cave board completely offline across all 215 caves
  and all five difficulties—with pause/resume, `1×`/`2×`/`4×`/`8×` speed, replay,
  and Esc close (no external MP4 downloads or video cache). Caves 1–20 are free
  immediately; from cave 21 onward, 19 failures on a cave unlock that cave's
  resolution for everyone on every platform, while an active full Microsoft Store
  license and 2 failures on one cave unlock resolutions across the entire campaign.
- Windows releases ship native `x64` and `ARM64` packages in the Microsoft Store
  bundle, with single-instance window activation.

Gameplay and accessibility explanations reuse the game's localized Help in all
30 site languages. Recheck these against the game when its behavior changes.
The bestiary describes the current campaign, not unsupported biome promises.

## Preview locally

Run `python -m http.server 8080` from this directory, then visit
http://localhost:8080. No package installation or build step is needed.

## Publish on GitHub Pages

1. Push the site to the `website` branch of `bulentozkir/gemrift-site`
   (the workflow also supports `main`).
2. In the repository's **Settings > Pages**, select **GitHub Actions** as the source.
3. Run the **Deploy Gemrift to GitHub Pages** workflow, or push a new commit.
4. The public site will be at https://bulentozkir.github.io/gemrift-site/.

The workflow publishes only the HTML, CSS, JavaScript, `i18n`, SEO metadata
(`robots.txt`, `sitemap.xml`), and `assets` directory. Earlier external MP4
solution recordings were retired when Gemrift switched to bundled, offline
in-engine JSON resolution playback. The optimized gameplay clip and authentic
captures are included in `assets`.

## Search and sharing

The site publishes `robots.txt` and `sitemap.xml` from the repository root.
When the public Pages URL or set of published pages changes, update the sitemap,
robots sitemap URL, and canonical and social URLs in the HTML head. The home
page also includes Schema.org `VideoGame` data for search engines.

## Content and accessibility

- Character images are captured from the recorded explorer, not redrawn mascots
  or a claim that additional playable characters exist.
- The interactive Milo animation is labeled as an illustration, not gameplay.
- Download and trial links use the same official [Microsoft Store listing](https://apps.microsoft.com/detail/9p3qhcnq5sl3?hl=en-US&gl=US) in every language.
- The video dialog supports keyboard dismissal and native playback controls.
- The site is translated into the same 30 languages as the game. Strings live in
  `i18n/<code>.json` (keys from `i18n/en.json`), languages in `languages.json`, and
  pages use `data-i18n` attributes. Pick a language in the header or use `?lang=de`.
- Layouts adapt to mobile; animations respect reduced-motion preferences.
- The game-matched dark cave theme is the default; a light stone-and-copper
  theme is available in the header.
  For a fixed preview, append `?scoutTheme=light` or `?scoutTheme=dark`.
- All imagery and media are local; the site uses no analytics, trackers, external
  font services, or third-party runtime dependencies.