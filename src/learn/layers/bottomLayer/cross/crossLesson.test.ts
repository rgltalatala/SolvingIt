import { describe, expect, it } from 'vitest';
import {
  applyMove,
  applyMoves,
  applyMovesInStudentHold,
  compressConsecutiveFaceQuarterTurns,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Move,
} from '../../../../cube/cubeState';
import {
  countSolvedCrossSlots,
  crossEdgeExampleDemoMoves,
  getWhiteCrossLessonStep,
  getWhiteCrossLessonStepAsync,
  isWhiteCrossComplete,
  PERMUTE_STEP_KIND_TIEBREAK,
  WHITE_CROSS_STEP_KINDS,
} from './index';
import { crossSlotIdForPartner } from './crossSlotModel';
import { isVerifiedSlotDemo } from './crossSolveBfs';
import {
  collectDLayerInsertPermuteCandidates,
  collectRotateBottomPermuteCandidates,
} from './dLayerSteps';
import { collectMiddleLayerPermuteCandidates } from './middleLayerSteps';
import {
  getLessonExecutionMoves,
  isBackFaceMove,
  noneHold,
} from '../../../studentHold';
import { simulateWhiteCrossLessonOnStorageCube } from './simulateLesson';

/** Deterministic storage cube: `F` from solved — useful fixture where the lesson often opens with side-connect. */
function practiceFixtureCubeSingleF(): CubeState {
  return applyMoves(createSolvedCubeState(), ['F']);
}

describe('cubeStateToStudentFrame', () => {
  it('puts yellow on U and white on D from stored solved cube', () => {
    const solved = createSolvedCubeState();
    const s = cubeStateToStudentFrame(solved);
    expect(s.U.every((c) => c === 'yellow')).toBe(true);
    expect(s.D.every((c) => c === 'white')).toBe(true);
    expect(countSolvedCrossSlots(s)).toBe(4);
  });
});

describe('white cross step kinds', () => {
  it('lists active step kinds without removed align-partner', () => {
    expect(WHITE_CROSS_STEP_KINDS).toEqual([
      'complete',
      'solve-edge',
      'rotate-bottom',
      'side-connect',
      'insert-double',
    ]);
  });

  it('uses consecutive permute tiebreak values after align-partner removal', () => {
    expect(PERMUTE_STEP_KIND_TIEBREAK).toEqual({
      'rotate-bottom': 3,
      'side-connect': 2,
      'insert-double': 1,
    });
  });
});

describe('white cross lesson', () => {
  it('reports complete on solved cube in student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(getWhiteCrossLessonStep(student).kind).toBe('complete');
  });

  it('getWhiteCrossLessonStepAsync matches sync on representative student frames', async () => {
    const frames: CubeState[] = [
      cubeStateToStudentFrame(createSolvedCubeState()),
      cubeStateToStudentFrame(practiceFixtureCubeSingleF()),
      applyMoves(cubeStateToStudentFrame(createSolvedCubeState()), [
        'D',
        'R',
        'R',
      ]),
    ];

    let walk = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    for (let guard = 0; guard < 8; guard += 1) {
      frames.push(walk);
      const step = getWhiteCrossLessonStep(walk);
      if (step.kind === 'complete') break;
      if ('demoMoves' in step && step.demoMoves?.length) {
        walk = applyMoves(walk, step.demoMoves);
      } else {
        break;
      }
    }

    for (const student of frames) {
      const sync = getWhiteCrossLessonStep(student);
      const asyncStep = await getWhiteCrossLessonStepAsync(student);
      expect(asyncStep.kind).toBe(sync.kind);
      expect(asyncStep.title).toBe(sync.title);
      if ('demoMoves' in sync && sync.demoMoves?.length) {
        expect('demoMoves' in asyncStep && asyncStep.demoMoves).toBeTruthy();
        expect(asyncStep.demoMoves).toEqual(sync.demoMoves);
      }
    }
  });

  it('prioritizes rotate-bottom (D-layer white misalignment) before other steps including middle-layer side-connect', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['D', 'R', 'R'],
    );
    expect(getWhiteCrossLessonStep(student).kind).toBe('rotate-bottom');
  });

  const LESSON_SEARCH_MOVES = [
    'U',
    "U'",
    'F',
    "F'",
    'R',
    "R'",
    'L',
    "L'",
    'B',
    "B'",
    'D',
    "D'",
  ] as Move[];

  it('phased permute: rotate-bottom wins when both D permute and middle-layer candidates exist', () => {
    const base = cubeStateToStudentFrame(createSolvedCubeState());
    let example: Move[] | null = null;
    function dfs(s: typeof base, path: Move[], depth: number): void {
      if (example) return;
      if (depth === 0) {
        const hasRotate = collectRotateBottomPermuteCandidates(s).length > 0;
        const hasMiddle = collectMiddleLayerPermuteCandidates(s).length > 0;
        if (
          hasRotate &&
          hasMiddle &&
          getWhiteCrossLessonStep(s).kind === 'rotate-bottom'
        ) {
          example = [...path];
        }
        return;
      }
      for (const m of LESSON_SEARCH_MOVES)
        dfs(applyMove(s, m), [...path, m], depth - 1);
    }
    for (let d = 1; d <= 7 && !example; d++) dfs(base, [], d);
    expect(
      example,
      'expected scramble with both rotate-bottom and middle-layer options',
    ).not.toBeNull();
    const student = applyMoves(base, example!);
    expect(
      collectRotateBottomPermuteCandidates(student).length,
    ).toBeGreaterThan(0);
    expect(collectMiddleLayerPermuteCandidates(student).length).toBeGreaterThan(
      0,
    );
    expect(getWhiteCrossLessonStep(student).kind).toBe('rotate-bottom');
  });

  it('phased permute: D-layer insert-double before middle when no rotate-bottom tier', () => {
    const base = cubeStateToStudentFrame(createSolvedCubeState());
    let example: Move[] | null = null;
    function dfs(s: typeof base, path: Move[], depth: number): void {
      if (example) return;
      if (depth === 0) {
        const hasRotate = collectRotateBottomPermuteCandidates(s).length > 0;
        const hasInsert = collectDLayerInsertPermuteCandidates(s).length > 0;
        const hasMiddle = collectMiddleLayerPermuteCandidates(s).length > 0;
        if (
          !hasRotate &&
          hasInsert &&
          hasMiddle &&
          getWhiteCrossLessonStep(s).kind === 'insert-double'
        ) {
          example = [...path];
        }
        return;
      }
      for (const m of LESSON_SEARCH_MOVES)
        dfs(applyMove(s, m), [...path, m], depth - 1);
    }
    for (let d = 1; d <= 7 && !example; d++) dfs(base, [], d);
    expect(
      example,
      'expected scramble with D insert and middle but no rotate-bottom',
    ).not.toBeNull();
    const student = applyMoves(base, example!);
    expect(getWhiteCrossLessonStep(student).kind).toBe('insert-double');
  });

  it('middle-layer cross edge hugging its partner center: side-connect with exactly one quarter turn', () => {
    const base = cubeStateToStudentFrame(createSolvedCubeState());
    let example: Move[] | null = null;
    function dfs(s: typeof base, path: Move[], depth: number): void {
      if (example) return;
      if (depth === 0) {
        if (getWhiteCrossLessonStep(s).kind === 'side-connect')
          example = [...path];
        return;
      }
      for (const m of LESSON_SEARCH_MOVES)
        dfs(applyMove(s, m), [...path, m], depth - 1);
    }
    for (let d = 1; d <= 5 && !example; d++) dfs(base, [], d);
    expect(
      example,
      'expected some ≤5-move scramble to hit middle-layer side-connect',
    ).not.toBeNull();
    const student = applyMoves(base, example!);
    const step = getWhiteCrossLessonStep(student);
    expect(step.kind).toBe('side-connect');
    if (step.kind === 'side-connect') {
      expect(step.demoMoves?.length).toBe(1);
      const demoMove = step.demoMoves![0];
      expect(
        demoMove === 'F' ||
          demoMove === "F'" ||
          demoMove === 'R' ||
          demoMove === "R'" ||
          demoMove === 'L' ||
          demoMove === "L'" ||
          demoMove === 'B' ||
          demoMove === "B'",
      ).toBe(true);
    }
  });

  it('rotate-bottom demo uses D2 when two quarter D turns align the active slot', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['D', 'D'],
    );
    const step = getWhiteCrossLessonStep(student);
    expect(step.kind).toBe('rotate-bottom');
    if (step.kind === 'rotate-bottom') {
      expect(step.demoMoves).toEqual(['D2']);
      expect(step.body).toContain('D2');
      expect(step.title).toMatch(/^White–/);
      expect(step.edgeLabel.length).toBeGreaterThan(0);
    }
  });

  it('short direct solve for U-layer slot (R R U) uses U′ R2, not a longer multi-step path', () => {
    const moves = ['R', 'R', 'U'] as const;
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      [...moves],
    );
    const step = getWhiteCrossLessonStep(student);
    expect(step.kind).toBe('insert-double');
    if ('demoMoves' in step && step.demoMoves) {
      expect(step.demoMoves).toEqual(["U'", 'R2']);
      expect(step.demoMoves.length).toBeLessThanOrEqual(3);
      expect(compressConsecutiveFaceQuarterTurns(step.demoMoves)).toEqual(
        step.demoMoves,
      );
    }
  });

  it('suggests a cross step when a white cross edge is not on the bottom', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const candidates: Move[] = [
      'F',
      'F2',
      "F'",
      'R',
      'R2',
      "R'",
      'B',
      'B2',
      "B'",
      'L',
      'L2',
      "L'",
      'U',
      'U2',
      "U'",
      'D',
      'D2',
      "D'",
    ];
    const broken = candidates
      .map((m) => applyMove(student, m))
      .find((s) => !isWhiteCrossComplete(s));
    expect(
      broken,
      'at least one single move should break the white cross',
    ).toBeDefined();
    const step = getWhiteCrossLessonStep(broken!);
    expect([
      'solve-edge',
      'rotate-bottom',
      'side-connect',
      'insert-double',
    ]).toContain(step.kind);
  });

  it('solve-edge step describes center alignment and slotting on the bottom', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const broken = applyMove(student, 'F');
    const step = getWhiteCrossLessonStep(broken);
    if (step.kind === 'solve-edge') {
      expect(step.body.toLowerCase()).toMatch(/center/);
      expect(step.body.toLowerCase()).toMatch(/slot|cross|bottom/);
      expect(step.body.toLowerCase()).not.toMatch(
        /white sticker should face straight up on the yellow/,
      );
    }
  });

  it('solve-edge step includes playable demo moves when returned', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const broken = applyMove(student, 'F');
    const step = getWhiteCrossLessonStep(broken);
    if (step.kind === 'solve-edge') {
      expect(step.demoMoves?.length).toBeGreaterThan(0);
    }
  });

  it('solve-edge example demos are verified slot solves for the partner edge', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['F', 'R', 'U'],
    );
    const partner = student.F[4];
    const slotId = crossSlotIdForPartner(student, partner);
    expect(slotId).not.toBeNull();
    const demo = crossEdgeExampleDemoMoves(student, partner);
    expect(demo.length).toBeGreaterThan(0);
    expect(isVerifiedSlotDemo(student, slotId!, demo)).toBe(true);
  });

  it('every solve-edge step from getWhiteCrossLessonStep has a verified demo', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const candidates: Move[] = ['F', 'R', 'U', 'D', 'L', 'B', 'F2', 'R2'];
    for (const m of candidates) {
      const broken = applyMove(student, m);
      const step = getWhiteCrossLessonStep(broken);
      if (step.kind !== 'solve-edge' || !step.demoMoves?.length) continue;
      const partner = step.partnerColor;
      const slotId = crossSlotIdForPartner(broken, partner);
      expect(slotId, `slot for ${partner}`).not.toBeNull();
      expect(isVerifiedSlotDemo(broken, slotId!, step.demoMoves)).toBe(true);
    }
  });

  it('permutes a ready cross edge before solve-edge on a mis-flipped top-layer edge on the same scramble', () => {
    const moves = "R D F R B' D' R' L B2 R2 R F B2 B L D2 L2 B2"
      .split(/\s+/)
      .filter(Boolean) as Move[];
    let student = cubeStateToStudentFrame(createSolvedCubeState());
    for (const m of moves) {
      student = applyMove(student, m as Move);
    }
    const step = getWhiteCrossLessonStep(student);
    expect(['side-connect', 'rotate-bottom', 'insert-double']).toContain(
      step.kind,
    );
    expect(step.kind).not.toBe('solve-edge');
  });

  it('permutes a ready edge before solve-edge when another cross edge still needs work (R R U then F)', () => {
    const withSlotReady = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['R', 'R', 'U'],
    );
    const withEdgeStillNeeded = applyMove(withSlotReady, 'F');
    const step = getWhiteCrossLessonStep(withEdgeStillNeeded);
    expect(['side-connect', 'rotate-bottom', 'insert-double']).toContain(
      step.kind,
    );
    expect(step.kind).not.toBe('solve-edge');
  });

  it('fixture (F from solved): opening step is side-connect; applying its demo advances the lesson', () => {
    let storage = practiceFixtureCubeSingleF();
    let student = cubeStateToStudentFrame(storage);
    const step1 = getWhiteCrossLessonStep(student);
    expect(step1.kind).toBe('side-connect');
    if (step1.kind !== 'side-connect' || !step1.demoMoves?.length) return;

    storage = applyMovesInStudentHold(storage, step1.demoMoves);
    student = cubeStateToStudentFrame(storage);
    const step2 = getWhiteCrossLessonStep(student);
    expect(step2.kind).not.toBe('side-connect');
    // Minimal scramble: one quarter-turn may already finish the cross from here.
    expect([
      'solve-edge',
      'rotate-bottom',
      'insert-double',
      'complete',
    ]).toContain(step2.kind);
  });

  it('fixture (F from solved): solve-edge / insert-double / side-connect demos never reduce solved cross-slot count', () => {
    let storage = practiceFixtureCubeSingleF();
    let student = cubeStateToStudentFrame(storage);
    const guardedKinds = [
      'solve-edge',
      'insert-double',
      'side-connect',
    ] as const;
    for (let guard = 0; guard < 80; guard += 1) {
      if (isWhiteCrossComplete(student)) break;
      const step = getWhiteCrossLessonStep(student);
      const beforeSlots = countSolvedCrossSlots(student);
      if (!('demoMoves' in step) || !step.demoMoves?.length) break;
      storage = applyMovesInStudentHold(storage, step.demoMoves);
      student = cubeStateToStudentFrame(storage);
      if (guardedKinds.includes(step.kind as (typeof guardedKinds)[number])) {
        expect(countSolvedCrossSlots(student)).toBeGreaterThanOrEqual(
          beforeSlots,
        );
      }
    }
  });

  it('fixture (F from solved): playable lesson steps through the cross walk', () => {
    const student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    const step = getWhiteCrossLessonStep(student);
    expect([
      'side-connect',
      'solve-edge',
      'rotate-bottom',
      'insert-double',
    ]).toContain(step.kind);
    if ('demoMoves' in step && step.demoMoves?.length) {
      expect(step.demoMoves.length).toBeGreaterThan(0);
    }
  });

  it('simulateLesson with avoid-back on B-steps matches getLessonExecutionMoves per step', () => {
    let storage = practiceFixtureCubeSingleF();
    const res = simulateWhiteCrossLessonOnStorageCube(storage, 80, {
      avoidBackMoves: true,
      avoidBackOnlyOnBSteps: true,
    });
    expect(res.stuckNoDemo).toBe(false);
    expect(res.crossComplete).toBe(true);
    expect(res.finalStudentHold).toBeDefined();

    storage = practiceFixtureCubeSingleF();
    let steps = 0;
    let student = cubeStateToStudentFrame(storage);
    while (steps < 80 && !isWhiteCrossComplete(student)) {
      const step = getWhiteCrossLessonStep(student);
      if (!('demoMoves' in step) || !step.demoMoves?.length) break;
      const useAvoid = step.demoMoves.some(isBackFaceMove);
      const { moves } = getLessonExecutionMoves(
        step.demoMoves,
        useAvoid,
        noneHold(),
      );
      storage = applyMovesInStudentHold(storage, moves);
      student = cubeStateToStudentFrame(storage);
      steps += 1;
    }
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(steps).toBe(res.lessonStepsSimulated);
  });

  it('lesson demoMoves stay canonical while walking fixture (F from solved)', () => {
    let student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    for (let guard = 0; guard < 50; guard += 1) {
      const step = getWhiteCrossLessonStep(student);
      if ('demoMoves' in step && step.demoMoves?.length) {
        expect(compressConsecutiveFaceQuarterTurns(step.demoMoves)).toEqual(
          step.demoMoves,
        );
      }
      if (step.kind === 'complete') break;
      if ('demoMoves' in step && step.demoMoves?.length) {
        student = applyMoves(student, step.demoMoves);
      } else {
        break;
      }
    }
  });
});
