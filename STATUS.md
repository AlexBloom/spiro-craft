# Spiro Craft status

- Public repository: https://github.com/AlexBloom/spiro-craft
- Web: Vite static build. Desktop: Electron for macOS Apple Silicon.
- Tests: 21 passing, covering geometry, layer operations, save validation, textures, composite exports, and LAN HTTP compatibility.
- Mobile layout checked at 320px and 390px. Physical phone gestures are not verified.
- Public typography: Inter with Helvetica/Arial/sans-serif fallbacks. Eurostile and SignPainter appear only as outlined wordmark/heading SVG artwork. No proprietary fonts are bundled.
- Production live: https://alexbloom.design/spiro-craft/ (HTTPS enforced). Deployment 43646903532 succeeded; live HTML, JavaScript, CSS, and branding return HTTP 200, and the rendered drawing was visually verified. CI runs on dev/main and PRs; Pages deploys manually from main.
- Desktop app remains unsigned; signing/notarization and Windows/Linux builds are not configured.

Header update: tagline removed, workspace spacing reduced, icon matched to the wordmark color, and Surprise me moved before Save design in the header. Sixteen tests pass; static and desktop builds pass; 320px layout fits. Production deployment 43652061356 succeeded and live HTML/browser verification passed.

Animation fix prepared on dev: replace the SVG dash reveal with distance-based open path prefixes and trace all visible, nonzero-opacity layers sequentially. Stop, completion, and setting/layer edits restore full paths. Exports remain complete during playback. Twenty-one tests pass. PR #7 was approved, merged, and deployed in run 43670187756. Production verification at 390px confirmed a single open stroke with no dash styling during playback, restoration of the exact full path at completion, and no browser errors.

Mobile editing update prepared on dev: canvas-first six-tool dock with one adjustment slider at a time, separate fixed/rolling gear controls, shared layer controls, paper tooth, and export options. Done, the active tool, a canvas tap, or Escape dismisses the panel. Checked at 320 × 568 and 390 × 844 with working geometry updates, paper controls, layer operations, and PNG export. Desktop controls retain their existing layout. Not deployed to production.

Line weight update prepared on dev: desktop/mobile sliders cap at 5 pt; older saved strokes up to 10 pt load at 5 pt. Surprise me retains lighter strokes and caps heavier strokes at 2.9 pt in both geometry modes.

Removed the layer-name text field beneath the layer list from the shared desktop/mobile panel. Renaming now happens inline by clicking or tapping the layer name. Enter or blur saves; Escape cancels. Existing saved layer names are preserved.
