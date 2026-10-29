# DERAILED.

**One thing led to another.**

An independent collection of curious detours, visual investigations, photographs, interactive stories, and questions that got a little out of hand.

Sometimes it's geography. Sometimes marine life. Sometimes photography, mathematics, or a completely unnecessary investigation into something surprisingly interesting.

There is no fixed destination.

## What lives here?

- **Stories** — Interactive explainers, visual essays, and occasional deep dives.
- **Observations** — Photography, curious creatures, and things worth looking at twice.
- **Experiments** — Maps, data visualizations, creative coding, and ideas that might lead somewhere.
- **Notes** — Research, discoveries, and the occasional tangent.

Built with curiosity, open data, Quarto, R, JavaScript, CSS, and whatever else seems useful along the way.

## A small origin story

When creating this repository, GitHub suggested the name `potential-octo-couscous`.

It was almost too good to refuse.

Nobody knows what potential-octo-couscous is yet. That seems like a perfectly reasonable subject for a future investigation.

## Editorial philosophy

*A question doesn't need to be important to be worth exploring.*

---

**DERAILED.** — One thing led to another.

## Preview the website

The repository is a Quarto website with a home page at `index.qmd` and
self-contained interactive articles under `stories/`.

From the repository root:

```bash
quarto preview
```

Render the whole website before publishing:

```bash
quarto render
```

The site is written to `_site/`, which is ignored by Git. Quarto
automatically finds new `.qmd` articles, so future story pages do not
need to be registered in `_quarto.yml`.

**Publishing is separate from building.** Once ready, the site can be
published to GitHub Pages using `quarto publish gh-pages`; the public
site has not been enabled merely by adding the website files.

The clock story reads its generated snapshot from
`stories/vancouver-seattle/data/clock_story.json`. The R/GeoNames
data preparation is a separate step and is not required for a normal
Quarto website render.
