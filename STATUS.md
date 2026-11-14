# Spiro Craft status

- Public repository: https://github.com/AlexBloom/spiro-craft
- Web: Vite static build. Desktop: Electron for macOS Apple Silicon.
- Tests: 16 passing, covering geometry, layer operations, save validation, textures, composite exports, and LAN HTTP compatibility.
- Mobile layout checked at 320px and 390px. Physical phone gestures are not verified.
- Public typography: Inter with Helvetica/Arial/sans-serif fallbacks. Eurostile and SignPainter appear only as outlined wordmark/heading SVG artwork. No proprietary fonts are bundled.
- Production live: https://alexbloom.design/spiro-craft/ (HTTPS enforced). Deployment 43646903532 succeeded; live HTML, JavaScript, CSS, and branding return HTTP 200, and the rendered drawing was visually verified. CI runs on dev/main and PRs; Pages deploys manually from main.
- Desktop app remains unsigned; signing/notarization and Windows/Linux builds are not configured.

Header update: tagline removed, workspace spacing reduced, icon matched to the wordmark color, and Surprise me moved before Save design in the header. Sixteen tests pass; static and desktop builds pass; 320px layout fits. Production deployment 43652061356 succeeded and live HTML/browser verification passed.
