# solving-it

solving-it is a web app that teaches beginners to solve a physical 3×3 Rubik’s Cube. Scan your cube with the device camera (or load a practice scramble), then follow personalized step-by-step lessons with animated 3D demos matched to how you hold the cube (yellow on top, white on bottom).

**Live app:** [https://solving-it.vercel.app/](https://solving-it.vercel.app/)

## What it covers

A full beginner layer-by-layer path:

1. **White cross**
2. **White corners**
3. **Middle-layer edges**
4. **Last layer** — orient edges, permute edges, permute corners, orient corners

Each step is planned from *your* current cube state. Lessons include strategy intros, progress tracking, undo, re-scan/resync, and an optional avoid-back mode that turns Back-face moves into front-facing turns.

Also included:

- **Notation & anatomy** intro (pieces, faces, turns, rotations)
- **Cases** reference — browse algorithms and preview them on the cube
- **Scan validation & manual fix** — catch bad scans and correct stickers before learning

## Using the app

1. **Notation** — Optional intro to cube vocabulary (you can skip it next time).
2. **Scan** — Capture all six faces. Confirm or fix colors if the detector misses something. Validation will flag impossible sticker counts before you continue.
3. **Learn** — Watch the demo, do the moves on your physical cube, then **Apply on my cube & continue**. Use undo, re-scan, or jump between lessons, notation, and cases from the nav.
4. **Practice** — From a lesson, you can load a random scramble to practice without re-scanning.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- npm (included with Node.js)
- A webcam if you want to use the face-scanning flow

## Run locally

```bash
git clone <repository-url>
cd solving-it
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Other commands

```bash
npm run build    # production build
npm run preview  # preview the production build
npm test         # run the test suite
npm run lint     # run ESLint
```

## Stack

React, TypeScript, Vite, Tailwind CSS, React Three Fiber / Three.js, Zustand, React Router. Deployed on Vercel.
