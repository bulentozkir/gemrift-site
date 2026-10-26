# Gemrift

A responsive, dependency-free showcase for Gemrift, featuring authentic in-game
character captures, real gameplay screenshots, and a locally hosted gameplay video.
The default dark cave theme uses the game's slate-blue stone, turquoise gems,
and earth-toned footage rather than unrelated promotional artwork.

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
- No download, store page, or release date is advertised until one is provided.
- The video dialog supports keyboard dismissal and native playback controls.
- The site is translated into the same 30 languages as the game. Strings live in
  `i18n/<code>.json` (keys from `i18n/en.json`), languages in `languages.json`, and
  pages use `data-i18n` attributes. Pick a language in the header or use `?lang=de`.
- Layouts adapt to mobile; animations respect reduced-motion preferences.
- The cave-dark theme is the default; a lighter mineral theme is available in the header.
  For a fixed preview, append `?scoutTheme=light` or `?scoutTheme=dark`.
- All imagery and media are local; the site uses no analytics, trackers, external
  font services, or third-party runtime dependencies.