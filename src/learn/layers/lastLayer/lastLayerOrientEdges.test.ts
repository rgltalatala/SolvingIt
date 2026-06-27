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
  BAR_ALG,
  DOT_ALG,
  L_SHAPE_ALG,
  alignMovesForBar,
  alignMovesForLShape,
  countYellowEdgesOnU,
  getLastLayerLessonStep,
  isBarAligned,
  isLastLayerLessonStateValid,
  isLShapeAligned,
  isVerifiedOrientEdgesDemo,
  isYellowCrossComplete,
  recognizeOrientEdgesCase,
  simulateLastLayerLessonOnStorageCube,
  yellowEdgeSlotsOnU,
  type ULayerEdgeId,
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

function dotCaseStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(DOT_ALG));
}

function lShapeAtTargetStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(L_SHAPE_ALG));
}

function barAtTargetStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(BAR_ALG));
}

function lShapeRotatedStudent(
  slots: [ULayerEdgeId, ULayerEdgeId],
): CubeState {
  const align = alignMovesForLShape(slots);
  return applyMoves(lShapeAtTargetStudent(), invertMoves(align));
}

function barRotatedStudent(slots: [ULayerEdgeId, ULayerEdgeId]): CubeState {
  const align = alignMovesForBar(slots);
  return applyMoves(barAtTargetStudent(), invertMoves(align));
}

describe('last layer orient edges model', () => {
  it('detects solved yellow cross on solved cube', () => {
    const student = solvedStudent();
    expect(isYellowCrossComplete(student)).toBe(true);
    expect(recognizeOrientEdgesCase(student)).toEqual({ kind: 'solved' });
  });

  it('detects dot, L-shape, and bar cases', () => {
    expect(recognizeOrientEdgesCase(dotCaseStudent())).toEqual({ kind: 'dot' });
    expect(recognizeOrientEdgesCase(lShapeAtTargetStudent())).toEqual({
      kind: 'l-shape',
      slots: ['UB', 'UL'],
    });
    expect(recognizeOrientEdgesCase(barAtTargetStudent())).toEqual({
      kind: 'bar',
      slots: ['UL', 'UR'],
    });
  });

  it('classifies each L rotation as l-shape', () => {
    const pairs: Array<[ULayerEdgeId, ULayerEdgeId]> = [
      ['UB', 'UL'],
      ['UB', 'UR'],
      ['UR', 'UF'],
      ['UL', 'UF'],
    ];
    for (const slots of pairs) {
      const student = lShapeRotatedStudent(slots);
      const recognized = recognizeOrientEdgesCase(student);
      expect(recognized.kind).toBe('l-shape');
      if (recognized.kind === 'l-shape') {
        expect(new Set(recognized.slots)).toEqual(new Set(slots));
      }
    }
  });

  it('classifies bar orientations', () => {
    for (const slots of [
      ['UL', 'UR'],
      ['UB', 'UF'],
    ] as Array<[ULayerEdgeId, ULayerEdgeId]>) {
      const student = barRotatedStudent(slots);
      const recognized = recognizeOrientEdgesCase(student);
      expect(recognized.kind).toBe('bar');
      if (recognized.kind === 'bar') {
        expect(new Set(recognized.slots)).toEqual(new Set(slots));
      }
    }
  });
});

describe('last layer orient edges alignment', () => {
  it('aligns L-shape cases to UB and UL', () => {
    const pairs: Array<[ULayerEdgeId, ULayerEdgeId]> = [
      ['UB', 'UR'],
      ['UR', 'UF'],
      ['UL', 'UF'],
    ];
    for (const slots of pairs) {
      const student = lShapeRotatedStudent(slots);
      const align = alignMovesForLShape(slots);
      const after = applyMoves(student, align);
      expect(isLShapeAligned(yellowEdgeSlotsOnU(after))).toBe(true);
    }
  });

  it('aligns bar case UF+UB to UL+UR', () => {
    const student = barRotatedStudent(['UB', 'UF']);
    const align = alignMovesForBar(['UB', 'UF']);
    const after = applyMoves(student, align);
    expect(isBarAligned(yellowEdgeSlotsOnU(after))).toBe(true);
  });
});

describe('last layer orient edges algorithms', () => {
  it('preserves first two layers for each OLL demo', () => {
    const cases = [
      dotCaseStudent(),
      lShapeAtTargetStudent(),
      barAtTargetStudent(),
    ];
    for (const student of cases) {
      const step = getLastLayerLessonStep(student, AFTER_ALL_INTROS);
      expect(step.demoMoves?.length).toBeGreaterThan(0);
      expect(isLastLayerLessonStateValid(student)).toBe(true);
      if (step.demoMoves) {
        expect(isVerifiedOrientEdgesDemo(student, step.demoMoves)).toBe(true);
      }
    }
  });

  it('L-shape algorithm completes yellow cross from aligned L', () => {
    const student = lShapeAtTargetStudent();
    const after = applyMoves(student, L_SHAPE_ALG);
    expect(isYellowCrossComplete(after)).toBe(true);
    expect(isLastLayerLessonStateValid(after)).toBe(true);
  });

  it('bar algorithm completes yellow cross from aligned bar', () => {
    const student = barAtTargetStudent();
    const after = applyMoves(student, BAR_ALG);
    expect(isYellowCrossComplete(after)).toBe(true);
    expect(isLastLayerLessonStateValid(after)).toBe(true);
  });

  it('dot sequence completes yellow cross from dot', () => {
    const student = dotCaseStudent();
    const after = applyMoves(student, DOT_ALG);
    expect(isYellowCrossComplete(after)).toBe(true);
    expect(isLastLayerLessonStateValid(after)).toBe(true);
  });
});

describe('last layer lesson planner', () => {
  it('returns strategy intro before orient edges', () => {
    const step = getLastLayerLessonStep(dotCaseStudent());
    expect(step.kind).toBe('intro');
    if (step.kind === 'intro') {
      expect(step.introId).toBe('overview');
    }
  });

  it('returns orient-edges intro after overview', () => {
    const step = getLastLayerLessonStep(dotCaseStudent(), {
      seenIntros: { overview: true },
    });
    expect(step.kind).toBe('intro');
    if (step.kind === 'intro') {
      expect(step.introId).toBe('orient-edges');
    }
  });

  it('returns prerequisite when bottom or middle incomplete', () => {
    const incomplete = cloneCubeState(solvedStudent());
    incomplete.D[1] = 'red';
    expect(getLastLayerLessonStep(incomplete).kind).toBe('prerequisite');
  });

  it('returns complete when fully permuted at blue hold', () => {
    expect(getLastLayerLessonStep(solvedStudent()).kind).toBe('complete');
  });

  it('returns permute steps when yellow cross done but edges not permuted', () => {
    const yellowCrossOnly = applyMoves(solvedStudent(), ["U'"]);
    expect(isYellowCrossComplete(yellowCrossOnly)).toBe(true);
    const step = getLastLayerLessonStep(yellowCrossOnly, AFTER_ALL_INTROS);
    expect(step).toMatchObject({
      kind: 'orient-edges-already-complete',
    });
  });

  it('advances to permute-edges after acknowledging yellow cross is already complete', () => {
    const yellowCrossOnly = applyMoves(solvedStudent(), ["U'"]);
    const step = getLastLayerLessonStep(yellowCrossOnly, {
      ...AFTER_ALL_INTROS,
      hasAcknowledgedOrientEdgesComplete: true,
    });
    expect(step.kind).not.toBe('complete');
    expect(['align-u', 'permute-edges', 'reorient-hold']).toContain(step.kind);
  });

  it('shows orient-edges intro before already-complete step when yellow cross is done', () => {
    const yellowCrossOnly = applyMoves(solvedStudent(), ["U'"]);
    const step = getLastLayerLessonStep(yellowCrossOnly, {
      seenIntros: { overview: true },
    });
    expect(step.kind).toBe('intro');
    if (step.kind === 'intro') {
      expect(step.introId).toBe('orient-edges');
    }
  });

  it('returns align-u before L algorithm when misaligned', () => {
    const student = lShapeRotatedStudent(['UB', 'UR']);
    expect(getLastLayerLessonStep(student, AFTER_ALL_INTROS)).toMatchObject({
      kind: 'align-u',
      ollCase: 'l-shape',
    });
  });

  it('returns orient-edges when L is aligned', () => {
    const student = lShapeAtTargetStudent();
    expect(getLastLayerLessonStep(student, AFTER_ALL_INTROS)).toMatchObject({
      kind: 'orient-edges',
      ollCase: 'l-shape',
    });
  });

  it('returns align-u before bar algorithm when misaligned', () => {
    const student = barRotatedStudent(['UB', 'UF']);
    expect(getLastLayerLessonStep(student, AFTER_ALL_INTROS)).toMatchObject({
      kind: 'align-u',
      ollCase: 'bar',
    });
  });

  it('returns dot orient-edges in one step', () => {
    const student = dotCaseStudent();
    expect(getLastLayerLessonStep(student, AFTER_ALL_INTROS)).toMatchObject({
      kind: 'orient-edges',
      ollCase: 'dot',
    });
  });
});

describe('last layer lesson simulation', () => {
  it('reaches fully permuted edges from dot, L, and bar cases', () => {
    for (const student of [
      dotCaseStudent(),
      lShapeRotatedStudent(['UR', 'UF']),
      barRotatedStudent(['UB', 'UF']),
    ]) {
      const result = simulateLastLayerLessonOnStorageCube(student);
      expect(result.stuckNoDemo).toBe(false);
      expect(result.lastLayerComplete).toBe(true);
    }
  });

  it('increases yellow-on-U count after each non-complete step', () => {
    const student = lShapeRotatedStudent(['UB', 'UR']);
    let current = cloneCubeState(student);
    let before = countYellowEdgesOnU(current);
    let session = { ...AFTER_ALL_INTROS };
    for (let i = 0; i < 4; i += 1) {
      const step = getLastLayerLessonStep(current, session);
      if (step.kind === 'complete') break;
      if (step.kind === 'intro') continue;
      expect(step.demoMoves?.length).toBeGreaterThan(0);
      current = applyMoves(current, step.demoMoves!);
      const after = countYellowEdgesOnU(current);
      expect(after >= before || isYellowCrossComplete(current)).toBe(true);
      before = after;
    }
    expect(isYellowCrossComplete(current)).toBe(true);
    expect(getLastLayerLessonStep(current, AFTER_ALL_INTROS).kind).not.toBe('orient-edges');
  });
});
