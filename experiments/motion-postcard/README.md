# Motion Postcard — DERAILED. 🎬

A small creative-coding experiment: twelve shapes assemble, pause, and scatter in a **vertical 9:16 animation**. Built as a single self-contained `index.html` with plain Canvas 2D, CSS and JavaScript.

## Run it
Open `experiments/motion-postcard/index.html` in your browser. No dependencies, internet, server or build tooling. The default canvas is **540 × 960**.

## Play
- Choose a colour story: Sorbet, Bold & Bright, Midnight Gallery, or Coffee Morning
- Choose the entrance: Spiral, Rise from Below, or Orbit
- Adjust the loop duration from 6–20 seconds
- Edit the title on the postcard
- Pause, play, or restart

## Export
- **PNG still:** exports a composed frame of the postcard as a local image.
- **Record one loop:** where the browser supports `canvas.captureStream()` and `MediaRecorder`, captures one full loop and downloads **silent WebM** video. The tool checks supported codecs before enabling the button.
- **No automatic MP4:** convert the WebM afterward if needed (e.g. FFmpeg: `ffmpeg -i derailed-motion-postcard.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart postcard.mp4`).

Browser video recording happens in real time. Background tabs, slow devices, browser codecs and variable frame delivery can affect resulting frame pacing. Screen recording is a fallback. Test the exported video before posting.

The design deliberately loops: the first and last arrangement both have an empty center grid. The browser may render a tiny encoding discontinuity at the seam.

## What this teaches
- **Timing:** enter → settle → hold → exit
- **Easing:** movement doesn't need to be linear
- **Stagger:** small offsets give a group personality
- **Composition:** motion is another way to control attention
- **Reusable outputs:** one HTML experiment can become a still poster and a vertical video

## Publishing
The root Quarto project already includes `experiments/` as a resource. Running `quarto render` should copy the experiment into `docs/experiments/motion-postcard/` for GitHub Pages publishing. Commit generated files if publishing from `docs/`.

This branch is independent of the Colour Lab and Typography Lab branches. All three currently edit `experiments/index.html`: after merging one, sync the remaining branches from `main` and preserve each lab card when resolving conflicts.
