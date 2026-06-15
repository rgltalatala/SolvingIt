import type { Move } from '../../cube/cubeState';

/**
 * Cumulative y-axis rotation of the student's physical cube relative to the lesson
 * student frame (yellow U, white D). Not the same as storage↔lesson frame (`x2` via
 * `wholeCubeMove`) or camera drag.
 */
export type YHold = 'none' | 'y' | 'y2' | "y'";

export type StudentHold = {
  y: YHold;
};

export type AvoidBackPrefs = {
  avoidBackMoves: boolean;
};

export type YRotationStep = 'y' | 'y2' | "y'";

export type Instruction =
  | {
      type: 'rotation';
      rotation: YRotationStep;
      text: string;
    }
  | {
      type: 'move';
      move: Move;
      text: string;
    };

export type ExpandDemoResult = {
  instructions: Instruction[];
  finalHold: StudentHold;
};

export type BuildExecutionResult = {
  moves: Move[];
  finalHold: StudentHold;
};

export function noneHold(): StudentHold {
  return { y: 'none' };
}
