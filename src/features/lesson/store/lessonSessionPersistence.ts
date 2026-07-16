import type { CubeState, Face, FaceState } from '@/domains/cube/cubeState';
import { clearAllLessonDemoCaches } from '@/domains/lesson-engine/lessonCore/index';
import type { StudentHold } from '@/domains/lesson-engine/studentHold/index';
import {
  useLessonSessionStore,
  type LearningSection,
  type NotationSectionId,
  type SessionsByLesson,
} from '@/features/lesson/store/lessonSessionStore';
import {
  useCubeStore,
  type ActiveLessonId,
  type LessonSnapshot,
} from '@/app/store/cubeStore';

const ACTIVE_SESSION_KEY = 'solving-it.lesson.activeSession';
const PERSISTENCE_VERSION = 2;
const SAVE_DEBOUNCE_MS = 300;

export type PersistedLessonSession = {
  version: typeof PERSISTENCE_VERSION;
  appPhase: 'learning';
  activeLesson: ActiveLessonId;
  learningSection: LearningSection;
  notationSection: NotationSectionId;
  sessionsByLesson: SessionsByLesson;
  cubeState: CubeState;
  scannedFaces: Partial<Record<Face, FaceState>>;
  lessonHistory: LessonSnapshot[];
  studentHold: StudentHold;
  hasSeenAvoidBackCallout: boolean;
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let subscriptionsStarted = false;

function readStorage(): PersistedLessonSession | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedLessonSession;
    if (parsed.version !== PERSISTENCE_VERSION) return null;
    if (!parsed.cubeState) return null;
    if (parsed.appPhase !== 'learning') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(data: PersistedLessonSession): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data));
  } catch {
    // private mode / blocked storage
  }
}

export function clearLessonSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // private mode / blocked storage
  }
}

type SessionResetOptions = {
  clearStorage?: boolean;
  resetUi?: boolean;
  clearDemoCaches?: boolean;
  clearScan?: boolean;
  clearValidation?: boolean;
};

function resetSessionStores(options: SessionResetOptions = {}): void {
  if (options.clearStorage) clearLessonSession();
  if (options.clearDemoCaches) clearAllLessonDemoCaches();
  useLessonSessionStore.getState().clearAllSessions();
  if (options.resetUi) useLessonSessionStore.getState().resetUiState();
  useCubeStore.getState().resetLessonSession();
  if (options.clearScan) useCubeStore.getState().clearScannedFaces();
  if (options.clearValidation) useCubeStore.getState().clearValidationResult();
}

function shouldPersistPhase(phase: string): phase is 'learning' {
  return phase === 'learning';
}

function buildPersistedSnapshot(): PersistedLessonSession | null {
  const cube = useCubeStore.getState();
  const session = useLessonSessionStore.getState();
  if (!shouldPersistPhase(cube.appPhase) || !cube.cubeState) return null;

  return {
    version: PERSISTENCE_VERSION,
    appPhase: cube.appPhase,
    activeLesson: cube.activeLesson,
    learningSection: session.learningSection,
    notationSection: session.notationSection,
    sessionsByLesson: session.sessionsByLesson,
    cubeState: cube.cubeState,
    scannedFaces: cube.scannedFaces,
    lessonHistory: cube.lessonHistory,
    studentHold: cube.studentHold,
    hasSeenAvoidBackCallout: cube.hasSeenAvoidBackCallout,
  };
}

export function saveLessonSession(): void {
  const snapshot = buildPersistedSnapshot();
  if (!snapshot) return;
  writeStorage(snapshot);
}

function scheduleSave(): void {
  if (saveTimeout !== null) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    saveLessonSession();
  }, SAVE_DEBOUNCE_MS);
}

export function startLessonSessionPersistence(): void {
  if (subscriptionsStarted) return;
  subscriptionsStarted = true;

  useCubeStore.subscribe((state, prev) => {
    const wasPersisted = shouldPersistPhase(prev.appPhase);
    const isPersisted = shouldPersistPhase(state.appPhase);

    if (wasPersisted && !isPersisted) {
      clearLessonSession();
      return;
    }

    if (!isPersisted) return;

    if (
      state.appPhase !== prev.appPhase ||
      state.cubeState !== prev.cubeState ||
      state.activeLesson !== prev.activeLesson ||
      state.lessonHistory !== prev.lessonHistory ||
      state.studentHold !== prev.studentHold ||
      state.hasSeenAvoidBackCallout !== prev.hasSeenAvoidBackCallout ||
      state.scannedFaces !== prev.scannedFaces
    ) {
      scheduleSave();
    }
  });

  useLessonSessionStore.subscribe((state, prev) => {
    if (!shouldPersistPhase(useCubeStore.getState().appPhase)) return;
    if (
      state.learningSection !== prev.learningSection ||
      state.notationSection !== prev.notationSection ||
      state.sessionsByLesson !== prev.sessionsByLesson
    ) {
      scheduleSave();
    }
  });
}

function normalizeLearningSection(section: string): LearningSection {
  if (section === 'notation' || section === 'cases' || section === 'learn') {
    return section;
  }
  // Legacy persisted value before the Learn section id rename.
  return 'learn';
}

export function hydrateLessonSession(): boolean {
  const persisted = readStorage();
  if (!persisted) return false;

  useLessonSessionStore.setState({
    learningSection: normalizeLearningSection(persisted.learningSection),
    notationSection: persisted.notationSection,
    sessionsByLesson: persisted.sessionsByLesson,
  });

  useCubeStore.setState({
    appPhase: persisted.appPhase,
    activeLesson: persisted.activeLesson,
    cubeState: persisted.cubeState,
    scannedFaces: persisted.scannedFaces,
    lessonHistory: persisted.lessonHistory,
    studentHold: persisted.studentHold,
    hasSeenAvoidBackCallout: persisted.hasSeenAvoidBackCallout,
  });

  return true;
}

export function restartFromBeginning(): void {
  resetSessionStores({
    clearStorage: true,
    resetUi: true,
    clearDemoCaches: true,
    clearScan: true,
    clearValidation: true,
  });
  useCubeStore.setState({
    cubeState: null,
    appPhase: 'notation',
    activeLesson: 'white-cross',
    lessonHistory: [],
  });
}

export function prepareFreshLessonStart(lessonId: ActiveLessonId): void {
  resetSessionStores({ clearStorage: true });
  useLessonSessionStore.getState().setLearningSection('learn');
  useCubeStore.setState({
    activeLesson: lessonId,
    lessonHistory: [],
  });
}

export function continueToLesson(nextLesson: ActiveLessonId): void {
  const previousLesson = useCubeStore.getState().activeLesson;
  useLessonSessionStore.getState().clearSessionForLesson(previousLesson);
  useCubeStore.getState().resetLessonSession();
  useCubeStore.setState({
    activeLesson: nextLesson,
    lessonHistory: [],
  });
  saveLessonSession();
}
