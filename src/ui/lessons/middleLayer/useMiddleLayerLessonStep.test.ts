import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  applyMoves,
  createSolvedCubeState,
  cubeStateToStudentFrame,
} from '../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../cube/parseFaceTurnAlg';
import { useMiddleLayerLessonStep } from './useMiddleLayerLessonStep';

describe('useMiddleLayerLessonStep', () => {
  it('returns cross-corners-prerequisite when bottom layer is incomplete', async () => {
    const storage = applyMoves(
      createSolvedCubeState(),
      parseFaceTurnAlgToMoves("R U R'"),
    );
    const studentFrame = cubeStateToStudentFrame(storage);

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame, {
        resetKey: 'middle-layer-edges',
      }),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('cross-corners-prerequisite');
  });

  it('returns complete on solved cube with all middle edges placed', async () => {
    const studentFrame = cubeStateToStudentFrame(createSolvedCubeState());

    const { result } = renderHook(() =>
      useMiddleLayerLessonStep(studentFrame, {
        resetKey: 'middle-layer-edges',
      }),
    );

    await waitFor(() => {
      expect(result.current.isStepPending).toBe(false);
    });

    expect(result.current.step?.kind).toBe('complete');
    expect(result.current.isLessonComplete).toBe(true);
    expect(result.current.solvedSlots).toBe(4);
  });
});
