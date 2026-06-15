import type { StudentHold, YHold, YRotationStep } from './types';

const Y_INDEX: Record<YHold, number> = {
  none: 0,
  y: 1,
  y2: 2,
  "y'": 3,
};

const INDEX_Y: YHold[] = ['none', 'y', 'y2', "y'"];

/** Compose y-axis holds (mod 4). */
export function composeY(current: YHold, additional: YRotationStep): YHold {
  return INDEX_Y[(Y_INDEX[current] + Y_INDEX[additional]) % 4]!;
}

export function holdAfterRotation(
  hold: StudentHold,
  rotation: YRotationStep,
): StudentHold {
  return { y: composeY(hold.y, rotation) };
}
