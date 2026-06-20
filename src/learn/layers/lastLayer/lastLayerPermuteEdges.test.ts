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
  PERMUTE_EDGES_ALG,
  backRightULayerSlots,
  countPermutedEdges,
  findUPrefixToFullyPermute,
  getLastLayerLessonStep,
  holdIndexWherePairIsBackRight,
  isEdgesFullyPermuted,
  isPairAtBackRight,
  isVerifiedPermuteEdgesDemo,
  isYellowCrossComplete,
  recognizePermuteEdgesCase,
  simulateLastLayerLessonOnStorageCube,
  type ULayerEdgeId,
} from './index';

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

function uOnlyPermuteStudent(): CubeState {
  return applyMoves(solvedStudent(), ["U'"]);
}

function adjacentPermuteStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(PERMUTE_EDGES_ALG));
}

function oppositePermuteStudent(): CubeState {
  const setup = parseFaceTurnAlgToMoves(
    "R U R' U' R' F R2 U' R' U' R U R' F'",
  );
  return applyMoves(solvedStudent(), setup);
}

describe('last layer permute edges model', () => {
  it('detects fully permuted edges on solved cube', () => {
    const student = solvedStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(isEdgesFullyPermuted(student)).toBe(true);
    expect(countPermutedEdges(student)).toBe(4);
    expect(recognizePermuteEdgesCase(student)).toEqual({ kind: 'solved' });
  });

  it('detects u-only permute case', () => {
    const student = uOnlyPermuteStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(isEdgesFullyPermuted(student)).toBe(false);
    expect(findUPrefixToFullyPermute(student)).toEqual(['U']);
    const recognized = recognizePermuteEdgesCase(student);
    expect(recognized).toMatchObject({ kind: 'u-only', alignMoves: ['U'] });
  });

  it('detects adjacent permute case with two aligned edges', () => {
    const student = adjacentPermuteStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(countPermutedEdges(student)).toBe(2);
    const recognized = recognizePermuteEdgesCase(student);
    expect(recognized.kind).toBe('adjacent');
    if (recognized.kind === 'adjacent') {
      expect(recognized.inspectPrefix).toEqual([]);
    }
  });

  it('detects opposite permute case', () => {
    const student = oppositePermuteStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    const recognized = recognizePermuteEdgesCase(student);
    expect(recognized.kind).toBe('opposite');
  });

  it('maps back+right U slots per hold', () => {
    expect(backRightULayerSlots(0)).toEqual(['UB', 'UR']);
    expect(backRightULayerSlots(1)).toEqual(['UL', 'UB']);
    expect(backRightULayerSlots(2)).toEqual(['UF', 'UL']);
    expect(backRightULayerSlots(3)).toEqual(['UR', 'UF']);
  });

  it('detects when aligned pair is at back+right U', () => {
    expect(isPairAtBackRight(['UB', 'UR'])).toBe(true);
    expect(isPairAtBackRight(['UF', 'UL'])).toBe(false);
  });

  it('picks hold where aligned pair should sit at back+right U', () => {
    for (let hold = 0 as 0 | 1 | 2 | 3; hold < 4; hold += 1) {
      const slots = backRightULayerSlots(hold);
      expect(holdIndexWherePairIsBackRight(slots, 0)).toBe(hold);
    }
    expect(holdIndexWherePairIsBackRight(['UB', 'UR'], 0)).toBe(0);
    expect(holdIndexWherePairIsBackRight(['UF', 'UL'], 0)).toBe(2);
  });
});

describe('last layer permute edges planner', () => {
  it('returns complete when fully permuted at blue hold', () => {
    expect(getLastLayerLessonStep(solvedStudent()).kind).toBe('complete');
  });

  it('returns align-u for u-only permute', () => {
    expect(getLastLayerLessonStep(uOnlyPermuteStudent())).toMatchObject({
      kind: 'align-u',
      subLesson: 'permute-edges',
    });
  });

  it('returns reorient-hold then permute-edges for adjacent case at wrong hold', () => {
    const student = adjacentPermuteStudent();
    const recognized = recognizePermuteEdgesCase(student, 0);
    if (recognized.kind !== 'adjacent') return;
    if (isPairAtBackRight(recognized.slots)) {
      expect(getLastLayerLessonStep(student, { currentHoldIndex: 0 })).toMatchObject({
        kind: 'permute-edges',
        permuteCase: 'adjacent',
      });
      return;
    }
    const reorient = getLastLayerLessonStep(student, { currentHoldIndex: 0 });
    expect(reorient.kind).toBe('reorient-hold');
    if (reorient.kind !== 'reorient-hold') return;
    let hold = reorient.targetHoldIndex ?? 0;
    let current = cloneCubeState(student);
    current = applyMoves(current, reorient.demoMoves);
    const permute = getLastLayerLessonStep(current, { currentHoldIndex: hold });
    expect(permute).toMatchObject({
      kind: 'permute-edges',
      permuteCase: 'adjacent',
    });
  });

  it('returns permute-edges for opposite case', () => {
    expect(getLastLayerLessonStep(oppositePermuteStudent())).toMatchObject({
      kind: 'permute-edges',
      permuteCase: 'opposite',
    });
  });

  it('verifies permute algorithm demo', () => {
    const student = adjacentPermuteStudent();
    const step = getLastLayerLessonStep(student);
    if (step.kind === 'reorient-hold') {
      const after = applyMoves(student, step.demoMoves);
      const next = getLastLayerLessonStep(after, {
        currentHoldIndex: step.targetHoldIndex,
      });
      expect(next.demoMoves?.length).toBeGreaterThan(0);
      if (next.demoMoves) {
        expect(isVerifiedPermuteEdgesDemo(after, next.demoMoves)).toBe(true);
      }
      return;
    }
    expect(step.demoMoves?.length).toBeGreaterThan(0);
    if (step.demoMoves) {
      expect(isVerifiedPermuteEdgesDemo(student, step.demoMoves)).toBe(true);
    }
  });
});

describe('last layer permute edges simulation', () => {
  it('completes from u-only, adjacent, and opposite scrambles', () => {
    const cases = [
      ['u-only', uOnlyPermuteStudent()],
      ['adjacent', adjacentPermuteStudent()],
      ['opposite', oppositePermuteStudent()],
    ] as const;
    for (const [name, student] of cases) {
      const result = simulateLastLayerLessonOnStorageCube(student);
      expect(result.stuckNoDemo, name).toBe(false);
      expect(result.lastLayerComplete, name).toBe(true);
      expect(result.finalHoldIndex, name).toBe(0);
    }
  });

  it('increases permuted edge count through permute phase', () => {
    const student = adjacentPermuteStudent();
    let current = cloneCubeState(student);
    let hold = 0 as 0 | 1 | 2 | 3;
    let before = countPermutedEdges(current);
    for (let i = 0; i < 8; i += 1) {
      const step = getLastLayerLessonStep(current, { currentHoldIndex: hold });
      if (step.kind === 'complete') break;
      expect(step.demoMoves?.length).toBeGreaterThan(0);
      if (step.kind !== 'reorient-hold') {
        current = applyMoves(current, step.demoMoves!);
      } else {
        current = applyMoves(current, step.demoMoves!);
      }
      if (step.kind === 'reorient-hold') {
        hold = (step.targetHoldIndex ?? hold) as 0 | 1 | 2 | 3;
        if (step.returnToInitialHold) hold = 0;
      }
      const after = countPermutedEdges(current);
      expect(after >= before || isEdgesFullyPermuted(current)).toBe(true);
      before = after;
    }
    expect(isEdgesFullyPermuted(current)).toBe(true);
  });
});
