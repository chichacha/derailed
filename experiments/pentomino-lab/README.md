# Pentomino Pattern Lab

**Beautifully constrained.** Twelve pentominoes cover a 6 × 10 board, and each piece becomes a canvas for modular geometric motifs.

This is a **dependency-free static experiment**. Open `index.html` directly in a browser (including from `file://`), or view it on DERAILED after rendering the Quarto site.

## Gomasu × DERAILED: Character DNA (v0.2)

This lab reads a **snapshot** of Gomasu Village's authored geometry and names from
[chichacha/psychic-pento-guacamole/data](https://github.com/chichacha/psychic-pento-guacamole/tree/main/data).
The source remains in Gomasu; a local bundle makes the DERAILED experiments work offline.

- `data/gomasu.js` — 63 mathematically distinct posture IDs, their five-cell coordinates, front/back metadata, and 12 official characters. Shape + normalized coordinates provide a reproducible crosswalk; all 192 placements across the 16 sample tilings resolve to one of these postures.
- `js/character-dna.js` — a **posture-aware** renderer: canonical cell identities are carried through rotations and reflections. One composition-level graphic family is shared across the artwork: **Linear**, **Curved**, **Split**, or **Blocky**.
- `js/portrait.js` — shared SVG portrait generator used by the Cast and Posture Studio.
- `cast-of-twelve.html` / `js/cast.js` — the 12 canonical Gomasu characters (X featured separately), next-posture buttons, a common graphic-language selector and SVG character-sheet export.
- `posture-studio.html` / `js/studio.js` — gallery of all 63 postures, with character, symmetry and front/back filters, preview and single-posture SVG export.

**Visual discipline:** Default mode is Character DNA with a single motif family and about 45% decorated pieces. The five feature colours plus two neutral tokens still apply; X is the intentional exception where each of its five squares displays a different feature colour. You can still choose **Manual motifs** to experiment, but those options are restricted to the selected graphic family.

### Why canonical cell identity matters

A decoration should follow its *character*, not the board axes. Given a solution placement, `GomasuPostures.resolve('F', cells)` identifies an authored ID such as `F04` and its front/back metadata. `matchingTransform()` associates each of the five new coordinates with a cell of the canonical posture so that the ornament rotates or reflects with the geometry.

The five-square arrangement is mathematically fixed; the decoration is a creative proposal. X has only one **geometric** orientation despite having a deliberately non-symmetric colour arrangement.

**To refresh the Gomasu snapshot:** update the three source JSON payloads embedded in `data/gomasu.js` from `postures.json`, `character_postures.json` and `characters.json`, check all 63 ID keys, and rerun posture/tiling mapping tests. Do not invent or renumber posture IDs.

### Compatibility

Saved design JSON continues using `derailed.pentomino/1`. New exports include `settings.designMode` and optional `pieces[shape].decorated` flags. Older designs remain importable, with old `all`/ `stripes` family settings mapped to the restrained styles. No bundler, external library or internet connection is required.

---

## What the editor does now

- 16 prevalidated 6 × 10 tilings using all 12 pentominoes exactly once
- A restrained, posture-aware Character DNA engine, plus 14 legacy motifs grouped into compatible families
- Five feature colours plus a light and dark neutral; any piece uses a dominant feature colour and an optional second palette token
- Editable swatches, background, composition mood, disciplined motif family, density, gap, rounding, scale and per-piece styles
- Exports artwork as SVG or PNG, the colour palette as JSON or CSS, and complete editable designs as JSON
- Imports saved design JSON **or** a standalone palette JSON

## Architecture and extension points

```text
experiments/
├── index.html                    # A future landing page for multiple mini-labs
├── shared/
│   └── colour-system.js          # Independent design-token engine, version 1
└── pentomino-lab/
    ├── index.html                 # Main interactive editor\n    ├── cast-of-twelve.html       # Canonical character portraits\n    ├── posture-studio.html       # All 63 orientations
    ├── styles.css                 # Responsive editor styling
    ├── data/tilings.js            # Tiling source and validation\n    ├── data/gomasu.js             # Official posture source snapshot
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
3. **Pattern Lab** — refine Character DNA, poster composition constraints, deterministic random seeds, reusable motif presets.
4. **Gallery** — export templates (posters, thumbnails, cover art, SVG backgrounds) shared with other DERAILED projects.
