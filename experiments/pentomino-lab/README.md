# Pentomino Pattern Lab

**Beautifully constrained.** Twelve pentominoes cover a 6 × 10 board, and each piece becomes a canvas for modular geometric motifs.

This is a **dependency-free static experiment**. Open `index.html` directly in a browser (including from `file://`), or view it on DERAILED after rendering the Quarto site.

## What the editor does now

- 16 prevalidated 6 × 10 tilings using all 12 pentominoes exactly once
- 14 registered motifs: solids, two-tone splits, circles, arches, stripes, dots, checker blocks and sunrise
- Five feature colours plus a light and dark neutral; any piece uses a dominant feature colour and an optional second palette token
- Editable swatches, background, composition mood, motif family, density, gap, rounding, scale and per-piece styles
- Exports artwork as SVG or PNG, the colour palette as JSON or CSS, and complete editable designs as JSON
- Imports saved design JSON **or** a standalone palette JSON

## Architecture and extension points

```text
experiments/
├── index.html                    # A future landing page for multiple mini-labs
├── shared/
│   └── colour-system.js          # Independent design-token engine, version 1
└── pentomino-lab/
    ├── index.html                 # Semantic UI; script tags only
    ├── styles.css                 # Responsive editor styling
    ├── data/tilings.js            # Tiling source and validation
    └── js/
        ├── motifs.js              # Extensible motif registry
        └── app.js                 # Interaction, SVG rendering and exports
```

The boundary matters: **the colour system never imports pentomino logic.** A future Colour Lab can use `../shared/colour-system.js` without loading any shapes. The pentomino renderer, in turn, knows nothing about the details of the preset palettes.

### Add a palette

In `../shared/colour-system.js`, add an entry to `presets`:

```js
myPalette: {
  name: 'My palette',
  features: ['#112233', '#446688', '#DDAA66', '#F4AABB', '#88CCCC'],
  light: '#F9F7F0',
  dark: '#22222B'
}
```

All consumers can call `DERAILEDColour.load('myPalette')`, `DERAILEDColour.css(palette)`, `DERAILEDColour.colours(palette)` and `DERAILEDColour.validate(palette)`. Exported palette JSON has a versioned, stable seven-token shape.

### Add a geometric motif

Before `js/app.js` loads, register a motif:

```js
PentominoMotifs.register('my-motif', 'My motif', 'curves', ({x, y, w, h, accent}) =>
  `<circle cx="${x+w/2}" cy="${y+h/2}" r="30" fill="${accent}"/>`
);
```

The motif registry automatically populates the shape inspector. Add a corresponding family option in the UI if you're introducing a new family. The renderer clips the generated SVG to the pentomino's occupied cells.

### Add a new tiling algorithm

The app reads `PentominoTilings.solutions`: an array of solutions, each with 12 entries shaped as `{name, cells:[integer, integer, integer, integer, integer]}`, where cells are positions 0–59 in row-major order. Current data decodes compact 60-character solutions and rejects missing, repeated or disconnected pieces. A future exact-cover solver can append its results without changing motifs or colours.

### Add another mini-lab

Use the shared colour module in a new folder, for example `experiments/colour-lab/index.html`. Start with the same palette JSON contract and add generated palettes, contrast diagnostics, harmony rules, CSS variables and export templates there. **Do not copy** the palette logic into every experiment.

## Publishing

The root `_quarto.yml` contains `experiments/` in `project.resources`, so **`quarto render`** copies the entire directory to `docs/experiments/` and retains the relative script paths. No `.qmd`, Node, build chain, external CSS, or CDN is necessary. The source HTML alone is not a published page until the rendered `docs/` output is committed and deployed.

Do not edit generated `docs/` files directly; edit source under `experiments/`, then render.

## Roadmap

1. **Colour Lab** — independent palette generator, contrast checker, CSS token themes and JSON interchange.
2. **Tiling Lab** — live exact-cover solver, additional board shapes and deterministic random seeds.
3. **Pattern Lab** — motif editor, pattern weights, compositional constraints, saved motif presets and Gomasu-inspired details.
4. **Gallery** — export templates (posters, thumbnails, cover art, SVG backgrounds) shared with other DERAILED projects.
