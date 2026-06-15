import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import type { Face } from '../../../../cube/cubeState';
import type { StudentHold } from '../../../studentHold';

export type CrossEdgeId = 'DF' | 'DR' | 'DB' | 'DL';

/** All lesson step kinds in planner priority order (first = highest priority when planning). */
export const WHITE_CROSS_STEP_KINDS = [
  'complete',
  'solve-edge',
  'rotate-bottom',
  'side-connect',
  'insert-double',
] as const;

export type WhiteCrossStepKind = (typeof WHITE_CROSS_STEP_KINDS)[number];

/** Within a permute tier: higher wins ties after slots gained and shorter demo. */
export const PERMUTE_STEP_KIND_TIEBREAK: Record<
  Extract<
    WhiteCrossStepKind,
    'rotate-bottom' | 'side-connect' | 'insert-double'
  >,
  number
> = {
  'rotate-bottom': 3,
  'side-connect': 2,
  'insert-double': 1,
};

export type WhiteCrossLessonStep =
  | {
      kind: 'complete';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'solve-edge';
      title: string;
      body: string;
      edgeLabel: string;
      partnerColor: Color;
      demoMoves?: Move[];
    }
  | {
      kind: 'rotate-bottom';
      title: string;
      body: string;
      edgeLabel: string;
      partnerColor: Color;
      targetFace: Face;
      demoMoves?: Move[];
    }
  | {
      kind: 'side-connect';
      title: string;
      body: string;
      face: Face;
      demoMoves?: Move[];
    }
  | {
      kind: 'insert-double';
      title: string;
      body: string;
      face: Face;
      demoMoves?: Move[];
    };

export type DPhaseOption = {
  id: CrossEdgeId;
  demo: Move[];
  variant: 'rotate-bottom' | 'insert-double';
};

export type PermuteReadyCandidate = {
  id: CrossEdgeId;
  step: WhiteCrossLessonStep;
};

export interface SimulateWhiteCrossLessonResult {
  lessonStepsSimulated: number;
  crossComplete: boolean;
  lastStepKind?: WhiteCrossLessonStep['kind'];
  stuckNoDemo: boolean;
  finalStudentHold?: StudentHold;
  finalStorageCube: CubeState;
}
