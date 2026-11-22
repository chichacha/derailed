# DERAILED Motion Playground — local-first reel maker

A reusable, standalone HTML/CSS/JavaScript workbench for making **vertical motion-typography reels** from your own photographs. No images need to be committed to GitHub. No server, uploads, accounts, framework, CDN or build step.

## Try it

Open `experiments/story-reel-lab/index.html` in Chrome or Firefox (or serve using Quarto/local preview).

1. Choose an image from your computer with **Choose a local photo**. JPG/PNG is a good starting point. A built-in abstract placeholder is available if you don't want to use a photo.
2. Edit the opening headline, second beat, and signature.
3. Change font style, motion style, theme, crop focus, zoom, and duration.
4. Preview with **Play / Pause**, **Restart**, or the timestamp scrubber.
5. Click **Export WebM**. The browser records a silent 9:16 video (720 × 1280) at up to 30 fps in real time. Keep the page visible during recording.
6. Convert the WebM to MP4 using local FFmpeg or your own converter when ready for Instagram.

Example conversion (run from a terminal with FFmpeg installed):

```bash
ffmpeg -i derailed-motion-playground.webm -c:v libx264 -pix_fmt yuv420p -r 30 -crf 20 -movflags +faststart derailed-motion-playground.mp4
```

For exact 1080 × 1920 social export, add `-vf scale=1080:1920` before the output filename. This upscales the original 720 × 1280 canvas; future versions may render natively at a higher resolution.

## Privacy model

The image is loaded with `<input type="file">` and a temporary browser `URL.createObjectURL(file)`. There are **no upload requests**, local storage, image persistence, remote scripts, or third-party SDKs. Selecting an image does **not** add it to the Git repository or GitHub Pages. Browser refresh clears the selected image.

**Note:** Local privacy is a property of the app as currently written. Anyone editing the code could change its behaviour. Review before using modified versions or sensitive images. External online conversion services are outside this tool's privacy boundary; use local FFmpeg if you want private conversion.

## Learning exercises

- **Canvas design:** `render(t)` draws any frame at a chosen timestamp, so preview and export share one timeline.
- **CSS tokens and palettes:** Edit the `themes` dictionary; compare how ink and warm neutrals support type.
- **Easing:** Modify `ease()`, `smooth()`, `alphaWindow()` to change anticipation and pacing.
- **Kinetic typography:** Compare `rise`, `slide`, `scale`, and `fade` modes in `typeBlock()`.
- **Photography:** Explore `drawImage()` crop, focal position and the Ken Burns zoom.
- **Browser recording:** Inspect `canvas.captureStream(30)` + `MediaRecorder`.

## Current limitations

- No audio, video input, image layering, keyframe editor, font upload, saved projects or MP4 export inside the app.
- WebM export is browser-dependent, silent and real-time. Safari/iPhone support varies; desktop Chrome/Firefox are safer starting points.
- Canvas uses 720 × 1280 resolution and system fonts. Extra-long captions may be clipped; use concise headlines.
- No visual browser QA has been performed in this GitHub commit. Check preview and exported WebM before publishing or sharing.

## Publishing

The source lives in `experiments/story-reel-lab/`; `experiments/` is already in Quarto `project.resources`. Running `quarto render` copies the tool into `docs/experiments/story-reel-lab/`. Only the tool's source code is published—not photos chosen while using it.

One thing led to another.
