# Colour Lab: Curate

**A design grammar, not a prison.** Colour Lab: Generate explores systematic hue harmony; **Curate** gives taste the deciding vote.

This is a static HTML/CSS/JavaScript companion to [Colour Lab: Generate](../colour-lab/index.html). Open `index.html` directly via `file://`, no localhost server or build tooling needed.

## Included collections

- **SEY-inspired** — six unofficial artist-curated approximations from an earlier DERAILED exploration: *Morning Pour, Washed & Floral, Origin Greens, Blue Hour, Late Harvest, The Full Archive*. These are NOT official SEY Coffee brand palette values, and not sampled measurements of the archived packaging. [Inspiration](https://www.seycoffee.com/collections/archived-coffees).
- **DERAILED picks** — five suggested palettes: *Coffee After Rain, Botanical Archive, Midnight Gelato, Coastal Field Notes, Print Studio*.
- **Cinematic palettes / Wes Anderson-inspired** — *Grand Hotel, Coastal Summer, Storybook Train*; stylized nostalgic cinema colours, not sampled film stills.
- **Design systems / Classic Material-inspired** — *Primary Playground, Paper Sunrise, Muted Material*; reinterpretations of familiar, saturated material-style hues, not an official Material palette library.
- **Print & posters / Vintage Travel Posters** — *Railway to the Coast, Desert Motel, Alpine Express*; old-paper, screenprint and sun-faded colour combinations.
- **Design systems / Editorial Data** — *Quiet Signal, Bold Evidence, Field Journal*; contrast-conscious sketches for infographics and diagrams, not certified accessible colour sets.

**23 palettes** across six named collections, grouped into themed families in the collection dropdown. Choose a collection, or search across collection names, family names, and tags.

The canonical checked-in snapshot is `data/palettes.json`, including the collection-family taxonomy. An equivalent `data/palettes.js` is committed for classic-script, offline loading. When intentionally changing the seed set, update both files together.

## What you can do

1. Browse or search presets by name, collection, notes and tags.
2. Star any palette to save it as a favourite.
3. Select a reference palette and click **Make my version**. Seed references are intentionally read-only; your personal copy is editable.
4. Edit seven swatches, notes, name and tags, or create a palette from scratch.
5. Preview the palette in a small editorial layout.
6. Export a single palette as seven-token JSON or CSS; both import seamlessly into the first Colour Lab or Pentomino Lab.
7. Export **My collection** (custom palettes plus favourite IDs) as a portable collection JSON. Import it again later or on another computer.

Custom palettes and stars are saved to **localStorage in this browser**, not to GitHub or an external service. Browser data can be cleared; use the collection export as a backup. Importing collections adds new custom copies and preserves favourite flags. There is no network access or cloud account requirement.

## Reusable colour contract

`DERAILEDColour.validate()` provides the same shared seven semantic tokens in every experiment:

```json
{
  "name": "Morning Pour",
  "features": ["#FFE469", "#FFD12D", "#F6A029", "#F47E59", "#FFF9EC"],
  "light": "#FFFCF1",
  "dark": "#433022"
}
```

The five features are an **artistic selection**, not necessarily mathematically balanced or contrast-safe. Use the original [Generate](../colour-lab/index.html) page for contrast checks and harmony experiments.

## Quarto publication

`_quarto.yml` already includes `experiments/` as project resources. Running `quarto render` will copy `experiments/colour-lab-curate/` into `docs/experiments/colour-lab-curate/`. Commit the resulting `docs/` files before merging your PR, if GitHub Pages is deployed from `docs/`.
