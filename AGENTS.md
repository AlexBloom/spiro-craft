# Spiro Craft

HTML/CSS/ES modules with shadcn React control islands, Vite, and an Electron desktop wrapper. The user requested shadcn components; retain that stack. Shared geometry lives in geometry.mjs. Layer document operations and composite SVG rendering live in layers.mjs; the shadcn layer panel is layers-panel.jsx. The mobile tool dock and focused adjustments live in mobile-editor.jsx and share the desktop state/action handlers. The shared format/size/transparency and Save/Open controls live in export-panel.jsx. Save files use version 2 with a layers array; preserve migration from older flat designs. Desktop security settings must retain context isolation, sandboxing, and disabled Node integration.

- `npm run dev`: local web app on 127.0.0.1:5173.
- `npm test`: geometry and saved-design validation tests.
- `npm run build`: static dist directory.
- `npm start`: Electron desktop app.
- `npm run desktop:pack`: local macOS app in release/.

Run tests and build after source changes. Repackage after changes to app assets. Generated dist/, release/, and node_modules/ are ignored. The interface uses self-hosted Inter with its license in public/fonts/, plus Helvetica/Arial/sans-serif fallbacks. The wordmark and heading in public/brand/ are outlined SVG artwork created from Eurostile and SignPainter; never replace these with bundled proprietary fonts. The original private fonts are backed up under ignored .local/private-fonts/ and must never be committed or deployed without confirmed distribution rights. Production is GitHub Pages from main, deployed manually through .github/workflows/deploy.yml only on an explicit user request. Develop on dev and promote through a PR. Code signing and notarization are not configured.
