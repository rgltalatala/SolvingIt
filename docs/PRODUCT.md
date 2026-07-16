# Product

**solving-it** is a web app that teaches beginners to solve a **physical** 3×3 Rubik’s Cube. You scan your cube with the device camera (or load a practice scramble), then follow personalized step-by-step lessons with animated 3D demos matched to how you hold the cube: **yellow on top, white on bottom**.

**Live app:** [https://solving-it.vercel.app/](https://solving-it.vercel.app/)

## Vision

Help a complete beginner go from a scrambled physical cube to a full solve without memorizing a fixed script. The app plans each step from *your* current cube state, shows a demo you can mirror, and updates the virtual cube when you confirm you’ve done the moves.

It is not a speedcubing trainer. It is a patient, layer-by-layer coach for first solves.

## Educational philosophy

| Principle | What it means in the product |
| --- | --- |
| **Teach from your cube** | Steps are computed from the scanned (or practiced) state, not a one-size-fits-all move list. |
| **Strategy before algorithms** | Intros explain *why* and *what you’re aiming for*. Exact turns live in the demo and step UI, not buried in prose. |
| **Student hold** | While learning, you hold **yellow on U, white on D**. The scan/storage model uses a different convention (white on U); the app converts between frames. |
| **Avoid-back** | Optional mode expands demos that include Back-face turns into front-facing turns with `y2` reorients, so beginners don’t have to turn the cube’s back. |
| **Physical cube first** | The virtual cube updates on **Apply**, after you’ve done the moves on the real cube. Re-scan when things drift. |
| **Coach voice** | Instructional copy sounds like a patient cuber: why → what → how, skimmable, restrained encouragement. See `.cursor/rules/app-copy-voice.mdc`. |

## User flow

1. **Notation (optional)** — Intro to pieces, faces, turns, and rotations. Can be skipped on later visits.
2. **Scan** — Capture all six faces with the camera. Confirm or fix colors if detection misses something.
3. **Validate & correct** — Impossible sticker counts and other issues are flagged before learning continues.
4. **Resync into the curriculum** — The app places you on the right lesson (and first step) for how far the cube has progressed.
5. **Learn** — Watch the demo, do the moves on your physical cube, then **Apply on my cube & continue**. Use undo, re-scan, or jump between lessons, notation, and cases from the nav.
6. **Practice** — From a lesson, load a random scramble to practice without re-scanning.

Mid-lesson **re-scan / resync** is first-class: if the physical cube has moved ahead (or drifted), scanning again can jump you to the correct stage.

## Lesson path

Beginner layer-by-layer:

1. **White cross**
2. **White corners**
3. **Middle-layer edges**
4. **Last layer**
   - Orient edges (yellow cross)
   - Permute edges
   - Permute corners
   - Orient corners

## Major features

| Feature | Description |
| --- | --- |
| **Camera scan** | Capture stickers face-by-face; HSV color detection fills a 3×3 grid per face. |
| **Validation & manual fix** | Catch bad scans; correct stickers before learning. |
| **Personalized lessons** | Planners compute the next intro, piece, or case step from cube state, with animated demos. |
| **Apply / undo** | Apply advances the virtual cube; undo restores the pre-apply snapshot. |
| **Avoid-back mode** | Prefer front-facing turns when demos would use `B`. Preference can default on for new B-containing examples. |
| **Notation & anatomy** | Standalone intro and in-lesson reference for vocabulary and turns. |
| **Cases reference** | Browse algorithms and preview them on the cube. |
| **Practice scramble** | Skip scanning; load a scramble and open the white-cross lesson. |
| **Session persistence** | Active learning sessions resume across reloads (localStorage). |

## Stack (product-facing)

React, TypeScript, Vite, Tailwind CSS, React Three Fiber / Three.js, Zustand, React Router. Deployed on Vercel.

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — code layout, routing, state, lesson engine, cube model
- [CONTRIBUTING.md](./CONTRIBUTING.md) — conventions and AI/agent guidelines
- [lesson-session.md](./lesson-session.md) — storage vs student frame, avoid-back, undo, reset behavior
- [../README.md](../README.md) — run locally and high-level overview
