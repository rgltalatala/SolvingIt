import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyMovesInStudentHold,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type Move,
} from '../cube/cubeState';
import {
  getLessonExecutionMoves,
  isBackFaceMove,
  noneHold,
} from '../learn/studentHold';
import { useCubeStore } from './cubeStore';

function resetStore(cube = createSolvedCubeState()) {
  useCubeStore.setState({
    cubeState: cube,
    scannedFaces: {
      U: cube.U,
      D: cube.D,
      F: cube.F,
      B: cube.B,
      R: cube.R,
      L: cube.L,
    },
    appPhase: 'learning',
    lessonHistory: [],
    studentHold: noneHold(),
    hasSeenAvoidBackCallout: false,
  });
}

describe('cubeStore lesson session', () => {
  beforeEach(() => {
    resetStore();
  });

  it('does not reset studentHold when entering learning from ready', () => {
    useCubeStore.setState({
      appPhase: 'ready',
      studentHold: { y: 'y2' },
      hasSeenAvoidBackCallout: true,
    });
    useCubeStore.getState().setAppPhase('learning');
    expect(useCubeStore.getState().studentHold).toEqual({ y: 'y2' });
    expect(useCubeStore.getState().hasSeenAvoidBackCallout).toBe(true);
  });

  it('loadScrambledCubeIntoLesson resets lesson session', () => {
    useCubeStore.setState({
      studentHold: { y: 'y2' },
      hasSeenAvoidBackCallout: true,
    });
    useCubeStore.getState().loadScrambledCubeIntoLesson(['F']);
    const s = useCubeStore.getState();
    expect(s.appPhase).toBe('learning');
    expect(s.studentHold).toEqual(noneHold());
    expect(s.hasSeenAvoidBackCallout).toBe(false);
  });

  it('applyLessonStep with avoid-back off matches raw demo on storage', () => {
    const raw = ['R', 'U'] as Move[];
    const before = useCubeStore.getState().cubeState!;
    const expected = applyMovesInStudentHold(before, raw);

    useCubeStore.getState().applyLessonStep(raw, { avoidBackMoves: false });
    const after = useCubeStore.getState();

    expect(after.cubeState).toEqual(expected);
    expect(after.studentHold).toEqual(noneHold());
  });

  it('applyLessonStep with avoid-back expands B; hold resets after apply (rotation on cube)', () => {
    const raw = ["B'"] as Move[];
    useCubeStore.getState().applyLessonStep(raw, { avoidBackMoves: true });

    const { cubeState, studentHold } = useCubeStore.getState();
    const { moves } = getLessonExecutionMoves(raw, true, noneHold());
    expect(moves).toEqual(['y2', "F'", 'y2']);
    expect(moves.some((m) => isBackFaceMove(m))).toBe(false);
    expect(studentHold).toEqual(noneHold());

    const before = createSolvedCubeState();
    expect(cubeState).toEqual(applyMovesInStudentHold(before, moves));
  });

  it('applyLessonDemoMoves delegates to applyLessonStep without avoid-back', () => {
    const raw = ['F'] as Move[];
    const before = useCubeStore.getState().cubeState!;
    useCubeStore.getState().applyLessonDemoMoves(raw);
    expect(useCubeStore.getState().cubeState).toEqual(
      applyMovesInStudentHold(before, raw),
    );
  });

  it('after avoid-back apply, next step uses raw demo moves without y-hold translation', () => {
    useCubeStore.getState().applyLessonStep(["B'"], { avoidBackMoves: true });
    expect(useCubeStore.getState().studentHold).toEqual(noneHold());

    const raw = ["D'", 'F', 'D'] as Move[];
    const before = useCubeStore.getState().cubeState!;
    useCubeStore.getState().applyLessonStep(raw, { avoidBackMoves: false });
    expect(getLessonExecutionMoves(raw, false, noneHold()).moves).toEqual(raw);
    expect(useCubeStore.getState().cubeState).toEqual(
      applyMovesInStudentHold(before, raw),
    );
    expect(useCubeStore.getState().studentHold).toEqual(noneHold());
  });

  it('resetLessonSession clears hold and callout flag', () => {
    useCubeStore.setState({
      studentHold: { y: 'y' },
      hasSeenAvoidBackCallout: true,
    });
    useCubeStore.getState().resetLessonSession();
    expect(useCubeStore.getState().studentHold).toEqual(noneHold());
    expect(useCubeStore.getState().hasSeenAvoidBackCallout).toBe(false);
  });

  it('applyLessonStep pushes pre-apply snapshot; undoLessonStep restores it', () => {
    const before = useCubeStore.getState().cubeState!;
    const raw = ['F'] as Move[];

    useCubeStore.getState().applyLessonDemoMoves(raw);
    expect(useCubeStore.getState().lessonHistory).toHaveLength(1);
    expect(useCubeStore.getState().lessonHistory[0].cubeState).toEqual(before);
    expect(useCubeStore.getState().cubeState).toEqual(
      applyMovesInStudentHold(before, raw),
    );

    useCubeStore.getState().undoLessonStep();
    expect(useCubeStore.getState().cubeState).toEqual(before);
    expect(useCubeStore.getState().lessonHistory).toHaveLength(0);
    expect(useCubeStore.getState().studentHold).toEqual(noneHold());
  });

  it('undoLessonStep is no-op when history is empty', () => {
    const before = useCubeStore.getState().cubeState!;
    useCubeStore.getState().undoLessonStep();
    expect(useCubeStore.getState().cubeState).toBe(before);
  });

  it('multiple applies undo in LIFO order', () => {
    const s0 = useCubeStore.getState().cubeState!;
    useCubeStore.getState().applyLessonDemoMoves(['F']);
    const s1 = useCubeStore.getState().cubeState!;
    useCubeStore.getState().applyLessonDemoMoves(['R']);
    const s2 = useCubeStore.getState().cubeState!;

    expect(s2).not.toEqual(s1);
    useCubeStore.getState().undoLessonStep();
    expect(useCubeStore.getState().cubeState).toEqual(s1);
    useCubeStore.getState().undoLessonStep();
    expect(useCubeStore.getState().cubeState).toEqual(s0);
    expect(useCubeStore.getState().lessonHistory).toHaveLength(0);
  });

  it('entering learning clears lesson history', () => {
    useCubeStore.getState().applyLessonDemoMoves(['F']);
    expect(useCubeStore.getState().lessonHistory.length).toBeGreaterThan(0);

    useCubeStore.getState().setAppPhase('ready');
    expect(useCubeStore.getState().lessonHistory).toEqual([]);

    useCubeStore.getState().setAppPhase('learning');
    expect(useCubeStore.getState().lessonHistory).toEqual([]);
  });

  it('setCubeState clears lesson history', () => {
    useCubeStore.getState().applyLessonDemoMoves(['F']);
    const cube = useCubeStore.getState().cubeState!;
    useCubeStore.getState().setCubeState(cube);
    expect(useCubeStore.getState().lessonHistory).toEqual([]);
  });

  it('loadScrambledCubeIntoLesson clears lesson history', () => {
    useCubeStore.getState().applyLessonDemoMoves(['F']);
    useCubeStore.getState().loadScrambledCubeIntoLesson(['R']);
    expect(useCubeStore.getState().lessonHistory).toEqual([]);
  });

  it('accepts notation app phase', () => {
    useCubeStore.getState().setAppPhase('notation');
    expect(useCubeStore.getState().appPhase).toBe('notation');
  });
});
