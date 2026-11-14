# Spiro Craft

Create a web app and desktop utility for exploring Spirograph geometry, from 6-, 12-, and 24-fold symmetry to freely adjustable gear ratios and sizes.

Implemented: local web app, macOS Electron app, symmetry and freeform modes, gear-ratio explanations, pen offset, size, stroke, colors, construction guides, tracing, zoom, randomization, local persistence, JSON save/load, and SVG/PNG exports.

Latest update: local master-collection typography inspired by the original Spirograph packaging, shadcn controls, shorter copy, every integer winding step, and line weights through 10 pt.

Public repository: https://github.com/AlexBloom/spiro-craft. Production is live and verified at https://alexbloom.design/spiro-craft/ on GitHub Pages. macOS signing/notarization and Windows/Linux builds remain optional.

Layers: up to 24 independent patterns with names, ordering, visibility, duplication, deletion/undo, rotation, and opacity. Existing controls edit the selected layer. Save/load and SVG/PNG exports support the full layer stack.
