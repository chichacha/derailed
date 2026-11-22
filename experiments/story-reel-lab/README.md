# Story Reel Lab — The Great Elk Identity Crisis

A tiny **15-second, 9:16 vertical trailer** built entirely in HTML Canvas 2D and vanilla JavaScript. It's a moving companion to `stories/elk-identity-crisis/index.html`, not a replacement for the long-form story.

## How to run

Open `experiments/story-reel-lab/index.html` in the browser (or with a local server / Quarto preview). The reel reads the existing painted illustration from `../../stories/elk-identity-crisis/elk-painting.png`, so no images are duplicated.

Controls: **Play / Pause**, **Restart**, **Loop**, **timeline scrub**, and **Export WebM**. It exports a silent `720 × 1280` WebM by recording the animated canvas. Export needs browser support for `canvas.captureStream` and `MediaRecorder` (Chrome or Firefox is a good starting point). Keep the tab visible during the 15-second real-time capture. If your browser doesn't support WebM export, use a screen recorder or browser recording software.

This is not an MP4 and does not include audio. A later FFmpeg or Remotion workflow can convert/edit for platforms that prefer MP4.

## What to learn

1. **Timeline as a pure function:** `render(t)` draws the animation at a given second. A slider and a recording engine can share the exact same scenes.
2. **Easing:** `ease()`, `smooth()`, and `opacity()` coordinate how text and scenes enter or exit. Try a bouncy easing function.
3. **Canvas typography:** `text()`, `serif()`, and `lines()` draw editorial lettering. Try larger type and more negative space.
4. **Ken Burns crop:** `imageCover()` clips a growing crop out of the original painting.
5. **Capturing to video:** `canvas.captureStream(30)` + `MediaRecorder` creates a recording.
6. **Accessibility:** Play/Pause controls, slider, live status, and reduced-motion-aware styling. Note: the actual moving reel is intentionally a motion experiment; there is no alternative still video export yet.

## Timeline

| Seconds | Story beat |
|---|---|
| 0.0–3.2 | A giant elk takes a nap |
| 3.2–6.2 | ELK? MOOSE? WAPITI? |
| 6.2–9.4 | The naming problem in Canada, Britain, Japan |
| 9.4–12.2 | Wapiti and the white rump |
| 12.2–15.0 | Title card and visit-the-story prompt |

The pale rump illustration is an **abstract animated shape**, not the Wikimedia Commons photograph used by the long-form webpage; that avoids cross-origin canvas export restrictions and license/credit issues for this initial reel.

## Technical caveats

- Canvas text depends on installed fonts; the page uses system sans-serif and Georgia.
- Timing reflects animation playback; WebM encoding can be less smooth if the browser struggles to draw 720p frames in real time.
- The recording is silent and uses browser-dependent WebM codecs.
- The reel intentionally uses the painted hero only; the original user photograph is not included.
- The page is under `experiments/`, which is already included in Quarto `project.resources`. Run `quarto render`, then commit the generated `docs/experiments/story-reel-lab/` output to publish.
- The experiments index links to the source page; Quarto copies the index into `docs/` when rendered.

## Creative exercises

- Swap scene 2 and scene 3. Does the punchline work better?
- Change scene 4 from gold to forest green. Does the white rump still pop?
- Try 8 seconds instead of 15. Where can you remove words?
- Create a 16:9 adaptation by changing `WIDTH`, `HEIGHT` and re-positioning scene elements.

DERAILED. — One thing led to another.
