# Gemrift

A responsive, dependency-free showcase for Gemrift, featuring original character
illustrations, real gameplay screenshots, and a locally hosted gameplay video.

## Preview locally

Run `python -m http.server 8080` from this directory, then visit
http://localhost:8080. No package installation or build step is needed.

## Publish on GitHub Pages

1. Push the site to the `main` branch of `bulentozkir/gemrift-site`.
2. In the repository's **Settings > Pages**, select **GitHub Actions** as the source.
3. Run the **Deploy Gemrift to GitHub Pages** workflow, or push a new commit.
4. The public site will be at https://bulentozkir.github.io/gemrift-site/.

The workflow publishes only the HTML, CSS, JavaScript, and `assets` directory.
Original recordings are excluded from Git and deployment; the optimized preview
and screenshots are included in `assets`.

## Content and accessibility

- Character artwork is an original illustration inspired by the recorded explorer,
  not a claim that additional playable characters exist.
- No download, store page, or release date is advertised until one is provided.
- The video dialog supports keyboard dismissal and native playback controls.
- Layouts adapt to mobile; animations respect reduced-motion preferences.
- Light and dark themes follow system settings and can be switched in the header.
  For a fixed preview, append `?scoutTheme=light` or `?scoutTheme=dark`.
- All imagery and media are local; the site uses no analytics, trackers, external
  font services, or third-party runtime dependencies.