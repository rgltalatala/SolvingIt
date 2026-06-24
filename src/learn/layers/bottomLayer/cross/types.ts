import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import type { Face } from '../../../../cube/cubeState';
import type { StudentHold } from '../../../studentHold';

export type CrossEdgeId = 'DF' | 'DR' | 'DB' | 'DL';

/** All lesson step kinds in planner priority order (first = highest priority when planning). */
export const WHITE_CROSS_STEP_KINDS = [
  'complete',
  'intro',
  'solve-edge',
  'rotate-bottom',
  'align-to-center',
  'insert-double',
] as const;

export type WhiteCrossStepKind = (typeof WHITE_CROSS_STEP_KINDS)[number];

export type WhiteCrossLessonStep =
  | {
      kind: 'complete';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'intro';
      title: string;
      body: string;
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
      kind: 'align-to-center';
      title: string;
      body: string;
      edgeLabel: string;
      partnerColor: Color;
      face: Face;
      demoMoves?: Move[];
    }
  | {
      kind: 'insert-double';
      title: string;
      body: string;
      edgeLabel: string;
      partnerColor: Color;
      face: Face;
      demoMoves?: Move[];
    };

export interface WhiteCrossLessonStepOptions {
  /** Strategy intro shown once per lesson session before the first edge solve. */
  hasSeenStrategyIntro?: boolean;
}

export interface SimulateWhiteCrossLessonResult {
  lessonStepsSimulated: number;
  crossComplete: boolean;
  lastStepKind?: WhiteCrossLessonStep['kind'];
  stuckNoDemo: boolean;
  finalStudentHold?: StudentHold;
  finalStorageCube: CubeState;
}
