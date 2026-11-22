# The Great Elk Identity Crisis 🦌

A standalone, scrolling DERAILED field note, inspired by a resting Roosevelt elk spotted on Vancouver Island.

Open `index.html` directly in a browser—no build step, no CDN, no dependencies. The main character is an **inline SVG illustration**, not the original photograph. It is intentionally easy to recolour and animate.

## Learn by tinkering (suggested order)

1. **CSS design tokens**: change `--paper`, `--ink`, `--rust` in `:root` and watch the whole story change.
2. **SVG + CSS animation**: find `.antlers` and `@keyframes sway`; alter rotation and timing. The resting elk has its own little blink animation.
3. **IntersectionObserver**: tweak `threshold: .12` to see how scroll-triggered reveal timing changes. Compare with scroll listeners.
4. **requestAnimationFrame**: inspect the progress bar's passive scroll listener and how it batches visual updates.
5. **Data-driven interaction**: edit the `names` JavaScript object; the CA / UK / JP controls render the same interface from three small data records.
6. **Photographic reveal with CSS clip-path**: the button changes `aria-expanded` and toggles the `.uncovered` class, sliding away an overlay to reveal a Wikimedia Commons photo of an elk information sign. Try changing the `clip-path` to create a vertical or diagonal curtain.
7. **Accessibility**: test tab/Enter controls, `aria-pressed`, text replacement, and your OS 'reduce motion' setting.

## Image files (put both beside index.html)

The layout now uses your painted image as the hero and the comparison illustration later in the story. You do not have to edit HTML to activate them:

```text
stories/elk-identity-crisis/
  index.html
  elk-painting.png             ← hero; intended primary image
  elk-deer-illustration.png    ← optional deer comparison
  README.md
```

Just download the images from ChatGPT, save with those exact filenames, and commit the PNGs to this feature branch. The images are **not yet present on GitHub**. Until then, the page shows intentional text-based placeholders rather than a broken image. A small `imageFallback()` helper handles missing assets.

The hero uses `object-fit: cover` with `object-position: 50% 47%`; adjust those to change the crop. The comparison uses `object-fit: contain` so the entire illustration remains visible. Check both on mobile once the images are added.

### What to learn from the redesign

- `<figure>` and `<figcaption>` for meaningful editorial imagery.
- `object-fit` / `object-position` for responsive cropping.
- CSS Grid for the split hero; one-column layout in the mobile media query.
- A subtle CSS entrance animation guarded by `prefers-reduced-motion`.
- Chapter 03 uses an externally hosted Wikimedia Commons image; the source is credited in its caption (Bob Wick / BLM Oregon & Washington, CC BY 2.0). The image is a photo **of a sign illustrating an elk**, not a photograph of a live elk. A local copy can replace its URL later.
- Image load error handling (a useful general pattern for local static sites).

## Editorial / factual guardrails

- 'Wapiti' comes from Shawnee and refers to the elk's pale rump.
- British 'elk' traditionally means moose; British 'moose' is also widely used. It isn't a neat one-for-one language replacement.
- Roosevelt elk were named by C. Hart Merriam in 1897, before Theodore Roosevelt's presidency.
- The Jasper vs Vancouver Island comparison is geographic context, not proof of an individual animal's subspecies.
- The comparison illustration is a visual interpretation, not a numerical size chart. Check the artwork before publishing for anatomical accuracy.

Sources are linked in the footer of the article.

## Publishing

`_quarto.yml` lists `stories/elk-identity-crisis/` under `project.resources`. Run `quarto render` from the repository root, then commit the new `docs/stories/elk-identity-crisis/` output to publish through the site's established Pages workflow. No homepage link has been added yet; review the story first.

Possible next experiments: sticky-scrollytelling scene, sprite-sheet anatomy changes, pinning the illustration during chapter transitions, or a small terminology game.
