/** WCA-style 3×3 face-turn scramble (main thread, no worker). */

const SCRAMBLE_FACES = ['U', 'D', 'F', 'B', 'L', 'R'] as const;

type ScrambleFace = (typeof SCRAMBLE_FACES)[number];

const OPPOSITE_FACE: Record<ScrambleFace, ScrambleFace> = {
  U: 'D',
  D: 'U',
  F: 'B',
  B: 'F',
  L: 'R',
  R: 'L',
};

const TURN_SUFFIX = ['', '2', "'"] as const;

export const RANDOM_333_SCRAMBLE_LENGTH = 20;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Random 20-move scramble: no consecutive same face, no consecutive opposite faces. */
export function generateRandom333Scramble(
  moveCount = RANDOM_333_SCRAMBLE_LENGTH,
): string {
  const moves: string[] = [];
  let lastFace: ScrambleFace | null = null;

  while (moves.length < moveCount) {
    const face = pickRandom(SCRAMBLE_FACES);
    if (lastFace) {
      if (face === lastFace) continue;
      if (OPPOSITE_FACE[face] === lastFace) continue;
    }
    moves.push(`${face}${pickRandom(TURN_SUFFIX)}`);
    lastFace = face;
  }

  return moves.join(' ');
}
