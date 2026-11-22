# Pentomino Pattern Lab

**Beautifully constrained.** Twelve pentominoes cover a 6 × 10 board, and each piece becomes a canvas for modular geometric motifs.

This is a **dependency-free static experiment**. Open `index.html` directly in a browser (including from `file://`), or view it on DERAILED after rendering the Quarto site.

## Gomasu × DERAILED: Character DNA (v0.3)

This lab reads a **snapshot** of Gomasu Village's authored geometry and names from
[chichacha/psychic-pento-guacamole/data](https://github.com/chichacha/psychic-pento-guacamole/tree/main/data).
The source remains in Gomasu; a local bundle makes the DERAILED experiments work offline.

- `data/gomasu.js` — 63 mathematically distinct posture IDs, their five-cell coordinates, front/back metadata, and 12 official characters. Shape + normalized coordinates provide a reproducible crosswalk; all 192 placements across the 16 sample tilings resolve to one of these postures.
- `js/character-dna.js` — a **posture-aware** renderer: canonical cell identities are carried through rotations and reflections. One composition-level graphic family is shared across the artwork: **Circle cutout**, **Stripes**, **Clean split**, or **Colour blocks**.
- `js/portrait.js` — shared SVG portrait generator used by the Cast and Posture Studio.
- `cast-of-twelve.html` / `js/cast.js` — the 12 canonical Gomasu characters (X featured separately), next-posture buttons, a common graphic-language selector and SVG character-sheet export.
- `posture-studio.html` / `js/studio.js` — gallery of all 63 postures, with character, symmetry and front/back filters, preview and single-posture SVG export.

**Visual discipline:** Default mode is Character DNA with a single motif family and about 45% decorated pieces. The five feature colours plus two neutral tokens still apply; X is the intentional exception where each of its five squares displays a different feature colour. You can still choose **Manual motifs** to experiment, but those options are restricted to the selected graphic family.

### Why canonical cell identity matters

A decoration should follow its *character*, not the board axes. Given a solution placement, `GomasuPostures.resolve('F', cells)` identifies an authored ID such as `F04` and its front/back metadata. `matchingTransform()` associates each of the five new coordinates with a cell of the canonical posture so that the ornament rotates or reflects with the geometry.

The five-square arrangement is mathematically fixed; the decoration is a creative proposal. X has only one **geometric** orientation despite having a deliberately non-symmetric colour arrangement.

### Whole-piece treatments — not stickers on individual squares

The original motifs were too small and fragmented. The current `js/character-dna.js` draws a continuous geometric shape **first**, then the SVG renderer clips it to the full five-square pentomino:

- **Circle cutout** — one large accent-colour disc starts outside an exposed boundary and enters several connected squares. The edge choice is consistent with each Gomasu character's canonical posture, and rotates or reflects with that character.
- **Stripes** — repeat real filled bands across the complete shape, not just two decorative lines on one square. Choose horizontal, vertical, or diagonal. **Directions align to the finished artwork** by default, so horizontal remains horizontal even after a piece rotates. The underlying engine also supports `stripeFrame:'character'` to rotate stripe costumes with the piece if wanted later.
- **Clean split** — one vertical, horizontal, or diagonal two-tone division across the **whole piece**, measured in its canonical posture and transformed with it. No random half-square splits.
- **Colour blocks** — a single oversized rectangular accent, clipped by the pentomino silhouette.
- **X** — five unique feature colours, one per square. It intentionally does not follow the other motif rules.

The **Character DNA** editor uses one family across the complete board. The **Manual** editor uses the same whole-piece engine but lets individual pieces choose approved directions and opt out of decoration. Both support the seven-colour palette and SVG/PNG export.

The motif scale slider controls the band spacing and circular cutout size. For a calmer look, begin with 30–45% decorated pieces and neutrals as the secondary colour.

**To refresh the Gomasu snapshot:** update the three source JSON payloads embedded in `data/gomasu.js` from `postures.json`, `character_postures.json` and `characters.json`, check all 63 ID keys, and rerun posture/tiling mapping tests. Do not invent or renumber posture IDs.

### Compatibility

Saved design JSON continues using `derailed.pentomino/1`. New exports include `settings.designMode`, `settings.stripeDirection`, `settings.splitDirection`, and optional `pieces[shape].decorated` flags. Older designs remain importable, with old `all`/ `stripes` family settings mapped to the restrained styles. No bundler, external library or internet connection is required.

---

## What the editor does now

- 16 prevalidated 6 × 10 tilings using all 12 pentominoes exactly once
- A restrained, posture-aware Character DNA engine with genuinely continuous cutouts, stripes, splits and colour blocks
- Five feature colours plus a light and dark neutral; any piece uses a dominant feature colour and an optional second palette token
- Editable swatches, background, composition mood, motif family and direction, density, gap, rounding, scale and per-piece styles
- Exports artwork as SVG or PNG, the colour palette as JSON or CSS, and complete editable designs as JSON
- Imports saved design JSON **or** a standalone palette JSON

## Architecture and extension points

```text
experiments/
├── index.html
├── shared/
│   └── colour-system.js
└── pentomino-lab/
    ├── index.html                 # Main interactive editor
    ├── cast-of-twelve.html        # Canonical character portraits
    ├── posture-studio.html        # 63 orientations
    ├── styles.css
    ├── data/
    │   ├── tilings.js             # Valid 6×10 tilings
    │   └── gomasu.js              # Source posture snapshot
    ├── js/
    │   ├── character-dna.js       # Whole-piece SVG design grammar
    │   ├── portrait.js            # Shared portrait renderer
    │   ├── app.js                 # Main editor + exports
    │   ├── cast.js                # Character sheet
    │   ├── studio.js              # Posture gallery
    │   └── motifs.js              # Legacy registry (not loaded)
    └── tests/
        └── checks.html            # Browser-side validation
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

### Extend the graphic grammar

Edit `js/character-dna.js` to add another family. All treatments receive the *entire pentomino* in a canonical local coordinate system. Keep a motif simple enough to read at small sizes, and clip it at the piece boundary. The Cast of Twelve, Posture Studio, and the main editor all use this engine through `CharacterDNA.paint(shape, cells, options)`.

The `motifs.js` registry is retained for reference but no longer loaded by the editor; it contains the older cell-level experiments. New work belongs in Character DNA, not the old registry.

### Add a new tiling algorithm

The app reads `PentominoTilings.solutions`: an array of solutions, each with 12 entries shaped as `{name, cells:[integer, integer, integer, integer, integer]}`, where cells are positions 0–59 in row-major order. Current data decodes compact 60-character solutions and rejects missing, repeated or disconnected pieces. A future exact-cover solver can append its results without changing motifs or colours.

### Add another mini-lab

Use the shared colour module in a new folder, for example `experiments/colour-lab/index.html`. Start with the same palette JSON contract and add generated palettes, contrast diagnostics, harmony rules, CSS variables and export templates there. **Do not copy** the palette logic into every experiment.

## Validation

Open [tests/checks.html](tests/checks.html) directly in a browser. This no-build checker verifies:

- All **63** canonical Gomasu postures and their unique geometry
- Every one of the **192 placements** across the 16 sample tilings
- All **252 combinations** of 63 postures × four graphic families
- The shared seven-token colour system

The [Cast of Twelve interaction test](tests/cast-interaction.html) additionally clicks **all 11** posture buttons and checks that each one advances its own ID and artwork without replacing the gallery or losing keyboard focus. That protects against scroll anchoring problems on rows after the first.

## Publishing

The root `_quarto.yml` contains `experiments/` in `project.resources`, so **`quarto render`** copies the entire directory to `docs/experiments/` and retains the relative script paths. No `.qmd`, Node, build chain, external CSS, or CDN is necessary. The source HTML alone is not a published page until the rendered `docs/` output is committed and deployed.

Do not edit generated `docs/` files directly; edit source under `experiments/`, then render.

## Roadmap

1. **Colour Lab** — independent palette generator, contrast checker, CSS token themes and JSON interchange.
2. **Tiling Lab** — live exact-cover solver, additional board shapes and deterministic random seeds.
3. **Pattern Lab** — refine Character DNA, poster composition constraints, deterministic random seeds, reusable motif presets.
4. **Gallery** — export templates (posters, thumbnails, cover art, SVG backgrounds) shared with other DERAILED projects.
