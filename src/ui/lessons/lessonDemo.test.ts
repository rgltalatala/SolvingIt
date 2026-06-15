import { describe, expect, it } from 'vitest';
import type { Move } from '../../cube/cubeState';
import { resolveVisibleDemo, type DemoSnapshot } from './lessonDemo';

const snapshot = (key: string): DemoSnapshot => ({
  moves: ['F'] as Move[],
  demoSteps: [],
  instructions: [],
  demoKey: key,
});

describe('resolveVisibleDemo', () => {
  it('returns null when lesson is complete', () => {
    expect(
      resolveVisibleDemo({
        isLessonComplete: true,
        isStepPending: false,
        demoMovesLength: 1,
        currentDemo: snapshot('current'),
        cachedDemo: snapshot('cached'),
      }),
    ).toBeNull();
  });

  it('returns current demo when step is ready and has moves', () => {
    const current = snapshot('current');
    expect(
      resolveVisibleDemo({
        isLessonComplete: false,
        isStepPending: false,
        demoMovesLength: 1,
        currentDemo: current,
        cachedDemo: snapshot('cached'),
      }),
    ).toBe(current);
  });

  it('returns null when step is ready but has no demo (stuck)', () => {
    expect(
      resolveVisibleDemo({
        isLessonComplete: false,
        isStepPending: false,
        demoMovesLength: 0,
        currentDemo: null,
        cachedDemo: snapshot('stale'),
      }),
    ).toBeNull();
  });

  it('returns cached demo while step is pending', () => {
    const cached = snapshot('cached');
    expect(
      resolveVisibleDemo({
        isLessonComplete: false,
        isStepPending: true,
        demoMovesLength: 1,
        currentDemo: snapshot('current'),
        cachedDemo: cached,
      }),
    ).toBe(cached);
  });
});
