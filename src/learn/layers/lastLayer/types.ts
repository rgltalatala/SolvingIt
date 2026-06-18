import type { Move } from '../../../cube/cubeState';

export const LAST_LAYER_SUB_LESSONS = [
  'orient-edges',
  'permute-edges',
  'orient-corners',
  'permute-corners',
] as const;

export type LastLayerSubLesson = (typeof LAST_LAYER_SUB_LESSONS)[number];

export const LAST_LAYER_STEP_KINDS = [
  'complete',
  'prerequisite',
  'align-u',
  'orient-edges',
] as const;

export type LastLayerStepKind = (typeof LAST_LAYER_STEP_KINDS)[number];

export type OrientEdgesOllCase = 'dot' | 'l-shape' | 'bar';

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
      ollCase: 'l-shape' | 'bar';
    }
  | {
      kind: 'orient-edges';
      title: string;
      body: string;
      demoMoves: Move[];
      ollCase: OrientEdgesOllCase;
    };

export interface SimulateLastLayerLessonResult {
  lessonStepsSimulated: number;
  lastLayerComplete: boolean;
  lastStepKind?: LastLayerLessonStep['kind'];
  stuckNoDemo: boolean;
}
