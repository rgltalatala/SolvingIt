import {
  LAST_LAYER_SUB_LESSON_LABELS,
  lastLayerLesson,
} from '../../../content/lastLayer';
import type { LastLayerIntroId } from '../../../learn/layers/lastLayer/types';
import type { LastLayerProgressPhase } from '../lessonProgressBuilders';

const INTRO_SUB_LESSON_LABELS: Record<
  Exclude<LastLayerIntroId, 'overview'>,
  string
> = {
  'orient-edges': LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
  'permute-edges': LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
  'permute-corners': LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
  'orient-corners': LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
};

const PHASE_LABELS: Record<LastLayerProgressPhase, string> = {
  'orient-edges': LAST_LAYER_SUB_LESSON_LABELS.orientEdges,
  'orient-corners': LAST_LAYER_SUB_LESSON_LABELS.orientCorners,
  'permute-corners': LAST_LAYER_SUB_LESSON_LABELS.permuteCorners,
  'permute-edges': LAST_LAYER_SUB_LESSON_LABELS.permuteEdges,
};

type LastLayerPhaseOptions = {
  isOrientEdgesLessonStep: boolean;
  cornerOrientPhase: boolean;
  cornerPermutePhase: boolean;
  edgePermutePhase: boolean;
};

/** Sub-lesson title shown in the last-layer progress phase label. */
export function resolveLastLayerSubLessonLabel(
  options: LastLayerPhaseOptions & { introId?: LastLayerIntroId },
): string {
  const { introId } = options;

  if (introId === 'overview') return lastLayerLesson.defaultStepTitle;
  if (introId) return INTRO_SUB_LESSON_LABELS[introId];

  return PHASE_LABELS[resolveLastLayerProgressPhase(options)];
}

/** Which last-layer sub-phase drives the progress bar. */
export function resolveLastLayerProgressPhase(
  options: LastLayerPhaseOptions,
): LastLayerProgressPhase {
  if (options.isOrientEdgesLessonStep) return 'orient-edges';
  if (options.cornerOrientPhase) return 'orient-corners';
  if (options.cornerPermutePhase) return 'permute-corners';
  if (options.edgePermutePhase) return 'permute-edges';
  return 'orient-edges';
}

const PROGRESS_LABEL_BY_PHASE: Record<
  LastLayerProgressPhase,
  (solved: number) => string
> = {
  'orient-edges': lastLayerLesson.progress.orientEdges,
  'orient-corners': lastLayerLesson.progress.orientCorners,
  'permute-corners': lastLayerLesson.progress.permuteCorners,
  'permute-edges': lastLayerLesson.progress.permuteEdges,
};

/** Progress aria/count label for the active last-layer phase. */
export function progressLabelForLastLayerPhase(
  phase: LastLayerProgressPhase,
  solved: number,
): string {
  return PROGRESS_LABEL_BY_PHASE[phase](solved);
}
