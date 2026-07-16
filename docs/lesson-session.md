# White cross lesson — session & avoid-back

## Frames

- **Storage cube** — matches the scanned scramble in the app’s default orientation (white on U in the scanner frame).
- **Student / lesson frame** — yellow on U, white on D; what you hold while learning. Entered via whole-cube `x2` when applying lesson moves to storage.

## Avoid-back (B-free examples)

When a step’s internal `demoMoves` include `B`, the UI can expand the preview/apply sequence to:

1. `y2` (reorient so Back becomes Front)
2. Translated face turns (no `B`)
3. `y2` again (return to the usual lesson hold, e.g. blue on F)

Preview and **Apply** use the same expansion (`getLessonDemoExpansion`).

## Go back

### Demo preview (before Apply)

- **Previous move** in the move sequence demo plays a **reverse animation** for the last applied move, then decrements the preview index. Whole-cube turns snap the camera to lesson hold before animating (same as forward).
- Does not change `cubeStore`; only the in-memory demo copy.
- When the planner cannot produce a demo (stuck step), the move preview clears so an older example is not shown.

### Lesson undo (after Apply)

- Each **Apply example** pushes a **pre-apply snapshot** (`cubeState` + `scannedFaces`) onto `lessonHistory` in the store.
- **Undo last example** pops that snapshot and restores the cube; the lesson step is recomputed from the restored cube (BFS).
- History is **session-only**: cleared when entering or leaving the lesson, on practice scramble load, or when the cube is replaced via `setCubeState`.
- Entering the lesson also clears the in-memory BFS demo cache (`clearVerifiedDemoCache`).
- Undo depth: full stack until lesson entry (one undo per Apply, LIFO).

### Physical cube

The lesson updates the **virtual** cube on Apply only. Before applying, confirm your physical cube matches the diagram (same scramble and hold). Copy in the lesson header and Apply panel reminds you of this; there is no rescan step.

## What resets when

| Action                       | Cube state | Lesson step         | `studentHold` in store | `lessonHistory`         | Avoid-back callout |
| ---------------------------- | ---------- | ------------------- | ---------------------- | ----------------------- | ------------------ |
| Apply example                | Updated    | Next step           | Cleared (`none`)       | Push pre-apply snapshot | Unchanged          |
| Undo last example            | Restored   | Recomputed          | Cleared (`none`)       | Pop one snapshot        | Unchanged          |
| Reset lesson tips            | Unchanged  | Recomputed          | Cleared                | Unchanged               | Cleared            |
| Start lesson (from overview) | Unchanged  | Fresh entry         | Cleared                | Cleared                 | Cleared            |
| Leave lesson / re-enter      | Unchanged  | Continues from cube | Not auto-cleared       | Cleared                 | Persists           |
| Manual `setCubeState`        | Replaced   | N/A                 | Unchanged              | Cleared                 | Unchanged          |

`studentHold` in the store is only an input for expansion during apply; after each apply, orientation lives on the cube stickers.

## Preferences

- **`solving-it.lesson.avoidBackDefault`** (`localStorage`) — when `"true"`, new B-containing examples open with avoid-back already on.

## Phase 5 UI

- **Move sequence demo** — animates layer turns and whole-cube rotations forward and in reverse (Previous); whole-cube turns snap the camera to lesson hold before animating.
- **Instruction panel** — prose from `expandDemoToInstructions`, synced with the active move index.
