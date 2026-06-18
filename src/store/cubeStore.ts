import { create } from 'zustand';
import {
  applyMove as applyCubeMove,
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
} from '../cube/cubeState';
import type { CubeState, Face, FaceState, Move } from '../cube/cubeState';
import type { CubeValidationIssue } from '../cube/cubeValidator';
import {
  applyLessonToStorage,
  noneHold,
  type StudentHold,
} from '../learn/studentHold';
import { clearAllLessonDemoCaches } from '../learn/lessonCore';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import { WHITE_CORNERS_LESSON_ID } from '../learn/layers/bottomLayer/corners';

export type ActiveLessonId =
  | 'white-cross'
  | typeof WHITE_CORNERS_LESSON_ID
  | typeof MIDDLE_LAYER_EDGES_LESSON_ID;

export type LessonSnapshot = {
  cubeState: CubeState;
  scannedFaces: Partial<Record<Face, FaceState>>;
};

export interface CubeStore {
  cubeState: CubeState | null;
  setCubeState: (state: CubeState) => void;
  applyMove: (move: Move) => void;

  scannedFaces: Partial<Record<Face, FaceState>>;
  setScannedFace: (face: Face, state: FaceState) => void;
  setScannedFacesFromCube: (cube: CubeState) => void;
  clearScannedFace: (face: Face) => void;
  clearScannedFaces: () => void;

  validationIssues: CubeValidationIssue[];
  validationSuggestedFace: Face | null;
  setValidationResult: (
    issues: CubeValidationIssue[],
    suggestedFace: Face | null,
  ) => void;
  clearValidationResult: () => void;

  appPhase: 'scanning' | 'correcting' | 'ready' | 'learning';
  setAppPhase: (phase: CubeStore['appPhase']) => void;

  /** Which bottom-layer lesson is active while `appPhase === 'learning'`. */
  activeLesson: ActiveLessonId;
  setActiveLesson: (lesson: ActiveLessonId) => void;

  /** Pre-apply cube snapshots for lesson undo (LIFO). Cleared on lesson entry/exit and manual cube edits. */
  lessonHistory: LessonSnapshot[];
  /** Restore the cube to before the last Apply example. No-op when history is empty. */
  undoLessonStep: () => void;

  /**
   * Reserved for avoid-back expansion input on apply. Reset to `none` after each apply because
   * y-rotations are baked into `cubeState`; preview uses `noneHold()` directly.
   */
  studentHold: StudentHold;
  /** One-time y2 bookend tip in the lesson UI; cleared by {@link resetLessonSession}. */
  hasSeenAvoidBackCallout: boolean;
  /** Clears avoid-back callout flag and `studentHold`. Does not change the cube. */
  resetLessonSession: () => void;
  markAvoidBackCalloutSeen: () => void;

  /**
   * Apply face-turn moves from solved storage orientation (e.g. parsed WCA scramble), then open the white-cross lesson.
   * Skips scanning — for practice only.
   */
  loadScrambledCubeIntoLesson: (moves: Move[]) => void;

  /**
   * Apply lesson demo moves in student hold (yellow U / white D).
   * When `avoidBackMoves` is true, inserts y2 + translated face turns for B-face steps.
   */
  applyLessonStep: (
    rawDemoMoves: Move[],
    options?: { avoidBackMoves?: boolean },
  ) => void;

  /**
   * Apply raw lesson `demoMoves` in student frame (no y2 bookends / B translation).
   * Prefer {@link applyLessonStep} when the avoid-back toggle is on.
   */
  applyLessonDemoMoves: (moves: Move[]) => void;
}

function scannedFacesFromCube(cube: CubeState): Record<Face, FaceState> {
  return {
    U: cube.U,
    D: cube.D,
    F: cube.F,
    B: cube.B,
    R: cube.R,
    L: cube.L,
  };
}

function captureLessonSnapshot(
  state: Pick<CubeStore, 'cubeState' | 'scannedFaces'>,
): LessonSnapshot | null {
  if (!state.cubeState) return null;
  return {
    cubeState: cloneCubeState(state.cubeState),
    scannedFaces: { ...state.scannedFaces },
  };
}

function lessonSessionReset() {
  return { studentHold: noneHold(), hasSeenAvoidBackCallout: false };
}

function clearsLessonHistoryOnPhaseChange(
  nextPhase: CubeStore['appPhase'],
  currentPhase: CubeStore['appPhase'],
): boolean {
  return nextPhase === 'learning' || currentPhase === 'learning';
}

function resetLessonSessionCaches(): Pick<CubeStore, 'lessonHistory'> {
  clearAllLessonDemoCaches();
  return { lessonHistory: [] };
}

export const useCubeStore = create<CubeStore>((set) => ({
  cubeState: null,
  setCubeState: (cubeState) => set({ cubeState, lessonHistory: [] }),
  applyMove: (move) =>
    set((state) => {
      if (!state.cubeState) return state;
      return { cubeState: applyCubeMove(state.cubeState, move) };
    }),

  scannedFaces: {},
  setScannedFace: (face, faceState) =>
    set((state) => ({
      scannedFaces: { ...state.scannedFaces, [face]: faceState },
    })),
  setScannedFacesFromCube: (cube) =>
    set({ scannedFaces: scannedFacesFromCube(cube) }),
  clearScannedFace: (face) =>
    set((state) => {
      const nextFaces = { ...state.scannedFaces };
      delete nextFaces[face];
      return { scannedFaces: nextFaces };
    }),
  clearScannedFaces: () => set({ scannedFaces: {} }),

  validationIssues: [],
  validationSuggestedFace: null,
  setValidationResult: (issues, suggestedFace) =>
    set({ validationIssues: issues, validationSuggestedFace: suggestedFace }),
  clearValidationResult: () =>
    set({ validationIssues: [], validationSuggestedFace: null }),

  appPhase: 'scanning',
  activeLesson: 'white-cross',
  lessonHistory: [],
  ...lessonSessionReset(),

  undoLessonStep: () =>
    set((state) => {
      if (state.lessonHistory.length === 0) return state;
      const snapshot = state.lessonHistory[state.lessonHistory.length - 1];
      return {
        cubeState: cloneCubeState(snapshot.cubeState),
        scannedFaces: { ...snapshot.scannedFaces },
        studentHold: noneHold(),
        lessonHistory: state.lessonHistory.slice(0, -1),
      };
    }),

  resetLessonSession: () => set(lessonSessionReset()),

  markAvoidBackCalloutSeen: () => set({ hasSeenAvoidBackCallout: true }),

  setActiveLesson: (activeLesson) => set({ activeLesson }),

  setAppPhase: (phase) =>
    set((state) => ({
      appPhase: phase,
      ...(phase === 'learning' && state.appPhase !== 'learning'
        ? resetLessonSessionCaches()
        : clearsLessonHistoryOnPhaseChange(phase, state.appPhase) &&
            phase !== 'learning'
          ? { lessonHistory: [] }
          : {}),
    })),

  loadScrambledCubeIntoLesson: (moves) => {
    const cube = applyMoves(createSolvedCubeState(), moves);
    clearAllLessonDemoCaches();
    set({
      cubeState: cube,
      scannedFaces: scannedFacesFromCube(cube),
      validationIssues: [],
      validationSuggestedFace: null,
      appPhase: 'learning',
      activeLesson: 'white-cross',
      lessonHistory: [],
      ...lessonSessionReset(),
    });
  },

  applyLessonStep: (rawDemoMoves, options) =>
    set((state) =>
      applyLessonStepPatch(
        state,
        rawDemoMoves,
        options?.avoidBackMoves ?? false,
      ),
    ),

  applyLessonDemoMoves: (moves) =>
    set((state) => applyLessonStepPatch(state, moves, false)),
}));

function applyLessonStepPatch(
  state: Pick<
    CubeStore,
    'cubeState' | 'studentHold' | 'scannedFaces' | 'lessonHistory'
  >,
  rawDemoMoves: Move[],
  avoidBackMoves: boolean,
):
  | Pick<
      CubeStore,
      'cubeState' | 'studentHold' | 'scannedFaces' | 'lessonHistory'
    >
  | CubeStore {
  if (!state.cubeState) return state;
  const snapshot = captureLessonSnapshot(state);
  if (!snapshot) return state;
  const applied = applyLessonToStorage(
    state.cubeState,
    rawDemoMoves,
    state.studentHold,
    avoidBackMoves,
  );
  if (!applied) return state;
  return {
    cubeState: applied.cubeState,
    studentHold: applied.studentHold,
    scannedFaces: scannedFacesFromCube(applied.cubeState),
    lessonHistory: [...state.lessonHistory, snapshot],
  };
}
