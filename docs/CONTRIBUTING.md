# Contributing

Conventions for humans and AI agents working in this repo. For product and architecture context, read [PRODUCT.md](./PRODUCT.md) and [ARCHITECTURE.md](./ARCHITECTURE.md) first.

## Setup

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest (single run)
npm run lint
npm run format
npm run build
```

Requires **Node.js 20+**.

## Where code goes

| Put it in… | When… |
| --- | --- |
| `src/domains/` | Reusable cube / lesson / scanner logic with little or no React chrome |
| `src/features/` | Pages, views, feature hooks, feature-local stores that wire domains + content |
| `src/content/` | **All** user-facing instructional copy and UI label strings for lessons/notation |
| `src/app/` | Router, layouts, global `cubeStore`, providers |
| `src/shared/` | Primitives used by more than one feature |

Do not put lesson BFS or sticker math in React pages. Do not put long instructional prose in components; import from `src/content/`.

## Naming

| Kind | Convention | Examples |
| --- | --- | --- |
| Lesson IDs | kebab-case string constants | `white-cross`, `middle-layer-edges` |
| Modules | camelCase files | `computeLessonStep.ts`, `cubeState.ts` |
| Components | PascalCase | `LessonPage.tsx`, `CubeView.tsx` |
| Hooks | `use*` | `useLessonStep`, `useScannerFlow` |
| Stores | `use*Store` | `useCubeStore`, `useLessonSessionStore` |
| Tests | Colocated `*.test.ts` / `*.test.tsx` | `cornerLesson.test.ts` |
| localStorage | `solving-it.<area>.<name>` | `solving-it.lesson.avoidBackDefault` |

Prefer `@/` imports (`@/domains/...`, `@/features/...`, `@/content/...`) over deep relative paths.

## TypeScript / React

- Strict TypeScript; prefer type-only imports where required by `verbatimModuleSyntax`.
- Discriminated unions for lesson steps (`kind: 'intro' | 'complete' | …`).
- Layer engines often export **sync + async** planners: sync for tests, async for UI responsiveness.
- Prefer declarative components. Extract multi-branch conditionals (see Cursor rule below).
- Do not add `useMemo` / `useCallback` by default; follow existing patterns in the file. `startTransition` is used where lesson transitions are heavy.
- Zustand: select narrow slices; avoid subscribing whole stores in hot UI paths.

## Cursor rules (must follow when editing matching files)

| Rule | Path | Applies to |
| --- | --- | --- |
| **Conditional clarity** | `.cursor/rules/conditional-clarity.mdc` | `src/app`, `src/features`, `src/shared` |
| **App copy voice** | `.cursor/rules/app-copy-voice.mdc` | `src/content/**` |

### Conditional clarity (summary)

Allowed inline: simple ternaries, `condition && <Node />`. Extract nested ternaries or multi-branch business logic into named helpers, hooks, or lookup maps.

### App copy voice (summary)

Write like a patient cuber coach: why → what → how; contractions; skimmable. Teach intent in prose; **do not prescribe specific turns in step body copy** (demo owns moves). **No em dashes** for asides. Keep vocabulary consistent (face, layer, edge, corner, center, algorithm, turn, rotate, solve, scramble).

## Preferred patterns

### Lessons

1. Planner in `domains/lesson-engine/layers/.../computeLessonStep.ts`
2. Feature hook under `features/lesson/hooks/...` wrapping `useLessonStep` + async getter
3. View component maps renderer keys → UI (`LessonPage` / layer views)
4. Demo + avoid-back through `useLessonDemoPipeline`, not ad-hoc expansion in the view

### Cube frames

- Persist and store in **storage** frame (white U).
- Plan and teach in **student** frame (yellow U / white D) via `x2`.
- See [lesson-session.md](./lesson-session.md) before changing apply, undo, or avoid-back.

### Content

- New user-visible lesson/notation strings → `src/content/`
- Anticipate common mistakes; reassure when setup temporarily disturbs other layers without listing every move

## Testing

- **Vitest** + jsdom; setup in `src/shared/test/`
- Colocate tests next to the module under test
- Domain/lesson logic should have unit coverage; preservation-sensitive planners often have scramble / integration-style tests (`*.randomScramble.test.ts`)
- Run `npm test` before claiming a lesson-engine change is done

When fixing a bug in planners or apply/undo, add or extend a test that would have caught it.

## Design decisions to preserve

1. Do not collapse storage and student frames without a migration plan.
2. Do not move instructional copy into engine files.
3. Prefer verified/search demos when a step must preserve already-solved pieces.
4. Avoid-back should expand planner output for preview/apply; it should not fork a second planner API unless necessary.
5. URL selects the lesson surface; step progress stays in stores (+ persistence while learning).

## AI / agent guidelines

When working in a **new workspace** or cold context:

1. Read `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and (for lesson apply/undo) `docs/lesson-session.md`.
2. Match existing folder boundaries: domains vs features vs content.
3. Follow the Cursor rules above for UI conditionals and copy.
4. Keep diffs focused; do not drive-by refactor unrelated files.
5. Do not commit unless the user asks.
6. Do not invent product behavior that contradicts PRODUCT.md (e.g. teaching white-on-top, skipping physical-cube apply, hard-coding a full solve script instead of state-based steps).
7. For lesson-engine changes, prefer tests over manual-only verification.
8. User-facing strings: coach voice, no em dashes, strategy without move lists in prose.

## Related docs

- [PRODUCT.md](./PRODUCT.md) — vision, flow, features
- [ARCHITECTURE.md](./ARCHITECTURE.md) — structure and systems
- [lesson-session.md](./lesson-session.md) — frames, avoid-back, undo, resets
- [../README.md](../README.md) — clone and run
