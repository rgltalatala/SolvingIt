import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Move,
} from '../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../cube/parseFaceTurnAlg';
import {
  LAST_LAYER_PAST_ORIENT_EDGES,
  countSolvedCorners,
  getLastLayerLessonStep,
  isCornersFullyPermuted,
  isLastLayerComplete,
  isLastLayerLessonStateValid,
  isVerifiedOrientCornersDemo,
  isYellowCrossComplete,
  ORIENT_CORNER_ALG,
  orientRepsAtUrf,
  PERMUTE_CORNERS_ALG,
  recognizeOrientCornersCase,
  repeatOrientAlg,
  simulateLastLayerLessonOnStorageCube,
} from './index';

import type { LastLayerLessonStepOptions } from './types';

const AFTER_ORIENT_EDGES = LAST_LAYER_PAST_ORIENT_EDGES;

function requireDemoMoves(step: { kind: string; demoMoves?: Move[] }): Move[] {
  if ('demoMoves' in step && step.demoMoves?.length) {
    return step.demoMoves;
  }
  throw new Error(`Expected demoMoves on ${step.kind}`);
}

function advanceLessonSessionAfterStep(
  step: ReturnType<typeof getLastLayerLessonStep>,
  session: LastLayerLessonStepOptions,
): LastLayerLessonStepOptions {
  if (step.kind === 'intro') {
    return {
      ...session,
      seenIntros: { ...session.seenIntros, [step.introId]: true },
    };
  }
  if (step.kind === 'orient-edges-already-complete') {
    return { ...session, hasAcknowledgedOrientEdgesComplete: true };
  }
  return session;
}

function invertMoves(moves: Move[]): Move[] {
  const inverted: Move[] = [];
  for (let i = moves.length - 1; i >= 0; i -= 1) {
    const move = moves[i]!;
    const face = move[0];
    if (move.endsWith('2')) inverted.push(move);
    else if (move.endsWith("'")) inverted.push(face as Move);
    else inverted.push(`${face}'` as Move);
  }
  return inverted;
}

function solvedStudent(): CubeState {
  return cubeStateToStudentFrame(createSolvedCubeState());
}

function unsolvedCornerCount(student: CubeState): number {
  return 4 - countSolvedCorners(student);
}

/** After permute, 0, 2, 3, or 4 corners may need orient — never exactly 1. */
function expectValidOrientEntryState(student: CubeState): void {
  expect(isCornersFullyPermuted(student)).toBe(true);
  expect([0, 2, 3, 4]).toContain(unsolvedCornerCount(student));
}

/** Permute finished with all corners already oriented (skip orient sub-lesson). */
function zeroUnsolvedAfterPermuteStudent(): CubeState {
  const onePermuted = applyMoves(
    solvedStudent(),
    invertMoves(PERMUTE_CORNERS_ALG),
  );
  const permute = getLastLayerLessonStep(onePermuted, AFTER_ORIENT_EDGES);
  if (permute.kind !== 'permute-corners' || !permute.demoMoves?.length) {
    throw new Error('zeroUnsolvedAfterPermuteStudent: expected permute-corners');
  }
  return applyMoves(onePermuted, permute.demoMoves);
}

/** Two corners need orienting (two others already show yellow on U). */
function twoUnsolvedOrientStudent(): CubeState {
  return applyMoves(solvedStudent(), [
    'U',
    ...invertMoves(repeatOrientAlg(2)),
    "U'",
    ...invertMoves(repeatOrientAlg(2)),
  ]);
}

/** Three corners need orienting — from a full-lesson scramble at orient entry. */
function threeUnsolvedOrientStudent(): CubeState {
  const setup = parseFaceTurnAlgToMoves(
    "R U R' U' R' F R2 U' R' U' R U R' F'",
  );
  let current = applyMoves(solvedStudent(), setup);
  let session: LastLayerLessonStepOptions = {
    currentHoldIndex: 0,
    seenIntros: {},
  };

  for (let i = 0; i < 20; i += 1) {
    const step = getLastLayerLessonStep(current, session);
    if (step.kind === 'orient-corners') return current;
    if (step.kind === 'intro' || step.kind === 'orient-edges-already-complete') {
      session = advanceLessonSessionAfterStep(step, session);
      continue;
    }
    if (step.kind === 'complete' || !step.demoMoves?.length) {
      throw new Error('threeUnsolvedOrientStudent: expected orient-corners entry');
    }
    current = applyMoves(current, step.demoMoves);
    if (step.kind === 'reorient-hold') {
      session.currentHoldIndex = (
        step.returnToInitialHold ? 0 : step.targetHoldIndex ?? session.currentHoldIndex
      ) as 0 | 1 | 2 | 3;
    }
  }

  throw new Error('threeUnsolvedOrientStudent: timed out before orient phase');
}

/** URF oriented with two corners still needing orient (after first orient demo). */
function needsAlignStudent(): CubeState {
  const start = threeUnsolvedOrientStudent();
  const orient = getLastLayerLessonStep(start, { ...AFTER_ORIENT_EDGES, inOrientCornersPhase: true });
  if (orient.kind !== 'orient-corners' || !orient.demoMoves?.length) {
    throw new Error('needsAlignStudent: expected orient-corners first');
  }
  return applyMoves(start, orient.demoMoves);
}

function simulateOrientCornersPhase(
  student: CubeState,
  maxSteps = 16,
): { complete: boolean; f2lRestored: boolean } {
  let current = cloneCubeState(student);
  let hold = 0 as 0 | 1 | 2 | 3;
  let inOrientCornersPhase = isCornersFullyPermuted(current);

  for (let i = 0; i < maxSteps; i += 1) {
    const step = getLastLayerLessonStep(current, {
      ...AFTER_ORIENT_EDGES,
      currentHoldIndex: hold,
      inOrientCornersPhase,
    });
    if (step.kind === 'intro' || step.kind === 'orient-edges-already-complete') {
      continue;
    }
    if (
      step.kind === 'orient-corners' ||
      (step.kind === 'align-u' && step.subLesson === 'orient-corners')
    ) {
      inOrientCornersPhase = true;
    }
    if (step.kind === 'complete') {
      return {
        complete: true,
        f2lRestored: isLastLayerLessonStateValid(current),
      };
    }
    if (!step.demoMoves?.length) {
      return {
        complete: isLastLayerComplete(current),
        f2lRestored: isLastLayerLessonStateValid(current),
      };
    }
    current = applyMoves(current, step.demoMoves);
    if (step.kind === 'reorient-hold') {
      hold = (step.returnToInitialHold
        ? 0
        : step.targetHoldIndex ?? hold) as 0 | 1 | 2 | 3;
    }
  }

  return {
    complete: isLastLayerComplete(current),
    f2lRestored: isLastLayerLessonStateValid(current),
  };
}

describe('last layer orient corners model', () => {
  it('detects fully solved cube (zero corners need orient)', () => {
    const student = solvedStudent();
    expectValidOrientEntryState(student);
    expect(unsolvedCornerCount(student)).toBe(0);
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(isLastLayerComplete(student)).toBe(true);
    expect(countSolvedCorners(student)).toBe(4);
    expect(recognizeOrientCornersCase(student)).toEqual({ kind: 'solved' });
  });

  it('detects zero corners needing orient after permute corners', () => {
    const student = zeroUnsolvedAfterPermuteStudent();
    expectValidOrientEntryState(student);
    expect(unsolvedCornerCount(student)).toBe(0);
    expect(isLastLayerComplete(student)).toBe(true);
    expect(recognizeOrientCornersCase(student)).toEqual({ kind: 'solved' });
  });

  it('detects two corners needing orientation at URF', () => {
    const student = twoUnsolvedOrientStudent();
    expectValidOrientEntryState(student);
    expect(unsolvedCornerCount(student)).toBe(2);
    const recognized = recognizeOrientCornersCase(student);
    expect(recognized.kind).toBe('orient-at-urf');
    if (recognized.kind === 'orient-at-urf') {
      expect(recognized.reps).toBe(2);
    }
  });

  it('detects four-rep orient case at URF with three corners unsolved', () => {
    const student = threeUnsolvedOrientStudent();
    expectValidOrientEntryState(student);
    expect(unsolvedCornerCount(student)).toBe(3);
    expect(orientRepsAtUrf(student)).toBe(4);
    expect(recognizeOrientCornersCase(student)).toMatchObject({
      kind: 'orient-at-urf',
      reps: 4,
    });
  });

  it('detects align when URF is oriented but others are not', () => {
    const student = needsAlignStudent();
    expectValidOrientEntryState(student);
    expect(unsolvedCornerCount(student)).toBe(2);
    expect(recognizeOrientCornersCase(student)).toMatchObject({
      kind: 'needs-align',
      alignMoves: ['U'],
    });
  });

  it('uses a single U turn to finish when all remaining corners are oriented on U', () => {
    let current = cloneCubeState(twoUnsolvedOrientStudent());
    const session = { ...AFTER_ORIENT_EDGES, inOrientCornersPhase: true };
    current = applyMoves(current, requireDemoMoves(getLastLayerLessonStep(current, session)));
    current = applyMoves(current, requireDemoMoves(getLastLayerLessonStep(current, session)));
    current = applyMoves(current, requireDemoMoves(getLastLayerLessonStep(current, session)));
    const finishAlign = getLastLayerLessonStep(current, session);
    expect(finishAlign).toMatchObject({
      kind: 'align-u',
      subLesson: 'orient-corners',
    });
    if (finishAlign.kind !== 'align-u') {
      throw new Error('expected align-u');
    }
    expect(finishAlign.demoMoves.length).toBe(1);
    expect(finishAlign.demoMoves[0]).not.toBe('U');
    expect(isLastLayerComplete(applyMoves(current, finishAlign.demoMoves))).toBe(
      true,
    );
  });
});

describe('last layer orient corners planner', () => {
  it('skips orient-corners when permute already oriented all corners', () => {
    expect(getLastLayerLessonStep(zeroUnsolvedAfterPermuteStudent(), AFTER_ORIENT_EDGES)).toMatchObject({
      kind: 'complete',
      title: 'Last layer complete',
    });
  });

  it('routes permuted twisted cube to orient-corners not complete', () => {
    expect(getLastLayerLessonStep(twoUnsolvedOrientStudent(), AFTER_ORIENT_EDGES)).toMatchObject({
      kind: 'orient-corners',
      reps: 2,
    });
  });

  it('returns complete for fully solved cube', () => {
    expect(getLastLayerLessonStep(solvedStudent())).toMatchObject({
      kind: 'complete',
      title: 'Last layer complete',
    });
  });

  it('returns align-u when URF is already oriented', () => {
    expect(getLastLayerLessonStep(needsAlignStudent(), { ...AFTER_ORIENT_EDGES, inOrientCornersPhase: true })).toMatchObject({
      kind: 'align-u',
      subLesson: 'orient-corners',
    });
  });

  it('orients URF with demo then makes progress on solved count', () => {
    const student = twoUnsolvedOrientStudent();
    const orient = getLastLayerLessonStep(student, AFTER_ORIENT_EDGES);
    expect(orient.kind).toBe('orient-corners');
    if (orient.kind !== 'orient-corners') return;
    const afterOrient = applyMoves(cloneCubeState(student), orient.demoMoves);
    expect(countSolvedCorners(afterOrient)).toBeGreaterThan(
      countSolvedCorners(student),
    );
  });

  it('verifies orient corner algorithm demo', () => {
    const student = twoUnsolvedOrientStudent();
    const step = getLastLayerLessonStep(student, AFTER_ORIENT_EDGES);
    expect(step.kind).toBe('orient-corners');
    if (step.kind === 'orient-corners' && step.demoMoves) {
      expect(isVerifiedOrientCornersDemo(student, step.demoMoves)).toBe(true);
    }
  });

  it('two-rep alg orients URF and increases solved count from two-unsolved scramble', () => {
    const student = twoUnsolvedOrientStudent();
    const before = countSolvedCorners(student);
    const after = applyMoves(student, repeatOrientAlg(2));
    expect(countSolvedCorners(after)).toBeGreaterThan(before);
    expect(unsolvedCornerCount(after)).toBe(1);
  });

  it('orient phase restores F2L once all corners are solved', () => {
    const result = simulateOrientCornersPhase(twoUnsolvedOrientStudent());
    expect(result.complete).toBe(true);
    expect(result.f2lRestored).toBe(true);
  });

  it('finishes two-unsolved orient without repeated single-U align steps', () => {
    let current = cloneCubeState(twoUnsolvedOrientStudent());
    const session = { ...AFTER_ORIENT_EDGES, inOrientCornersPhase: true };

    const firstOrient = getLastLayerLessonStep(current, session);
    expect(firstOrient.kind).toBe('orient-corners');
    current = applyMoves(current, requireDemoMoves(firstOrient));

    const firstAlign = getLastLayerLessonStep(current, session);
    expect(firstAlign.kind).toBe('align-u');
    current = applyMoves(current, requireDemoMoves(firstAlign));

    const secondOrient = getLastLayerLessonStep(current, session);
    expect(secondOrient.kind).toBe('orient-corners');
    current = applyMoves(current, requireDemoMoves(secondOrient));

    const remainingAligns: Move[][] = [];
    for (let i = 0; i < 4; i += 1) {
      const step = getLastLayerLessonStep(current, session);
      if (step.kind === 'complete') break;
      if (step.kind === 'align-u') {
        remainingAligns.push(step.demoMoves);
        current = applyMoves(current, step.demoMoves);
        continue;
      }
      if (step.kind === 'orient-corners') {
        current = applyMoves(current, step.demoMoves);
        continue;
      }
      break;
    }

    expect(remainingAligns.flat()).not.toEqual(['U', 'U', 'U']);
    expect(remainingAligns.length).toBeLessThanOrEqual(1);
    expect(isLastLayerComplete(current)).toBe(true);
  });
});

describe('last layer orient corners simulation', () => {
  it('completes two-unsolved scramble and restores F2L', () => {
    const result = simulateOrientCornersPhase(twoUnsolvedOrientStudent());
    expect(result.complete).toBe(true);
    expect(result.f2lRestored).toBe(true);
  });

  it('completes three-unsolved scramble through full lesson simulation', () => {
    const setup = parseFaceTurnAlgToMoves(
      "R U R' U' R' F R2 U' R' U' R U R' F'",
    );
    const result = simulateLastLayerLessonOnStorageCube(
      applyMoves(solvedStudent(), setup),
    );
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lastLayerComplete).toBe(true);
    expect(result.finalHoldIndex).toBe(0);
  });

  it('increases solved corner count through orient phase', () => {
    const student = threeUnsolvedOrientStudent();
    let current = cloneCubeState(student);
    let hold = 0 as 0 | 1 | 2 | 3;
    let inOrientCornersPhase = true;
    for (let i = 0; i < 16; i += 1) {
      const step = getLastLayerLessonStep(current, {
        ...AFTER_ORIENT_EDGES,
        currentHoldIndex: hold,
        inOrientCornersPhase,
      });
      if (step.kind === 'intro') continue;
      if (step.kind === 'complete') break;
      const demoMoves = requireDemoMoves(step);
      expect(demoMoves.length).toBeGreaterThan(0);
      const before = countSolvedCorners(current);
      current = applyMoves(current, demoMoves);
      if (step.kind === 'orient-corners') {
        expect(countSolvedCorners(current)).toBeGreaterThanOrEqual(before);
      }
      if (step.kind === 'reorient-hold') {
        hold = (step.returnToInitialHold
          ? 0
          : step.targetHoldIndex ?? hold) as 0 | 1 | 2 | 3;
      }
    }
    expect(isLastLayerComplete(current)).toBe(true);
    expect(isLastLayerLessonStateValid(current)).toBe(true);
  });
});

describe('orient corner algorithm', () => {
  it('uses R prime D prime R D', () => {
    expect(ORIENT_CORNER_ALG.join(' ')).toBe("R' D' R D");
  });
});
