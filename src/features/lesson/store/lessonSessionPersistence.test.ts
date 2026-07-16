import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useCubeStore } from '@/app/store/cubeStore';
import { useLessonSessionStore } from '@/features/lesson/store/lessonSessionStore';
import { createSolvedCubeState } from '@/domains/cube/cubeState';
import {
  clearLessonSession,
  hydrateLessonSession,
  saveLessonSession,
} from '@/features/lesson/store/lessonSessionPersistence';

describe('lessonSessionPersistence', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    });
    storage.clear();
    useCubeStore.setState({
      appPhase: 'scanning',
      cubeState: null,
      lessonHistory: [],
      activeLesson: 'white-cross',
    });
    useLessonSessionStore.getState().clearAllSessions();
    useLessonSessionStore.getState().resetUiState();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves and hydrates an active learning session', () => {
    const cube = createSolvedCubeState();
    useCubeStore.setState({
      appPhase: 'learning',
      activeLesson: 'white-corners',
      cubeState: cube,
      scannedFaces: { U: cube.U },
      lessonHistory: [],
      hasSeenAvoidBackCallout: true,
    });
    useLessonSessionStore.setState({
      learningSection: 'notation',
      notationSection: 'faceTurns',
      sessionsByLesson: {
        'white-corners': {
          currentHoldIndex: 1,
          solvedCornerIds: ['FRD'],
          hasSeenStrategyIntro: true,
          sessionUndoStack: [],
        },
      },
    });

    saveLessonSession();
    expect(storage.has('solving-it.lesson.activeSession')).toBe(true);

    useCubeStore.setState({ appPhase: 'scanning', cubeState: null });
    useLessonSessionStore.getState().clearAllSessions();

    const restored = hydrateLessonSession();
    expect(restored).toBe(true);
    expect(useCubeStore.getState().appPhase).toBe('learning');
    expect(useCubeStore.getState().activeLesson).toBe('white-corners');
    expect(useLessonSessionStore.getState().learningSection).toBe('notation');
    expect(
      useLessonSessionStore.getState().sessionsByLesson['white-corners']
        ?.currentHoldIndex,
    ).toBe(1);
  });

  it('maps legacy learningSection "lesson" to "learn" on hydrate', () => {
    const cube = createSolvedCubeState();
    storage.set(
      'solving-it.lesson.activeSession',
      JSON.stringify({
        version: 2,
        appPhase: 'learning',
        activeLesson: 'white-cross',
        learningSection: 'lesson',
        notationSection: 'cubePieces',
        sessionsByLesson: {},
        cubeState: cube,
        scannedFaces: {},
        lessonHistory: [],
        studentHold: useCubeStore.getState().studentHold,
        hasSeenAvoidBackCallout: false,
      }),
    );

    expect(hydrateLessonSession()).toBe(true);
    expect(useLessonSessionStore.getState().learningSection).toBe('learn');
  });

  it('clearLessonSession removes persisted data', () => {
    saveLessonSession();
    clearLessonSession();
    expect(storage.has('solving-it.lesson.activeSession')).toBe(false);
    expect(hydrateLessonSession()).toBe(false);
  });
});
