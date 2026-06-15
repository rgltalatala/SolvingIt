import type { Move } from '../../cube/cubeState';
import { isWholeCubeRotation } from '../../cube/cubeState';
import { isBackFaceMove } from './backFace';
import { holdAfterRotation } from './composeY';
import { translateMove } from './translateMove';
import type { StudentHold, YRotationStep } from './types';
import { noneHold } from './types';

const REORIENT_Y2: YRotationStep = 'y2';

export type RotationPurpose = 'avoidBackStart' | 'returnToInitialHold';

export type DemoStep =
  | { type: 'rotation'; rotation: YRotationStep; purpose?: RotationPurpose }
  | { type: 'move'; move: Move };

export type ExpandDemoStepsResult = {
  steps: DemoStep[];
  finalHold: StudentHold;
};

function expandAvoidBackDemo(
  rawMoves: Move[],
  initialHold: StudentHold,
): ExpandDemoStepsResult {
  let hold = initialHold;
  const steps: DemoStep[] = [];
  const returnToInitial = initialHold.y === 'none';

  if (returnToInitial) {
    steps.push({
      type: 'rotation',
      rotation: REORIENT_Y2,
      purpose: 'avoidBackStart',
    });
    hold = holdAfterRotation(hold, REORIENT_Y2);
  }

  for (const raw of rawMoves) {
    steps.push({ type: 'move', move: translateMove(raw, hold) });
  }

  if (returnToInitial) {
    steps.push({
      type: 'rotation',
      rotation: REORIENT_Y2,
      purpose: 'returnToInitialHold',
    });
    hold = holdAfterRotation(hold, REORIENT_Y2);
  }

  return { steps, finalHold: initialHold };
}

/** Expand raw lesson demo moves without generating instruction copy text. */
export function expandDemoSteps(
  rawMoves: Move[],
  initialHold: StudentHold = noneHold(),
  avoidBackMoves = false,
): ExpandDemoStepsResult {
  if (!avoidBackMoves || !rawMoves.some(isBackFaceMove)) {
    const steps: DemoStep[] = rawMoves.map((move) =>
      isWholeCubeRotation(move)
        ? { type: 'rotation', rotation: move as YRotationStep }
        : { type: 'move', move },
    );
    return { steps, finalHold: initialHold };
  }

  return expandAvoidBackDemo(rawMoves, initialHold);
}

export function demoStepsToMoves(steps: DemoStep[]): Move[] {
  const moves: Move[] = [];
  for (const step of steps) {
    if (step.type === 'rotation') {
      moves.push(step.rotation);
    } else {
      moves.push(step.move);
    }
  }
  return moves;
}
