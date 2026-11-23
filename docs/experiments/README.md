# DERAILED Experiments

A collection of small creative-coding laboratories. Each lab asks a question, builds a playable tool, and may or may not lead somewhere.

## Labs

- [Pentomino Pattern Lab](pentomino-lab/index.html) — mathematical tilings turned into geometric art. [Developer notes](pentomino-lab/README.md).
- [Colour Lab: Generate](colour-lab/index.html) — seed-colour harmony generator, editable swatches, light/dark previews and WCAG contrast checks. [Notes](colour-lab/README.md).
- [Colour Lab: Curate](colour-lab-curate/index.html) — a taste-led gallery of favourite palettes, including six unofficial SEY coffee-inspired sets, with saved personal copies and portable exports. [Notes](colour-lab-curate/README.md).

## Shared components

- [Colour System v1](shared/colour-system.js): five feature colours and light/dark neutrals, validated and exportable as CSS or JSON.

Keep tools independent and simple enough to run on static hosting. Shared engines go in `experiments/shared/`; individual lab UI and data stay in their own folders.
