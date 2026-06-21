import type { Move } from '../../../cube/cubeState';
import type { CornerHoldIndex } from '../../bottomLayer/corners/cornerHold';

export const LAST_LAYER_SUB_LESSONS = [
  'orient-edges',
  'permute-edges',
  'permute-corners',
  'orient-corners',
] as const;

export type LastLayerSubLesson = (typeof LAST_LAYER_SUB_LESSONS)[number];

export const LAST_LAYER_STEP_KINDS = [
  'complete',
  'prerequisite',
  'align-u',
  'orient-edges',
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
  | 'zero-flow-first'
  | 'zero-flow-second';

export type PermuteCornersZeroFlowStep = 0 | 1 | 2;

export interface LastLayerLessonStepOptions {
  currentHoldIndex?: CornerHoldIndex;
  permuteCornersZeroFlowStep?: PermuteCornersZeroFlowStep;
  /** Set once orient-corners starts; F2L may be temporarily disturbed until all corners are oriented. */
  inOrientCornersPhase?: boolean;
}

export type LastLayerLessonStep =
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
      zeroFlowStep?: 1;
    };

export interface SimulateLastLayerLessonResult {
  lessonStepsSimulated: number;
  lastLayerComplete: boolean;
  lastStepKind?: LastLayerLessonStep['kind'];
  stuckNoDemo: boolean;
  finalHoldIndex?: CornerHoldIndex;
}
