import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  applyMove,
  createSolvedCubeState,
  faceCentersFromCubeState,
} from '../../cube/cubeState';
import { MOVE_ANIMATION_PAUSE_MS } from '../../cube3d/moveAnimation';
import { NOTATION_MOVE_ANIMATION_MS } from './notationMoves';
import { useNotationCube } from './useNotationCube';

const SOLVED_CENTERS = faceCentersFromCubeState(createSolvedCubeState());

describe('useNotationCube', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows face turn result while card is active', () => {
    const { result } = renderHook(() => useNotationCube(false));

    act(() => {
      result.current.activateMoveCard("R'", 'face');
    });

    expect(result.current.moveAnimation?.move).toBe("R'");
    expect(result.current.moveAnimation?.durationMs).toBe(
      NOTATION_MOVE_ANIMATION_MS,
    );

    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    const turned = faceCentersFromCubeState(result.current.displayState);
    const afterRPrime = faceCentersFromCubeState(
      applyMove(createSolvedCubeState(), "R'"),
    );
    expect(turned).toEqual(afterRPrime);
  });

  it('resets face turn when card is deactivated', () => {
    const { result } = renderHook(() => useNotationCube(false));

    act(() => {
      result.current.activateMoveCard("R'", 'face');
    });
    act(() => {
      result.current.moveAnimation?.onComplete();
    });
    act(() => {
      result.current.deactivateMoveCard();
    });

    expect(faceCentersFromCubeState(result.current.displayState)).toEqual(
      SOLVED_CENTERS,
    );
  });

  it('shows rotation in demo while active without committing', () => {
    const { result } = renderHook(() => useNotationCube(false));

    act(() => {
      result.current.activateMoveCard('y', 'rotation');
    });
    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    const centers = faceCentersFromCubeState(result.current.displayState);
    expect(centers.F).toBe('red');
    expect(centers.L).toBe('green');

    act(() => {
      result.current.deactivateMoveCard();
    });

    expect(faceCentersFromCubeState(result.current.displayState)).toEqual(
      SOLVED_CENTERS,
    );
  });

  it('resetOrientation restores solved cube after rotation demo', () => {
    const { result } = renderHook(() => useNotationCube(false));

    act(() => {
      result.current.activateMoveCard('y', 'rotation');
    });
    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    act(() => {
      result.current.resetOrientation();
    });

    expect(result.current.displayState).toEqual(createSolvedCubeState());
  });

  it('replays when replay mode is on and card stays active', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotationCube(true));

    act(() => {
      result.current.activateMoveCard('F', 'face');
    });
    expect(result.current.moveAnimation?.move).toBe('F');

    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    act(() => {
      vi.advanceTimersByTime(MOVE_ANIMATION_PAUSE_MS);
    });

    expect(result.current.moveAnimation?.move).toBe('F');

    act(() => {
      result.current.moveAnimation?.onComplete();
    });
    expect(result.current.moveAnimation).toBeNull();
  });

  it('cancels replays when card is deactivated', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotationCube(true));

    act(() => {
      result.current.activateMoveCard('U', 'face');
    });
    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    act(() => {
      result.current.deactivateMoveCard();
      vi.advanceTimersByTime(MOVE_ANIMATION_PAUSE_MS);
    });

    expect(result.current.moveAnimation).toBeNull();
  });

  it('selectMoveCard switches active card on touch', () => {
    const { result } = renderHook(() => useNotationCube(false));

    act(() => {
      result.current.selectMoveCard('F', 'face');
    });
    expect(result.current.isCardActive('face', 'F')).toBe(true);

    act(() => {
      result.current.moveAnimation?.onComplete();
    });

    act(() => {
      result.current.selectMoveCard('R', 'face');
    });
    expect(result.current.isCardActive('face', 'F')).toBe(false);
    expect(result.current.isCardActive('face', 'R')).toBe(true);
  });
});
