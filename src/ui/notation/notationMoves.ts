import type { Face, Move } from '../../cube/cubeState';
import {
  facePosition,
  faceTurnDescription as contentFaceTurnDescription,
  notationFaceNames,
  rotationDescription as contentRotationDescription,
  turnDirectionLabel,
} from '../../content/notation';
import {
  getFaceFromMove,
  getModifierFromMove,
} from '../../learn/studentHold/translateMove';

type FaceMove = Extract<
  Move,
  | 'U'
  | "U'"
  | 'U2'
  | 'D'
  | "D'"
  | 'D2'
  | 'F'
  | "F'"
  | 'F2'
  | 'B'
  | "B'"
  | 'B2'
  | 'L'
  | "L'"
  | 'L2'
  | 'R'
  | "R'"
  | 'R2'
>;

type RotationMove = Extract<
  Move,
  'x' | "x'" | 'x2' | 'y' | "y'" | 'y2' | 'z' | "z'" | 'z2'
>;

export const FACE_NAME_LABELS: { letter: Face; label: string }[] = (
  ['F', 'R', 'U', 'L', 'B', 'D'] as Face[]
).map((letter) => ({
  letter,
  label: notationFaceNames.labels[letter],
}));

export const FACE_TURN_MOVES: FaceMove[] = [
  'U',
  "U'",
  'U2',
  'D',
  "D'",
  'D2',
  'F',
  "F'",
  'F2',
  'B',
  "B'",
  'B2',
  'L',
  "L'",
  'L2',
  'R',
  "R'",
  'R2',
];

export const CUBE_ROTATION_MOVES: RotationMove[] = [
  'x',
  "x'",
  'x2',
  'y',
  "y'",
  'y2',
  'z',
  "z'",
  'z2',
];

export function faceTurnDescription(move: FaceMove): string {
  const face = getFaceFromMove(move);
  const modifier = getModifierFromMove(move);
  const position = facePosition(face);
  const direction = turnDirectionLabel(modifier);
  return contentFaceTurnDescription(position, direction);
}

export function rotationDescription(move: RotationMove): string {
  const axis = move[0];
  const modifier = getModifierFromMove(move);
  const direction = turnDirectionLabel(modifier);
  return contentRotationDescription(direction, axis);
}

export function notationCardId(
  kind: 'face' | 'rotation',
  move: Move,
): string {
  return `${kind}:${move}`;
}

export const MAX_NOTATION_REPLAYS = 5;

/** Slower than lesson demos so notation moves are easier to follow. */
export const NOTATION_MOVE_ANIMATION_MS = 600;
