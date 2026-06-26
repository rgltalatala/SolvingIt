import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Move,
} from '../../../cube/cubeState';
import {
  ALL_LAST_LAYER_INTROS_SEEN,
  countPermutedCorners,
  getLastLayerLessonStep,
  holdIndexToBringSlotToWorldUrf,
  isCornersFullyPermuted,
  isVerifiedPermuteCornersDemo,
  isVerifiedPermuteCornersReorientDemo,
  isYellowCrossComplete,
  PERMUTE_CORNERS_ALG,
  recognizePermuteCornersCase,
  simulateLastLayerLessonOnStorageCube,
  ZERO_FLOW_Y2_TARGET_HOLD,
} from './index';

const AFTER_ALL_INTROS = { seenIntros: ALL_LAST_LAYER_INTROS_SEEN } as const;

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

function onePermutedCornerStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(PERMUTE_CORNERS_ALG));
}

function zeroPermutedCornersStudent(): CubeState {
  return applyMoves(solvedStudent(), [
    ...PERMUTE_CORNERS_ALG,
    'y2',
    ...invertMoves(PERMUTE_CORNERS_ALG),
  ]);
}

describe('last layer permute corners model', () => {
  it('detects fully permuted corners on solved cube', () => {
    const student = solvedStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(isCornersFullyPermuted(student)).toBe(true);
    expect(countPermutedCorners(student)).toBe(4);
    expect(recognizePermuteCornersCase(student)).toEqual({ kind: 'solved' });
  });

  it('detects one permuted corner case', () => {
    const student = onePermutedCornerStudent();
    expect(isCornersFullyPermuted(student)).toBe(false);
    expect(countPermutedCorners(student)).toBe(1);
    const recognized = recognizePermuteCornersCase(student);
    expect(recognized.kind).toBe('one-permuted');
    if (recognized.kind === 'one-permuted') {
      expect(recognized.targetHoldIndex).toBe(
        holdIndexToBringSlotToWorldUrf(recognized.slotId),
      );
    }
  });

  it('detects zero permuted corners case', () => {
    const student = zeroPermutedCornersStudent();
    expect(countPermutedCorners(student)).toBe(0);
    expect(recognizePermuteCornersCase(student)).toEqual({
      kind: 'none-permuted',
    });
  });

  it('maps hold to bring permuted slot to world URF', () => {
    expect(holdIndexToBringSlotToWorldUrf('UBR')).toBe(1);
    expect(holdIndexToBringSlotToWorldUrf('URF')).toBe(0);
    expect(holdIndexToBringSlotToWorldUrf('ULB')).toBe(2);
    expect(holdIndexToBringSlotToWorldUrf('UFL')).toBe(3);
  });
});

describe('last layer permute corners planner', () => {
  it('returns complete when fully permuted at blue hold', () => {
    expect(getLastLayerLessonStep(solvedStudent()).kind).toBe('complete');
  });

  it('returns zero-flow first alg when no corners are permuted', () => {
    expect(getLastLayerLessonStep(zeroPermutedCornersStudent(), AFTER_ALL_INTROS)).toMatchObject({
      kind: 'permute-corners',
      permuteCase: 'zero-flow-first',
    });
  });

  it('advances zero-flow through alg, y2, and second alg', () => {
    let student = zeroPermutedCornersStudent();
    let zeroFlowStep: 0 | 1 | 2 | undefined;

    const first = getLastLayerLessonStep(student, { ...AFTER_ALL_INTROS, permuteCornersZeroFlowStep: zeroFlowStep });
    expect(first).toMatchObject({
      kind: 'permute-corners',
      permuteCase: 'zero-flow-first',
    });
    student = applyMoves(student, first.demoMoves!);
    zeroFlowStep = 1;

    const second = getLastLayerLessonStep(student, { ...AFTER_ALL_INTROS, permuteCornersZeroFlowStep: zeroFlowStep });
    expect(second).toMatchObject({
      kind: 'reorient-hold',
      zeroFlowStep: 1,
      targetHoldIndex: ZERO_FLOW_Y2_TARGET_HOLD,
    });
    student = applyMoves(student, second.demoMoves!);
    zeroFlowStep = 2;

    const third = getLastLayerLessonStep(student, {
      ...AFTER_ALL_INTROS,
      currentHoldIndex: ZERO_FLOW_Y2_TARGET_HOLD,
      permuteCornersZeroFlowStep: zeroFlowStep,
    });
    expect(third).toMatchObject({
      kind: 'permute-corners',
      permuteCase: 'zero-flow-second',
    });
  });

  it('skips empty y2 when zero-flow step 1 already at green hold', () => {
    const student = zeroPermutedCornersStudent();
    expect(
      getLastLayerLessonStep(student, {
        ...AFTER_ALL_INTROS,
        currentHoldIndex: ZERO_FLOW_Y2_TARGET_HOLD,
        permuteCornersZeroFlowStep: 1,
      }),
    ).toMatchObject({
      kind: 'permute-corners',
      permuteCase: 'zero-flow-second',
      demoMoves: PERMUTE_CORNERS_ALG,
    });
  });

  it('completes zero-flow scramble through full lesson simulation', () => {
    const result = simulateLastLayerLessonOnStorageCube(
      zeroPermutedCornersStudent(),
    );
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lastLayerComplete).toBe(true);
    expect(result.finalHoldIndex).toBe(0);
  });

  it('returns reorient-hold then permute-corners for one-permuted case at wrong hold', () => {
    const student = onePermutedCornerStudent();
    const recognized = recognizePermuteCornersCase(student, 0);
    if (recognized.kind !== 'one-permuted') return;

    if (recognized.targetHoldIndex === 0) {
      expect(getLastLayerLessonStep(student, { ...AFTER_ALL_INTROS, currentHoldIndex: 0 })).toMatchObject({
        kind: 'permute-corners',
        permuteCase: 'one-permuted',
      });
      return;
    }

    const reorient = getLastLayerLessonStep(student, { ...AFTER_ALL_INTROS, currentHoldIndex: 0 });
    expect(reorient.kind).toBe('reorient-hold');
    if (reorient.kind !== 'reorient-hold') return;
    const hold = reorient.targetHoldIndex ?? 0;
    const current = applyMoves(cloneCubeState(student), reorient.demoMoves);
    const permute = getLastLayerLessonStep(current, { ...AFTER_ALL_INTROS, currentHoldIndex: hold });
    expect(permute).toMatchObject({
      kind: 'permute-corners',
      permuteCase: 'one-permuted',
    });
  });

  it('verifies permute corner algorithm demo', () => {
    const student = onePermutedCornerStudent();
    const step = getLastLayerLessonStep(student, AFTER_ALL_INTROS);
    if (step.kind === 'reorient-hold') {
      const after = applyMoves(student, step.demoMoves);
      const next = getLastLayerLessonStep(after, {
        ...AFTER_ALL_INTROS,
        currentHoldIndex: step.targetHoldIndex,
      });
      expect(next.demoMoves?.length).toBeGreaterThan(0);
      if (next.demoMoves) {
        expect(isVerifiedPermuteCornersDemo(after, next.demoMoves)).toBe(true);
      }
      return;
    }
    expect(step.demoMoves?.length).toBeGreaterThan(0);
    if (step.demoMoves) {
      expect(isVerifiedPermuteCornersDemo(student, step.demoMoves)).toBe(true);
    }
  });

  it('verifies zero-flow y2 reorient demo', () => {
    const student = applyMoves(
      zeroPermutedCornersStudent(),
      PERMUTE_CORNERS_ALG,
    );
    const step = getLastLayerLessonStep(student, { ...AFTER_ALL_INTROS, permuteCornersZeroFlowStep: 1 });
    expect(step.kind).toBe('reorient-hold');
    if (step.kind === 'reorient-hold' && step.demoMoves) {
      expect(isVerifiedPermuteCornersReorientDemo(student, step.demoMoves)).toBe(
        true,
      );
    }
  });
});

describe('last layer permute corners simulation', () => {
  it('completes from zero-permuted and one-permuted scrambles', () => {
    for (const student of [
      zeroPermutedCornersStudent(),
      onePermutedCornerStudent(),
    ]) {
      const result = simulateLastLayerLessonOnStorageCube(student);
      expect(result.stuckNoDemo).toBe(false);
      expect(result.lastLayerComplete).toBe(true);
      expect(result.finalHoldIndex).toBe(0);
    }
  });

  it('increases permuted corner count through permute phase', () => {
    const student = onePermutedCornerStudent();
    let current = cloneCubeState(student);
    let hold = 0 as 0 | 1 | 2 | 3;
    let zeroFlowStep: 0 | 1 | 2 | undefined;
    let before = countPermutedCorners(current);
    for (let i = 0; i < 12; i += 1) {
      const step = getLastLayerLessonStep(current, {
        ...AFTER_ALL_INTROS,
        currentHoldIndex: hold,
        permuteCornersZeroFlowStep: zeroFlowStep,
      });
      if (step.kind === 'complete') break;
      expect(step.demoMoves?.length).toBeGreaterThan(0);
      current = applyMoves(current, step.demoMoves!);
      if (step.kind === 'reorient-hold') {
        hold = (step.returnToInitialHold
          ? 0
          : step.targetHoldIndex ?? hold) as 0 | 1 | 2 | 3;
        if (step.zeroFlowStep === 1) zeroFlowStep = 2;
      }
      if (step.kind === 'permute-corners') {
        if (step.permuteCase === 'zero-flow-first') zeroFlowStep = 1;
        if (step.permuteCase === 'zero-flow-second') zeroFlowStep = undefined;
      }
      const after = countPermutedCorners(current);
      expect(after >= before || isCornersFullyPermuted(current)).toBe(true);
      before = after;
    }
    expect(isCornersFullyPermuted(current)).toBe(true);
  });
});
