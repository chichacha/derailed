# Typography Lab — DERAILED.

**Words are shapes before they are sentences.** An intentionally lightweight experiment in typography, composition and motion, with just enough design theory to make the play meaningful.

Open [index.html](index.html) directly in a browser. No bundler, dependencies, third-party font downloads, or web server needed.

## Try it

- Choose between six starting personalities: **Editorial, The Poster, Quiet Note, The Terminal, Playful, Opening Credits**.
- Change font family, size, weight, tracking (letter spacing), leading (line height), text measure, alignment, and colour mood.
- Try **Editorial**, **Poster**, and **Stack** composition layouts.
- Edit the headline and supporting copy, either in the controls or directly on the type canvas.
- Experiment with **Still, Breathe, Arrive/leave, Sway** motion. The page respects the operating system's reduced-motion preference.
- Cycle six tiny lessons about **hierarchy, spacing, line breaks, typeface personality, motion and whitespace**.
- Export a design study as editable JSON, an SVG poster, or copy the core CSS rules.

## How to play and learn

Start with a strong preset, then **change one variable at a time**. What becomes easier to read? Which version feels warmer, more urgent, calmer, or stranger? There is no single correct answer, but there *are* tradeoffs worth noticing.

Try this exercise:

1. Choose *The Poster*. Note how weight and tight leading feel.
2. Keep the words, switch to *Quiet Note*. What's different about the perceived voice?
3. Reduce the text measure until line breaks form a deliberate shape.
4. Turn on *Breathe*, then off. When is animation actually helping?
5. Save a type-study JSON for comparison.

## Technical notes

- **Static file:** `experiments/typography-lab/index.html`, with inline CSS and JavaScript.
- **Fonts:** installed system families only, so precise rendering depends on the viewer's operating system. Some CSS weights are synthesized.
- **SVG:** includes font names and text, not embedded font files; line wrapping is an approximation and can vary across machines. Complex layouts won't export pixel-perfectly.
- **JSON:** includes the headline, text, composition, typography and theme properties; import rejects unknown enums and limits numeric ranges.
- **Motion accessibility:** all type animations stop when `prefers-reduced-motion: reduce` is set.
- **Privacy:** no analytics, network calls or external services.

## Publishing

Root `_quarto.yml` already includes the `experiments/` directory as a project resource. After `quarto render`, check that `docs/experiments/typography-lab/index.html` exists and commit generated output if publishing via GitHub Pages from `docs/`.

This branch was created independently from `main` while Colour Lab is on another feature branch. If both branches edit `experiments/index.html`, update the second branch with the latest main before merging and preserve both gallery cards.
