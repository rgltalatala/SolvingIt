import { describe, expect, it } from 'vitest';
import {
  applyMovesInStudentHold,
  createSolvedCubeState,
  type Move,
} from '../../cube/cubeState';
import {
  applyLessonToStorage,
  getLessonExecutionMoves,
  noneHold,
} from './index';

describe('applyLessonToStorage', () => {
  it('returns null for empty demo', () => {
    expect(
      applyLessonToStorage(createSolvedCubeState(), [], noneHold(), false),
    ).toBeNull();
  });

  it('matches manual getLessonExecutionMoves + applyMovesInStudentHold', () => {
    const storage = createSolvedCubeState();
    const raw = ['R', 'U'] as Move[];
    const expected = applyMovesInStudentHold(
      storage,
      getLessonExecutionMoves(raw, false).moves,
    );
    const applied = applyLessonToStorage(storage, raw, noneHold(), false);
    expect(applied?.cubeState).toEqual(expected);
    expect(applied?.studentHold).toEqual(noneHold());
  });
});
