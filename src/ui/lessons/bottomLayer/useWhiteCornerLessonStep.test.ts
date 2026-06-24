import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../cube/parseFaceTurnAlg';
import { useWhiteCornerLessonStep } from './useWhiteCornerLessonStep';

describe('useWhiteCornerLessonStep', () => {
  it('returns strategy intro before first corner solve', async () => {
    const storage = applyMoves(createSolvedCubeState(), ['F', 'D', "F'"]);
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCornerLessonStep(studentFrame, { resetKey: 'white-corners' }),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('intro');
  });

  it('returns cross-prerequisite when cross is incomplete', async () => {
    const storage = applyMoves(
      createSolvedCubeState(),
      parseFaceTurnAlgToMoves("R U R'"),
    );
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useWhiteCornerLessonStep(studentFrame, { resetKey: 'white-corners' }),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('cross-prerequisite');
  });
});
