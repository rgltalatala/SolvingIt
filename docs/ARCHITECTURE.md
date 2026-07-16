# Architecture

This document describes how the codebase is organized and how the main systems fit together. For product intent, see [PRODUCT.md](./PRODUCT.md). For frames, avoid-back, and undo details, see [lesson-session.md](./lesson-session.md).

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript, Vite, Tailwind CSS 4 |
| 3D | React Three Fiber, Three.js, `@react-three/drei` |
| State | Zustand |
| Routing | React Router 7 |
| Cube math | Custom `CubeState` + cubejs-backed move application |
| Tests | Vitest + Testing Library + jsdom |
| Deploy | Vercel |

Path alias: `@/*` → `src/*`.

## Folder structure

```
src/
  app/          # Shell: router, layouts, HomePage, global cubeStore, providers
  features/     # Product UI: lesson, scanner, notation, cases
  domains/      # Domain logic: cube, lesson-engine, scanner, notation prefs
  content/      # User-facing instructional copy only
  shared/       # Cross-feature UI, hooks, test helpers
  assets/       # Static assets
```

| Layer | Belongs here | Does not belong here |
| --- | --- | --- |
| **app** | Routing, layout chrome, global `cubeStore`, bootstrap | Lesson BFS, instructional copy |
| **features** | Pages, views, feature hooks, lesson UI session store | Core cube math / planners |
| **domains** | Cube model, lesson planners, studentHold, scanner detection, validators | Route pages / Tailwind layouts |
| **content** | Strings, step bodies, UI labels | Logic that mutates cube state |
| **shared** | Reusable demo/layout primitives used by multiple features | Feature-specific lesson views |

Lesson engines live under `src/domains/lesson-engine/layers/` and export through `index.ts` barrels. Feature hooks (e.g. `useWhiteCrossLessonStep`) bridge planners to UI.

## Routing

Defined in `src/app/router/router.tsx`, wrapped by `AppLayout`:

| Route | Component | Role |
| --- | --- | --- |
| `/` | `HomePage` | Pre-learning phase machine |
| `/learn` | `LearnIndexRedirect` | Redirect to current/default lesson |
| `/learn/:lessonId` | `LessonPage` | Bottom / middle layer lessons |
| `/learn/last-layer` | `LastLayerLessonPage` | Last-layer hub |
| `/learn/last-layer/:subLessonId` | `LastLayerLessonPage` | Last-layer sub-lesson |
| `/notation` | `NotationPage` | Notation reference |
| `/cases` | `CasesPage` | Cases / algorithms reference |
| `*` | → `/` | Fallback |

**Progress lives in Zustand, not the URL.** The URL selects which lesson view is mounted; `activeLesson` and session flags decide what step you see.

### HomePage phases

`HomePage` switches on `cubeStore.appPhase`:

| Phase | UI |
| --- | --- |
| `notation` | `NotationIntroPanel` |
| `scanning` / `correcting` | `ScanView` |
| `lessonResync` | `LessonResyncView` |
| `learning` | Navigate to `currentLessonPath()` |

Initial phase comes from `initialAppPhase()` in `src/domains/notation/notationPreferences.ts` (skip notation intro if previously completed).

## State management

### Global: `useCubeStore` (`src/app/store/cubeStore.ts`)

Owns the cube and app phase:

- `cubeState`, `scannedFaces`, validation fields
- `appPhase`, `activeLesson`, `scanReturnContext`
- `lessonHistory` — pre-apply snapshots for undo (LIFO)
- `studentHold`, `hasSeenAvoidBackCallout`
- Actions: `applyLessonStep`, `applyLessonDemoMoves`, `undoLessonStep`, `loadScrambledCubeIntoLesson`, rescan/resync helpers

The store keeps the cube in **storage frame** (scanner convention). Lesson apply goes through student-hold conversion (see below).

### Lesson UI session: `useLessonSessionStore`

Per-lesson UI state: strategy-intro flags, hold indices, solved-slot tracking, last-layer intros, in-lesson section (`learn` | `notation` | `cases`), session undo stacks for UI-only concerns.

### Preferences (localStorage)

| Key | Purpose |
| --- | --- |
| `solving-it.notation.introCompleted` | Skip notation intro next launch |
| `solving-it.lesson.avoidBackDefault` | Prefer avoid-back when demos include `B` |
| `solving-it.lesson.activeSession` | Persisted learning session (v2) |

### Session persistence

`src/features/lesson/store/lessonSessionPersistence.ts`:

- Saves only while `appPhase === 'learning'`
- Debounced (~300ms)
- Hydrated in `main.tsx` before React renders
- Cleared when leaving learning / starting a fresh session path

## Cube model

### `CubeState`

```ts
type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
type FaceState = [Color, Color, Color, Color, Color, Color, Color, Color, Color]; // 9 stickers
type CubeState = Record<Face, FaceState>;
```

Defined in `src/domains/cube/cubeState.ts`. Moves include face turns, slices, wide moves, and whole-cube rotations. Application uses cubejs-backed helpers plus `wholeCube.ts` for rotations.

### Two frames (important)

| Frame | Orientation | Used for |
| --- | --- | --- |
| **Storage** | White on U (scanner / WCA-like) | `cubeStore`, scan assembly, persistence |
| **Student / lesson** | Yellow on U, white on D | Planning demos, teaching hold, 3D lesson view |

Enter student frame with whole-cube `x2` (`cubeStateToStudentFrame`). Applying lesson moves: convert to student frame → apply → convert back (`applyMovesInStudentHold` / `applyLessonToStorage`).

Details and reset matrix: [lesson-session.md](./lesson-session.md).

### 3D

`src/domains/cube/3d/`:

- `CubeView` — R3F canvas wrapper
- Cubies / faces, move animation, lesson camera (snap to hold on whole-cube turns)
- Partial scans use `DisplayCubeState` with unknown stickers

## Lesson engine

### Layout

```
src/domains/lesson-engine/
  lessonCore/          # BFS, demo cache, verified demo finder, simulate helpers
  studentHold/         # Avoid-back expansion, apply-to-storage, instruction expand
  lessonPreferences.ts
  layers/
    bottomLayer/cross/
    bottomLayer/corners/
    middleLayer/edges/
    lastLayer/         # orientEdges, permuteEdges, permuteCorners, orientCorners
```

### `computeLessonStep` pattern

Each layer exposes a planner that roughly:

1. Checks completion / prerequisites
2. Emits strategy intro if not yet seen (UI session flags)
3. Plans the next piece or case (often via BFS / verified demos that preserve solved work)
4. Normalizes `demoMoves`

Sync and async variants exist: tests use sync; UI uses async (yields) for responsiveness. Feature hooks wrap planners: `useLessonStep` + layer-specific hooks under `src/features/lesson/hooks/`.

### Verified demos

Early stages prefer **search + verify** (`findVerifiedDemoWithTiers`) over blind algorithm playback so demos don’t undo already-solved pieces. Demo caches clear on lesson entry, scramble load, and session restart.

### Avoid-back (presentation, not a second planner)

Planners still emit internal `demoMoves` (may include `B`). The UI expands via `getLessonDemoExpansion`:

1. `y2` (Back becomes Front)
2. Translated face turns (no `B`)
3. `y2` (return to usual lesson hold)

Preview and Apply use the same expansion (`useLessonDemoPipeline`).

### Apply flow

1. Planner returns `demoMoves` in student frame
2. UI optionally expands for avoid-back
3. `MoveSequenceDemo` animates the preview
4. Apply → `applyLessonToStorage` → push history snapshot → update `cubeState` / `scannedFaces`

## Scanner

- **Domain:** `src/domains/scanner/` — camera helpers, HSV color detection, face layout
- **Feature:** `src/features/scanner/` — `ScanView`, grids, overlays, color picker, correction UI
- Flow: capture faces → assemble cube → validate (`cubeValidator`) → `lessonResync` → learning

Curriculum placement after scan/resync lives in lesson feature helpers (`lessonResync` / curriculum order in lesson loader modules).

## Key design decisions

1. **Two orientation frames** — Keep scan convention WCA-like; teach yellow-on-top without rewriting sticker math for every feature.
2. **Domain planners are mostly frame-pure** — UI owns session flags (intros, hold index, which section is open).
3. **Verified demos for preservation-sensitive stages** — Search that must not wreck solved pieces beats hard-coded algs alone.
4. **Copy isolated in `src/content/`** — Voice and punctuation rules stay out of engine code.
5. **Zustand for progress; URL for which view** — Deep links select a lesson surface; step state is not encoded in the path.
6. **Resync as a first-class phase** — Mid-solve re-scan can jump the curriculum forward.
7. **Avoid-back is a view/apply transform** — Same planner output, different presentation for beginners.

## Related docs

- [PRODUCT.md](./PRODUCT.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [lesson-session.md](./lesson-session.md)
