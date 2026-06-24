import type { Color, Face, Move } from '../../cube/cubeState';
import {
  formatColorLabel,
  studentLessonHoldFaceCenters,
} from '../../cube/cubeState';
import {
  demoStepChips,
  moveClockwise,
  moveCounterclockwise,
  moveHalf,
  rotationAvoidBackStart,
  rotationFallback,
  rotationReturnToHold,
  rotationY,
  rotationY2,
  rotationYPrime,
} from '../../content/studentHold';
import { facePosition } from '../../content/notation';
import type { DemoStep } from './expandDemoSteps';
import { FACE_MAP, getFaceFromMove, getModifierFromMove } from './translateMove';
import type { StudentHold, YRotationStep } from './types';

function invertFaceMap(hold: StudentHold['y']): Record<Face, Face> {
  const map = FACE_MAP[hold];
  const inv = {} as Record<Face, Face>;
  for (const app of ['U', 'D', 'F', 'B', 'L', 'R'] as Face[]) {
    inv[map[app]] = app;
  }
  return inv;
}

/** Center color on each face label in the current y-hold (lesson frame). */
export function centersForHold(hold: StudentHold): Record<Face, Color> {
  const base = studentLessonHoldFaceCenters();
  const inv = invertFaceMap(hold.y);
  const out = {} as Record<Face, Color>;
  for (const face of ['U', 'D', 'F', 'B', 'L', 'R'] as Face[]) {
    out[face] = base[inv[face]];
  }
  return out;
}

export type RotationCopyPurpose = 'avoidBackStart' | 'returnToInitialHold';

/** Short label for move-sequence chips (includes rotation purpose when avoid-back). */
export function getDemoStepChipLabel(step: DemoStep): string {
  if (step.type === 'move') return step.move;
  if (step.purpose === 'avoidBackStart') return demoStepChips.avoidBackStart;
  if (step.purpose === 'returnToInitialHold') return demoStepChips.avoidBackReturn;
  return step.rotation;
}

export function getRotationText(
  rotation: YRotationStep,
  purpose?: RotationCopyPurpose,
): string {
  if (purpose === 'avoidBackStart') {
    return rotationAvoidBackStart();
  }
  if (purpose === 'returnToInitialHold') {
    const blue = formatColorLabel(studentLessonHoldFaceCenters().F);
    return rotationReturnToHold(blue);
  }

  switch (rotation) {
    case 'y2':
      return rotationY2();
    case 'y':
      return rotationY();
    case "y'":
      return rotationYPrime();
    default:
      return rotationFallback(rotation);
  }
}

export function getMoveText(move: Move, hold: StudentHold): string {
  const face = getFaceFromMove(move);
  const modifier = getModifierFromMove(move);
  const color = formatColorLabel(centersForHold(hold)[face]);
  const position = facePosition(face);
  if (modifier === '2') {
    return moveHalf(color, position, face);
  }
  if (modifier === "'") {
    return moveCounterclockwise(color, position, face);
  }
  return moveClockwise(color, position, face);
}
