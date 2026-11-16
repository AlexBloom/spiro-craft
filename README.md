# Spiro Craft

[Open the live app](https://alexbloom.design/spiro-craft/) · [GitHub repository](https://github.com/AlexBloom/spiro-craft)

A local geometry playground for the web and macOS. Explore Spirograph curves, understand gear ratios, and export artwork.

## Use it

- **Web:** `npm run dev`, then visit http://127.0.0.1:5173.
- **Desktop:** open `release/Spiro Craft-darwin-arm64/Spiro Craft.app` on an Apple Silicon Mac. Or run `npm start` after `npm install`.
- **Static website:** `npm run build` generates `dist/`, which can be served by any static web host. No backend or account is required.

Symmetry mode offers 6, 12, and 24 repeating lobes. Winding includes every integer from 1 to one less than the base ratio. Shared factors reduce the ratio and can simplify the actual symmetry; the pattern panel reports that result. Freeform mode allows independent fixed and rolling gear sizes, rolling inside or outside the fixed gear, and pen offsets up to 220% of the rolling radius.

The ratio panel reduces R:r by its greatest common divisor, explains rotational symmetry, and shows the revolutions needed to close the path. “Sides” here means repeating lobes rather than straight polygon edges. With the pen centered, the geometry simplifies to a circle.

The default pen palette is red, green, blue, and black, with a custom-color picker. Optional paper tooth textures the ink strokes with Hot press (Smooth), Cold press (Medium), and Rough (Coarse) finishes with adjustable strength. Paper settings persist in saved designs.

Change the drawing size, ink color, and line weight (0.3–5 pt); display construction guides; zoom the preview; or trace the drawing from one moving endpoint. Playback draws visible layers in order, following the distance along each curve. Stopping restores the complete drawing; exports always use complete geometry. The last design is restored locally when you reopen the app. **Save design** downloads an editable JSON file; **Open design** restores it.

The workspace fills the window, with the logo and Surprise me at the top left and Save design beside Export. Select SVG, PNG, or JPG in the compact export panel. SVG is resolution independent; PNG and JPG offer 1200, 2400, and 4800 pixels square. Transparency appears only for PNG and is checked by default. SVG and JPG use the drawing-area background color. Paper tooth affects only the ink strokes in both preview and exports. No paper-grain background is generated; transparent PNG exports retain textured ink on transparency. Exports contain the artwork, without canvas dots or construction guides. Zoom only changes the preview; drawing size controls the exported composition.

## Layers

Use **+ Add** in the Layers panel to stack a new pattern. Click a layer to edit its geometry, ink, line weight, size, rotation, opacity, and paper tooth with the main controls. New layers start slightly smaller and use the next kit ink. The top row is the topmost layer.

Click or tap a layer name to rename it in place. Enter or tapping away saves; Escape cancels. Duplicate the selected layer, move it up or down, hide it with the circle button, or delete it. **Undo delete** restores the most recently deleted layer. A design supports up to 24 layers and always keeps at least one. **Reset** resets only the selected layer; **Surprise me** changes only that layer and caps its line weight at 2.9 pt. Older saved designs with heavier strokes open at the current 5 pt maximum.

SVG, PNG, and JPG exports combine all visible layers in stack order, with each layer’s texture and transformations. Export is disabled when every layer is hidden. Save/Open design preserves the entire stack and selected layer. Older single-pattern JSON files open as one-layer designs.

## Phone preview

Run `npm run dev -- --host 0.0.0.0` and open the printed Network URL on a phone connected to the same Wi-Fi. Layer IDs support plain HTTP network addresses as well as localhost. On narrow screens the canvas fills the workspace above a six-tool dock: Geometry, Ink, Transform, Paper, Layers, and Export. Tap a tool, then choose an adjustment; only one slider appears at a time. Fixed gear and Rolling gear have separate adjustments in Freeform mode. Tap Done, the canvas, or the active tool to dismiss the panel. Geometry also includes construction guides and a compact ratio readout. Touch targets are enlarged, and text fields avoid iOS focus zoom.

## Development

Requires Node.js 22 or newer. The web app uses Vite and shadcn/Radix React control islands. Desktop uses Electron with sandboxing, context isolation, and Node integration disabled.

```
npm install
npm test
npm run build
npm run dev
```

To build the macOS desktop bundle on a Mac:

```
npm run desktop:pack
```

The generated app is a local unsigned build; distribution signing and notarization are not configured. The same Electron source can be packaged for Windows or Linux on an appropriate build machine.

## Geometry

For inside rolling:

`x(t) = (R − r) cos(t) + d cos((R − r)t/r)`

`y(t) = (R − r) sin(t) − d sin((R − r)t/r)`

For outside rolling, the base radius is `R + r`, with the pen term adding in both coordinates. The path closes after `r / gcd(R, r)` revolutions. Samples increase with the frequency of the curve, capped at 60,000. The drawing is normalized to its radial bound, preserving the selected export size across different ratios.

All design data stays in the browser or desktop utility. The interface uses self-hosted Inter with Helvetica, Arial, and sans-serif fallbacks. Its license is included in public/fonts/. The Eurostile wordmark and Eurostile/SignPainter heading are fixed outlined SVG artwork with no embedded font files. Private master-collection fonts are excluded from Git and public builds. Geometry and exports work offline in the desktop app.

## Publishing

Develop on `dev`, verify CI, and promote through a pull request to `main`. Run the **Deploy to GitHub Pages** workflow manually from `main` to release. The workflow tests and builds the site with `/spiro-craft/` as the asset base path. GitHub Pages uses the account’s existing `alexbloom.design` domain; no additional DNS changes are needed.
