import type { Color, Move } from '../../../../cube/cubeState';

export const MIDDLE_EDGE_SLOTS = ['FR', 'FL', 'BR', 'BL'] as const;

export type MiddleEdgeSlotId = (typeof MIDDLE_EDGE_SLOTS)[number];

export const MIDDLE_LAYER_EDGES_STEP_KINDS = [
  'complete',
  'cross-corners-prerequisite',
  'reorient-hold',
  'align-u',
  'solve-edge',
] as const;

export type MiddleLayerEdgesStepKind =
  (typeof MIDDLE_LAYER_EDGES_STEP_KINDS)[number];

export type MiddleLayerEdgesLessonStep =
  | {
      kind: 'complete';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'cross-corners-prerequisite';
      title: string;
      body: string;
      demoMoves?: Move[];
    }
  | {
      kind: 'reorient-hold';
      title: string;
      body: string;
      demoMoves: Move[];
      targetHoldIndex?: number;
      returnToInitialHold?: boolean;
    }
  | {
      kind: 'align-u';
      title: string;
      body: string;
      demoMoves: Move[];
      edgeColors: [Color, Color];
    }
  | {
      kind: 'solve-edge';
      title: string;
      body: string;
      demoMoves: Move[];
      edgeColors: [Color, Color];
      action: 'insert' | 'extract';
      slot: 'FL' | 'FR';
    };

export interface MiddleLayerEdgeLessonStepOptions {
  currentHoldIndex?: number;
  solvedMiddleEdgeSlots?: readonly MiddleEdgeSlotId[];
}

export interface SimulateMiddleLayerEdgesLessonResult {
  lessonStepsSimulated: number;
  middleLayerComplete: boolean;
  lastStepKind?: MiddleLayerEdgesLessonStep['kind'];
  stuckNoDemo: boolean;
  finalHoldIndex?: number;
}
