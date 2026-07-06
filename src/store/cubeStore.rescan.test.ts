import { describe, expect, it } from 'vitest';
import { createSolvedCubeState } from '../cube/cubeState';
import { useCubeStore } from '../store/cubeStore';

describe('lesson rescan store flow', () => {
  it('startLessonRescan sets context and clears faces', () => {
    const cube = createSolvedCubeState();
    useCubeStore.setState({
      appPhase: 'learning',
      activeLesson: 'white-cross',
      cubeState: cube,
      scannedFaces: { U: cube.U },
      lessonHistory: [{ cubeState: cube, scannedFaces: {} }],
    });

    useCubeStore.getState().startLessonRescan();

    const state = useCubeStore.getState();
    expect(state.appPhase).toBe('scanning');
    expect(state.scanReturnContext).toEqual({ previousLesson: 'white-cross' });
    expect(state.scannedFaces).toEqual({});
    expect(state.lessonHistory).toEqual([]);
  });

  it('completeLessonResync updates cube and opens lessonResync phase', () => {
    const cube = createSolvedCubeState();
    useCubeStore.setState({
      scanReturnContext: { previousLesson: 'white-corners' },
      appPhase: 'scanning',
    });

    useCubeStore.getState().completeLessonResync(cube);

    const state = useCubeStore.getState();
    expect(state.appPhase).toBe('lessonResync');
    expect(state.cubeState).toEqual(cube);
    expect(Object.keys(state.scannedFaces)).toHaveLength(6);
    expect(state.scanReturnContext).toEqual({ previousLesson: 'white-corners' });
  });
});
