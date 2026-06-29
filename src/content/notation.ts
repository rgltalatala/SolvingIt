import type { Face } from '../cube/cubeState';

export const notationGuide = {
  replayAnimations: 'Replay animations (up to 5 while hovered)',
} as const;

export const notationCubePieces = {
  heading: 'Cube pieces',
  intro:
    "A 3x3 cube has three kinds of pieces. Centers stay fixed on each face. Edges sit between two faces. Corners sit where three faces meet. Hover a card (tap on mobile) to see that piece type on the cube.",
  labels: {
    center: 'Center',
    edge: 'Edge',
    corner: 'Corner',
  },
  descriptions: {
    center: 'One sticker per face. Centers never move.',
    edge: 'Two stickers. Twelve edge pieces on the cube.',
    corner: 'Three stickers. Eight corner pieces on the cube.',
  },
} as const;

export const notationFaceNames = {
  heading: 'Face names',
  intro:
    "Each letter names a side of the cube based on how you're holding it, not a sticker color. Green might be on F today and on L after you rotate the whole cube. Hover a face (tap on mobile) to see where it is on the cube.",
  labels: {
    F: 'Front',
    R: 'Right',
    U: 'Up',
    L: 'Left',
    B: 'Back',
    D: 'Down',
  } as Record<Face, string>,
} as const;

export const notationFaceTurns = {
  heading: 'Face turns',
  intro:
    "Hover a move (tap on mobile) to see it on the cube. The turn stays visible while you're on the card. Move away and the cube returns to how it was.",
} as const;

export const notationCubeRotations = {
  heading: 'Cube rotations',
  intro:
    "These rotate the whole cube in your hands. After a rotation, F still means front and U still means up, but the colors on those faces change. For example, with green on F and white on U, a y turn puts red on F and green on L. The rotated view stays while you hover; leave the card to reset.",
} as const;

const FACE_POSITION: Record<Face, string> = {
  U: 'top',
  D: 'bottom',
  F: 'front',
  B: 'back',
  L: 'left',
  R: 'right',
};

export function facePosition(face: Face): string {
  return FACE_POSITION[face];
}

export function turnDirectionLabel(modifier: '' | "'" | '2'): string {
  if (modifier === '2') return '180°';
  if (modifier === "'") return 'counterclockwise';
  return 'clockwise';
}

export function faceTurnDescription(position: string, direction: string): string {
  return `Turn the ${position} layer ${direction}`;
}

export function rotationDescription(direction: string, axis: string): string {
  return `Rotate the whole cube ${direction} around the ${axis}-axis`;
}
