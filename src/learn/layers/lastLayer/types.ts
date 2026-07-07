import type { Move } from '../../../cube/cubeState';
import type { CornerHoldIndex } from '../bottomLayer/corners/cornerHold';

export const LAST_LAYER_SUB_LESSONS = [
  'orient-edges',
  'permute-edges',
  'permute-corners',
  'orient-corners',
] as const;

export type LastLayerSubLesson = (typeof LAST_LAYER_SUB_LESSONS)[number];

export const LAST_LAYER_INTRO_IDS = [
  'overview',
  ...LAST_LAYER_SUB_LESSONS,
] as const;

export type LastLayerIntroId = (typeof LAST_LAYER_INTRO_IDS)[number];

export type SeenLastLayerIntros = Partial<Record<LastLayerIntroId, boolean>>;

export const ALL_LAST_LAYER_INTROS_SEEN: SeenLastLayerIntros = {
  overview: true,
  'orient-edges': true,
  'permute-edges': true,
  'permute-corners': true,
  'orient-corners': true,
};

/** All intros seen and past orient-edges (including already-complete yellow cross). */
export const LAST_LAYER_PAST_ORIENT_EDGES: LastLayerLessonStepOptions = {
  seenIntros: ALL_LAST_LAYER_INTROS_SEEN,
  hasAcknowledgedOrientEdgesComplete: true,
};

export const LAST_LAYER_STEP_KINDS = [
  'intro',
  'complete',
  'prerequisite',
  'align-u',
  'orient-edges',
  'orient-edges-already-complete',
  'orient-corners',
  'permute-edges',
  'permute-corners',
  'reorient-hold',
] as const;

export type LastLayerStepKind = (typeof LAST_LAYER_STEP_KINDS)[number];

export type OrientEdgesOllCase = 'dot' | 'l-shape' | 'bar';

export type PermuteEdgesCaseKind = 'u-only' | 'adjacent' | 'opposite';

export type PermuteCornersCaseKind =
  | 'none-permuted'
  | 'one-permuted'
  | 'zero-flow-first';

export interface LastLayerLessonStepOptions {
  currentHoldIndex?: CornerHoldIndex;
  /** Set once orient-corners starts; F2L may be temporarily disturbed until all corners are oriented. */
  inOrientCornersPhase?: boolean;
  /** Strategy intros shown once per session before each sub-lesson (and once for the overview). */
  seenIntros?: SeenLastLayerIntros;
  /** User continued past orient-edges when the yellow cross was already complete. */
  hasAcknowledgedOrientEdgesComplete?: boolean;
}

export type LastLayerLessonStep =
  | {
      kind: 'intro';
      title: string;
      body: string;
      introId: LastLayerIntroId;
      demoMoves?: Move[];
    }
  | {
      kind: 'complete';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'prerequisite';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'align-u';
      title: string;
      body: string;
      demoMoves: Move[];
      subLesson: 'orient-edges' | 'permute-edges' | 'orient-corners';
      ollCase?: 'l-shape' | 'bar';
    }
  | {
      kind: 'orient-edges';
      title: string;
      body: string;
      demoMoves: Move[];
      ollCase: OrientEdgesOllCase;
    }
  | {
      kind: 'orient-edges-already-complete';
      title: string;
      body: string;
    }
  | {
      kind: 'permute-edges';
      title: string;
      body: string;
      demoMoves: Move[];
      permuteCase: PermuteEdgesCaseKind;
    }
  | {
      kind: 'permute-corners';
      title: string;
      body: string;
      demoMoves: Move[];
      permuteCase: PermuteCornersCaseKind;
    }
  | {
      kind: 'orient-corners';
      title: string;
      body: string;
      demoMoves: Move[];
      reps: 2 | 4;
    }
  | {
      kind: 'reorient-hold';
      title: string;
      body: string;
      demoMoves: Move[];
      targetHoldIndex?: CornerHoldIndex;
      returnToInitialHold?: boolean;
    };

export interface SimulateLastLayerLessonResult {
  lessonStepsSimulated: number;
  lastLayerComplete: boolean;
  lastStepKind?: LastLayerLessonStep['kind'];
  stuckNoDemo: boolean;
  finalHoldIndex?: CornerHoldIndex;
}
