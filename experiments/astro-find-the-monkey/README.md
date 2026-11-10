# Find the Monkey / Astro Lab 🐒

A **standalone Astro prototype** of one DERAILED story. It is intentionally **not** a replacement for the existing bilingual Quarto version at stories/find-the-monkey/index.qmd.

## Open locally with GitKraken + VS Code

1. In GitKraken, **Fetch** chichacha/derailed and check out branch feature/astro-find-the-monkey-lab.
2. Choose **Open Folder…** in VS Code and select experiments/astro-find-the-monkey (the folder containing package.json).
3. In VS Code, open Terminal → New Terminal.
4. Verify Node.js and npm are installed and permitted on your machine:

   node --version
   npm --version

   Astro 7 requires Node.js 22.23.4+ on a supported even-numbered version.
5. Install dependencies **inside this folder** and start the dev server:

   npm install
   npm run dev

6. Open the localhost address that Astro prints, usually http://localhost:4321/.
7. Edit src/pages/index.astro or src/styles/global.css and save. The browser refreshes as you work.
8. When finished, Ctrl+C stops the server.

No Quarto, R, RStudio, or Positron are needed to preview this experiment.

## Learn the architecture

| File | Responsibility |
| --- | --- |
| src/pages/index.astro | Story structure and the page route (/). |
| src/layouts/StoryLayout.astro | HTML head, shared layout and global styles. |
| src/components/MonkeyStage.astro | Reusable SVG illustration and sticky visual stage. |
| src/components/ChoiceLab.astro | Interactive multiple-choice exercise, with browser JS. |
| src/components/TinyExperiment.astro | Small hypothesis / test / evidence form, with browser JS. |
| src/data/choices.js | Choice text and feedback, separate from markup. |
| src/data/examples.js | Editable exercise examples. |
| src/scripts/story.js | Scroll progress and section-aware captions. |
| src/styles/global.css | Responsive design, animation, reduced-motion support. |

The Astro frontmatter (between --- fences) runs during building. JavaScript inside component script tags runs in the browser. The site is static: there is no R session or backend.

## Build for publishing

Run:

   npm run build
   npm run preview

The generated static site lives in dist/ and can be deployed independently to static hosting or a compatible Posit Connect version. The package deliberately does not update DERAILED's Quarto /docs publication or GitHub Pages deployment. Once the experiment is approved, choose a deployment path and configure Astro's base/site settings if the host uses a URL subpath.

## Intentional scope

- A short, **English-only** retelling with new SVG art and two exercises, not a one-for-one rewrite of the existing story.
- Original Quarto story, assets, Japanese translation, homepage, and publishing workflows remain untouched.
- No React/Svelte framework, backend, analytics tracking, or external image dependencies.
- Fonts request Google Fonts; system fonts are used automatically when offline.

## Next exercises

1. Change one example in src/data/examples.js and observe the rendered select menu.
2. Extract a repeated chapter into a reusable Astro component.
3. Add a Japanese translation layer *after* you understand the static structure.
4. Compare local authoring in Astro versus Quarto, then decide whether and how to publish.
