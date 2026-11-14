# Spiro Craft status

- Public release requested; preparing AlexBloom/spiro-craft on GitHub Pages.
- Web: Vite static build. Desktop: Electron for macOS Apple Silicon.
- Tests: 16 passing, covering geometry, layer operations, save validation, textures, composite exports, and LAN HTTP compatibility.
- Mobile layout checked at 320px and 390px. Physical phone gestures are not verified.
- Public typography: Inter with Helvetica/Arial/sans-serif fallbacks. Eurostile and SignPainter appear only as outlined wordmark/heading SVG artwork. No proprietary fonts are bundled.
- Production: deployment verification pending. CI runs on dev/main and PRs; Pages deploys manually from main.
- Desktop app remains unsigned; signing/notarization and Windows/Linux builds are not configured.
