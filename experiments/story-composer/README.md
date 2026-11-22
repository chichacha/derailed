# Story Composer — DERAILED Experiments

A little **local-first, multi-image Instagram carousel composer**. Choose photos from your computer, put them in an intentional order, write a headline and a meaningful observation on each, then export PNG slides or a ZIP.

No framework, CDN, build tooling, network calls, remote upload, storage, cookies, or backend.

## Start here

Open `experiments/story-composer/index.html` directly in a modern desktop browser, or serve it through Quarto.

1. Explore the three **sample text-only scenes** (these contain no actual photos).
2. Choose multiple photos with **Add photos** (or drop files into the photo area). Your first upload replaces the demo; future uploads append new scenes. Up to 20 scenes.
3. Click a scene in the left rail. Use **Earlier** / **Later** to reorder. Add a text-only slide or remove one you don't need.
4. Give every scene a **narrative role** (Encounter, Detail, Discovery, Surprise, Reflection, Other), a small label, a headline, and a caption. Optional writing prompts suggest what to observe.
5. Choose one of three layouts:
   - **Full-bleed:** photograph with a gradient and overlaid words.
   - **Editorial split:** photograph above a clear paper-like caption area.
   - **Typography poster:** large editorial type, supporting image band and caption.
6. Choose colours (Moss, Clay, Ink, Blue) and adjust each image's horizontal/vertical focal point.
7. Export a **single 1080 × 1350 PNG**, or **All slides as ZIP**. The ZIP contains numbered PNGs and `captions.txt`, with the full captions for your post.
8. Optionally download the captions separately as plain text.

This first version intentionally focuses on static Instagram carousels (4:5), not animated 9:16 Reels. Motion/video remains a separate experiment in `experiments/story-reel-lab/`.

## Privacy and publishing

Images are read from the local file picker or a local drag/drop using `URL.createObjectURL` and browser `Image` objects. Files are held only in the tab's memory. Nothing is uploaded, and the code has no remote scripts or network calls. There is no autosave; refreshing or closing the tab loses the working story and selected images.

The **tool itself** may be published as static HTML via GitHub Pages, without publishing the photos used while editing. Only files you intentionally add to Git and push become part of the repository.

Privacy depends on keeping the source local-first: if you introduce a remote library, cloud asset storage, or network calls later, revisit this claim.

## Technical notes

- Single standalone `index.html` uses Canvas 2D for both preview and PNG export; no screenshotting library is needed.
- A small built-in **ZIP writer** packages PNG blobs uncompressed (PNG is already compressed); it requires no third-party dependency.
- Captions longer than the design can comfortably fit may be shortened with an ellipsis *on the slide*. The complete caption is preserved in `captions.txt`.
- Browser image support varies; HEIC/HEIF or certain RAW camera formats might not decode. JPEG or PNG are reliable defaults.
- 20-scene limit protects browser performance. Large source images may require substantial memory.
- Export happens in the browser. Very restrictive browser download policies can block automatic downloads; try current Chrome or Firefox.
- No persistent editable project file, save/reopen, audio, animation, MP4, custom typography upload, scene drag-to-reorder, or photo editing in v0.1.
- This feature has had JavaScript syntax checks but not a full cross-browser visual/functional QA pass yet.

## Development

The page is under `experiments/`, already included in Quarto resources in `_quarto.yml`.

```sh
quarto render
```

Commit `docs/experiments/story-composer/` after rendering if using the repository's checked-in `docs/` output. That publishes the editor files, **not** your local photos.

## Ideas for v0.2

- Save/reopen an editable story file (including optional embedded images, with a size warning).
- Drag-and-drop scene reordering, thumbnails rendered from each scene design.
- Better typographic controls, contrast presets, text-safe areas and presets.
- Export animated scene sequences as WebM, then convert locally to MP4.
- Optional 9:16 Story export, 1:1 square carousel, and higher-level storyboard modes.

**Design question:** How can a visual tool help the author notice and say something meaningful, rather than merely decorate photographs?

DERAILED. — One thing led to another.
