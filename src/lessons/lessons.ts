import { WHITE_CORNERS_LESSON_ID } from '../learn/layers/bottomLayer/corners';
import { LAST_LAYER_LESSON_ID, LAST_LAYER_SUB_LESSONS } from '../learn/layers/lastLayer';
import type { LastLayerSubLesson } from '../learn/layers/lastLayer';
import { MIDDLE_LAYER_EDGES_LESSON_ID } from '../learn/layers/middleLayer/edges';
import type { ActiveLessonId } from '../store/cubeStore';
import { whiteCrossLesson } from '../content/whiteCross';
import { whiteCornersLesson } from '../content/whiteCorners';
import { middleLayerLesson } from '../content/middleLayer';
import { lastLayerLesson, LAST_LAYER_SUB_LESSON_LABELS } from '../content/lastLayer';

export type LessonRendererKey =
  | 'white-cross'
  | 'white-corners'
  | 'middle-layer-edges'
  | 'last-layer';

export type LessonConfig = {
  id: ActiveLessonId;
  title: string;
  renderer: LessonRendererKey;
  subLessons?: readonly LastLayerSubLesson[];
};

export const lessons: readonly LessonConfig[] = [
  {
    id: 'white-cross',
    title: whiteCrossLesson.defaultStepTitle,
    renderer: 'white-cross',
  },
  {
    id: WHITE_CORNERS_LESSON_ID,
    title: whiteCornersLesson.defaultStepTitle,
    renderer: 'white-corners',
  },
  {
    id: MIDDLE_LAYER_EDGES_LESSON_ID,
    title: middleLayerLesson.defaultStepTitle,
    renderer: 'middle-layer-edges',
  },
  {
    id: LAST_LAYER_LESSON_ID,
    title: lastLayerLesson.defaultStepTitle,
    renderer: 'last-layer',
    subLessons: LAST_LAYER_SUB_LESSONS,
  },
] as const;

export const DEFAULT_LESSON_ID: ActiveLessonId = 'white-cross';

export const LAST_LAYER_SUB_LESSON_TITLES: Record<LastLayerSubLesson, string> = {
  'orient-edges': LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
  'permute-edges': LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
  'permute-corners': LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
  'orient-corners': LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
};
