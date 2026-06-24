import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../../../cube/cubeState';
import { useWhiteCrossLessonStep } from './useWhiteCrossLessonStep';

describe('useWhiteCrossLessonStep', () => {
  it('returns strategy intro before first edge solve', async () => {
    const storage = applyMoves(createSolvedCubeState(), ['F']);
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCrossLessonStep(studentFrame, { resetKey: 'white-cross' }),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');
  });
});
