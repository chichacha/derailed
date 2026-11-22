# Pentomino GLB Studio

**From flat to form.** A no-build Three.js experiment in DERAILED's `experiments/` collection.

## Try it

Run a local static web server from the DERAILED repository root:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/experiments/pentomino-glb-lab/index.html`.

Three.js and its export addons are loaded from jsDelivr; an internet connection is required for a first load. The shape, tiling and colour data come from the existing local DERAILED modules. The experiment is not a Quarto article and needs no build step.

## Studio interface

The editor has five tabs in the right-hand panel: **01 Shape**, **02 Colour**, **03 Piece**, **04 Save**, and **05 Print**. The tabs keep the viewport visible instead of extending the panel down the page. Use arrow keys, Home and End when a tab has keyboard focus.

Clicking a mesh in the 3D viewer, or choosing a shape in the colour key, opens **03 Piece** with that pentomino selected. Rotation and Reset Camera remain accessible under every tab.

### Surface-graphic coordinates

Graphics use *equal X and Y scale*, anchored to each piece's bounding-box centre on a fixed six-square canvas. This avoids stretching dots into ovals or changing stripe proportions on long pieces such as I or Y. Only the broad front/back caps receive this graphic UV mapping; the bevels and walls keep their solid material colour. This is a UV fix, not a change to printable geometry.

## True cube mode and future 3D packing

In **01 Shape → Piece geometry**, choose one of two modes:

- **Soft slab (default):** retained design-object mode with variable extrusion depth, rounded contours, bevels, and optional piece gaps.
- **True cubes (1 × 1 × 1):** the five joined unit squares become five full unit cubes. The piece is extruded to exactly one unit in Z, with zero bevel, zero rounding, and zero internal gap. These constraints override (but do not erase) the slab sliders; the slab controls reappear when switching back.

All twelve pieces therefore contain **60 unit cubes**, making **5 × 6 × 2** and **4 × 5 × 3** valid *target volumes* for future three-dimensional packing. The current Together arrangement is still the original **6 × 10 × 1** tiling, while Exploded is a layered visual display. **No 3D packing solver is implemented yet**, so the controls do not currently arrange the pieces into a 5 × 6 × 2 or 4 × 5 × 3 box.

STL export uses the same exact cube-mode geometry and the configured millimetres-per-cube edge length. Since a tiled board would touch and potentially fuse neighbouring pieces in a slicer, the **full-set cube STL** instead arranges whole, unchanged solids as **12 separate 4 × 3 print islands** with gaps. The layout may exceed a smaller printer bed; export one piece at a time for print tests. The selected-piece STL begins at the origin.

## Original Gomasu character edition

In **02 Colour → Colour collection**, select **Gomasu Originals · 12 characters** for the twelve authentic character colours. They come directly from the included Gomasu source snapshot (`../pentomino-lab/data/gomasu.js`), whose `characters` dataset mirrors [the original Gomasu character data](https://github.com/chichacha/psychic-pento-guacamole/blob/main/data/characters.json).

Each piece receives the exact colour of its character (e.g. X `#F0B6DF`, I `#FDCFAB`). The earlier five-feature/two-neutral DERAILED palettes remain available and unchanged. This special edition is **not constrained to five colours**. The finish selector still controls matte, satin, etc. Per-piece colour editing switches between seven standard tokens and twelve Gomasu characters based on the selected collection; corresponding overrides are kept separate in design JSON.

## Play

- **Together:** valid 6 × 10 pentomino tiling with independently adjustable spacing.
- **Exploded:** every shape's geometric centre aligns to x = 0, y = 0; their z positions form an adjustable vertical stack.
- **Shape:** depth and rounded corners with a gently bevelled 3D edge.
- **Colour:** the original DERAILED 5-feature + 2-neutral palette presets, plus twelve original Gomasu character colours.
- **Finishes:** matte + subtle satin pairs (default), matte + gloss, all matte, ceramic, or satin metal.
- **Graphics:** optional continuous stripes, dots, grids, arcs, splits, blocks, and four *original-lab-inspired* motif families. These are new procedural graphics inspired by the lab, **not** exact reproductions of Gomasu's posture-aware Character DNA.
- **Editor:** click a shape in the viewport, choose a letter, or click the material key to assign that piece a different palette token, finish, or motif. Use Restore curated pairings to reset individual overrides.
- **Design JSON:** save and reopen palette, tiling, geometry, materials, patterns, size, and per-piece overrides. Schema: `derailed.pentomino-glb/1`.

### Curated 12-piece identities

| Piece(s) | Palette colour | Default finishes | Rationale |
| --- | --- | --- | --- |
| I | Foreground / dark neutral | Matte | Straight, graphic anchor |
| X | Background / light neutral | Matte | Central, quiet anchor |
| F / Z | Feature 1 | Matte / satin | Fluid, zigzagging |
| L / Y | Feature 2 | Matte / satin | Long stems |
| P / U | Feature 3 | Matte / satin | Compact forms |
| N / W | Feature 4 | Matte / satin | Stepped forms |
| T / V | Feature 5 | Matte / satin | Bold angles |

Satin is intentionally understated (roughness **0.57**, metalness **0.06**), rather than bright chrome. The neutral pieces remain matte by default. All pairings are editable.

## Export formats

| Format | Purpose | Preserves |
| --- | --- | --- |
| `.glb` | Share the 3D design, open in Blender, web viewers | 12 objects, geometry, palette colours, PBR material properties, graphic textures |
| `.json` | Reopen the editable design in this lab | Tiling, palette, per-piece overrides, pattern and scale controls |
| `.stl` | Geometry for slicers and print shops | Shapes, bevels, size, flat layout; **no colour, texture or surface finish** |

### Print prototype workflow

1. Choose a valid tiling, gap, softness, and extrusion depth. Choose **Unit square edge** (10–35 mm; default 20 mm).
2. Click **Full set STL** to export all 12 independent solids laid flat in a single STL file. This layout is used even if the visual preview is currently the vertical Z-stack.
3. Alternatively click **Selected piece STL** to export a single piece for your first print and tolerance checks.
4. Open the STL in a slicer or send it to a fabrication shop. **STL does not record units**: exported coordinates are numerically in millimetres, so select **mm** on import.
5. Check geometry/manifoldness in the slicer, bed area, scale, minimum thickness and edge tolerances before printing. At the default 20 mm square edge, the board footprint is approximately **200 × 120 mm**, with approximately **7.4 mm** overall thickness (including the bevel). Real tolerances and printer behavior depend on the printer and material.

The `.glb` shows decorative graphics and visual material finishes. The `.stl` is deliberately geometry-only: **patterns are not embossed or engraved**, satin sheen is not printed, and paint/multi-colour printing would be a separate manufacturing step. A future `3MF` workflow might capture some colour/material assignments, but this prototype does **not** export 3MF.

## Implementation

- Scene: Three.js / OrbitControls.
- Model: outline traced from the 5 connected squares of each piece, rounded in 2D and extruded with bevel segments.
- Renderer: per-piece `MeshStandardMaterial`; optional `CanvasTexture` on broad faces and a plain-colour sidewall.
- GLB: `GLTFExporter`.
- STL: `STLExporter`, rebuilding print geometry flat at explicit millimetre coordinates.
- Original data: `../pentomino-lab/data/tilings.js` and `../shared/colour-system.js`.
- No generated `.glb` or `.stl` binary is committed; the browser creates downloads on demand.

## Publishing

`_quarto.yml` already lists `experiments/` under `project.resources`. To publish to the `docs/` GitHub Pages output, run `quarto render` after merging or on your branch, then commit the generated `docs/` output. Don't edit generated files directly.
