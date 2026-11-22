# Colour Lab 🎨

**A palette is more than five swatches.** A standalone, no-build DERAILED experiment for generating, inspecting and exporting reusable colour systems.

Open `index.html` directly in a browser (`file://` is supported) or publish with Quarto. It loads just one existing shared module: `../shared/colour-system.js`.

## Try it

1. Pick a preset, then edit any of the **five feature colours** or **two neutral colours**.
2. Switch the **live page mockup** between light and dark to see the palette in context.
3. Check six sampled foreground/background pairs against **WCAG AA** contrast thresholds. Normal text is 4.5:1 or higher, large text is 3:1 or higher. This is guidance, not a comprehensive accessibility audit.
4. Generate new palettes from a seed colour using **analogous, complementary, triadic, monochromatic or split-complementary** hue recipes; keep your existing neutrals.
5. Copy CSS tokens, download a `.css` file, download a compatible `.json` palette, or import an existing colour-system JSON.

**No frameworks, build dependencies, external fonts, network requests, analytics or storage.** Nothing is uploaded to a server.

## Reusable seven-token contract

```json
{
  "version": 1,
  "name": "Roast",
  "features": ["#493329", "#8B5E48", "#C99872", "#D7C3AD", "#78918B"],
  "light": "#F8F2E9",
  "dark": "#292322"
}
```

The shared `DERAILEDColour` module validates this object and exports `--colour-1` through `--colour-5` and `--neutral-light`, `--neutral-dark` in CSS. This is the same schema used in Pentomino Pattern Lab. Palette edits are local and do not alter the shared presets.

## Publishing

The root `_quarto.yml` already lists `experiments/` as a project resource, so `quarto render` copies `colour-lab/index.html`, `style.css` and `app.js` into `docs/experiments/colour-lab/`. The experiments index links here, but no homepage entry is needed.

## Scope and limitations

- This is an exploratory HSV-based colour generator, **not** a formal colour-appearance model or a Material Design dynamic-colour system.
- Contrast checks use WCAG 2.x relative luminance ratios for the actual six displayed text pairs; they do not certify a whole interface.
- Colour generation affects the five feature tokens only. Neutrals are edited separately.
- The Remix button permutes the feature colours instead of randomizing them, so no colour is silently lost.
- CSS and JSON downloads are designed to be easy to reuse in small HTML pages, including Databricks markdown HTML sandboxes.
