# Gemrift

A responsive, dependency-free showcase for Gemrift, featuring authentic in-game
character captures, real gameplay screenshots, and a locally hosted gameplay video.
Current gameplay leads the page: gold crystals, cracked slate boulders, X-braced
steel walls, embossed controls, and large, boxed HUD statistics. The page uses
the game's navy cave floor, slate steel, copper earth, and gold crystal palette.

## Current game experience

- The 18-second Hasty Allotment Plaza trailer is current Windows gameplay,
  with sound. Screenshots and the mini-map/HUD close-up are authentic game captures.
- Junior is the default of five timing-only difficulty levels. Difficulty does
  not change cave layouts or enemy populations.
- The clock is relaxed by default: zero removes the remaining-time bonus, not
  the attempt. Strict clock is optional.
- Hold V to scout with play and the clock paused. The full-cave mini map can be
  hidden with Ctrl+X and restored with Ctrl+Z.
- Settings offers high contrast, reduced motion, sound captions, volume, and
  remappable controls. Attempts are unlimited; the death banner names the retry key.
- Solution previews for caves 1–5 are free. Nine failures unlock that cave's
  recording for everyone; a full Microsoft Store license and two failures on
  the same cave unlock recordings across the campaign. Recordings download on
  demand and are not yet available for every cave.

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

The workflow publishes only the HTML, CSS, JavaScript, and `assets` directory.
The public `website` branch excludes the original recordings and their large
history. The local `main` branch retains the existing recording commit untouched.
The optimized preview and screenshots are included in `assets`.

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