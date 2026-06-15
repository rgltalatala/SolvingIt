import type { Move } from '../../cube/cubeState';
import { getMoveText, getRotationText } from './copy';
import { expandDemoSteps, type RotationPurpose } from './expandDemoSteps';
import { holdAfterRotation } from './composeY';
import type {
  AvoidBackPrefs,
  ExpandDemoResult,
  Instruction,
  StudentHold,
} from './types';
import { noneHold } from './types';

export function expandDemoToInstructions(
  rawMoves: Move[],
  initialHold: StudentHold = noneHold(),
  prefs: AvoidBackPrefs = { avoidBackMoves: false },
): ExpandDemoResult {
  const { steps, finalHold } = expandDemoSteps(
    rawMoves,
    initialHold,
    prefs.avoidBackMoves,
  );
  let hold = initialHold;
  const instructions: Instruction[] = [];

  for (const step of steps) {
    if (step.type === 'rotation') {
      instructions.push({
        type: 'rotation',
        rotation: step.rotation,
        text: getRotationText(
          step.rotation,
          step.purpose as RotationPurpose | undefined,
        ),
      });
      hold = holdAfterRotation(hold, step.rotation);
    } else {
      instructions.push({
        type: 'move',
        move: step.move,
        text: getMoveText(step.move, hold),
      });
    }
  }

  return { instructions, finalHold };
}
