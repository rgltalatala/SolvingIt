import { describe, expect, it } from 'vitest';
import { applyMoves, createSolvedCubeState } from '../../cube/cubeState';
import { lastLayerLessonProgress } from '../../ui/lessons/lessonProgressBuilders';
import { parseFaceTurnAlgToMoves } from '../../cube/parseFaceTurnAlg';

describe('lastLayerLessonProgress stability', () => {
  it('keeps edge subsection order and labels stable across U turns', () => {
    // Scramble that leaves a partial yellow cross (dot/L/bar-ish) is unnecessary:
    // from solved last layer, all oriented; apply U and labels/order must not move.
    const solved = createSolvedCubeState();
    const afterU = applyMoves(solved, parseFaceTurnAlgToMoves('U'));

    const before = lastLayerLessonProgress(
      solved,
      'orient-edges',
      (n) => `${n}`,
      0,
    );
    const after = lastLayerLessonProgress(
      afterU,
      'orient-edges',
      (n) => `${n}`,
      0,
    );

    expect(after.slots?.map((s) => s.key)).toEqual(
      before.slots?.map((s) => s.key),
    );
    expect(after.slots?.map((s) => s.label)).toEqual(
      before.slots?.map((s) => s.label),
    );
    expect(after.slots?.map((s) => s.solved)).toEqual(
      before.slots?.map((s) => s.solved),
    );
  });

  it('keeps corner subsection labels stable across y reorients', () => {
    const solved = createSolvedCubeState();
    const atHold0 = lastLayerLessonProgress(
      solved,
      'orient-corners',
      (n) => `${n}`,
      0,
    );
    const atHold1 = lastLayerLessonProgress(
      applyMoves(solved, ['y']),
      'orient-corners',
      (n) => `${n}`,
      1,
    );

    expect(atHold1.slots?.map((s) => s.label)).toEqual(
      atHold0.slots?.map((s) => s.label),
    );
    expect(atHold1.slots?.map((s) => s.solved)).toEqual(
      atHold0.slots?.map((s) => s.solved),
    );
  });
});
