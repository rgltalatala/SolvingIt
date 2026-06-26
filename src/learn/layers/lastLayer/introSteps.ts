import { lastLayerIntros } from '../../../content/lastLayer';
import type {
  LastLayerIntroId,
  LastLayerLessonStep,
  LastLayerLessonStepOptions,
  SeenLastLayerIntros,
} from './types';

const INTRO_CONTENT: Record<
  LastLayerIntroId,
  { title: string; body: string }
> = {
  overview: lastLayerIntros.overview,
  'orient-edges': lastLayerIntros.orientEdges,
  'permute-edges': lastLayerIntros.permuteEdges,
  'permute-corners': lastLayerIntros.permuteCorners,
  'orient-corners': lastLayerIntros.orientCorners,
};

export function hasSeenLastLayerIntro(
  options: LastLayerLessonStepOptions,
  introId: LastLayerIntroId,
): boolean {
  return options.seenIntros?.[introId] === true;
}

export function lastLayerIntroStep(introId: LastLayerIntroId): LastLayerLessonStep {
  const content = INTRO_CONTENT[introId];
  return {
    kind: 'intro',
    introId,
    title: content.title,
    body: content.body,
  };
}

export function markLastLayerIntroSeen(
  seenIntros: SeenLastLayerIntros | undefined,
  introId: LastLayerIntroId,
): SeenLastLayerIntros {
  return { ...seenIntros, [introId]: true };
}

export function maybeLastLayerIntro(
  options: LastLayerLessonStepOptions,
  introId: LastLayerIntroId,
): LastLayerLessonStep | null {
  if (hasSeenLastLayerIntro(options, introId)) return null;
  return lastLayerIntroStep(introId);
}
