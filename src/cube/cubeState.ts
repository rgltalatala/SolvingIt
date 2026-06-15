import { wholeCubeMove } from './wholeCube';

export type Face = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';

export type Color = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange';

export type FaceState = [
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
  Color,
];

export type CubeState = Record<Face, FaceState>;

export type FaceMove =
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
  | 'R2';

export type SliceMove =
  | 'M'
  | "M'"
  | 'M2'
  | 'E'
  | "E'"
  | 'E2'
  | 'S'
  | "S'"
  | 'S2';

export type WideMove =
  | 'u'
  | "u'"
  | 'u2'
  | 'd'
  | "d'"
  | 'd2'
  | 'f'
  | "f'"
  | 'f2'
  | 'b'
  | "b'"
  | 'b2'
  | 'l'
  | "l'"
  | 'l2'
  | 'r'
  | "r'"
  | 'r2'
  | 'Rw'
  | "Rw'"
  | 'Rw2'
  | 'Lw'
  | "Lw'"
  | 'Lw2'
  | 'Uw'
  | "Uw'"
  | 'Uw2'
  | 'Dw'
  | "Dw'"
  | 'Dw2'
  | 'Fw'
  | "Fw'"
  | 'Fw2'
  | 'Bw'
  | "Bw'"
  | 'Bw2';

export type Rotation =
  | 'x'
  | "x'"
  | 'x2'
  | 'y'
  | "y'"
  | 'y2'
  | 'z'
  | "z'"
  | 'z2';

export type Move = FaceMove | SliceMove | WideMove | Rotation;

export const FACE_ORDER: Face[] = ['U', 'D', 'F', 'B', 'R', 'L'];

export const FACE_COLOR_CONVENTION: Record<Face, Color> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  R: 'red',
  L: 'orange',
};

export const COLORS: Color[] = [
  'white',
  'yellow',
  'green',
  'blue',
  'red',
  'orange',
];

export const COLOR_TO_FACE = Object.fromEntries(
  Object.entries(FACE_COLOR_CONVENTION).map(([face, color]) => [
    color,
    face as Face,
  ]),
) as Record<Color, Face>;

export function cubeStateFromScannedFaces(
  partial: Partial<Record<Face, FaceState>>,
): CubeState | null {
  if (!FACE_ORDER.every((face) => partial[face])) return null;
  return {
    U: partial.U as FaceState,
    D: partial.D as FaceState,
    F: partial.F as FaceState,
    B: partial.B as FaceState,
    R: partial.R as FaceState,
    L: partial.L as FaceState,
  };
}

export function lockFaceCenter(face: Face, faceState: FaceState): FaceState {
  const next = [...faceState] as FaceState;
  next[4] = FACE_COLOR_CONVENTION[face];
  return next;
}

export function createSolvedCubeState(): CubeState {
  return {
    U: Array(9).fill('white') as FaceState,
    D: Array(9).fill('yellow') as FaceState,
    F: Array(9).fill('green') as FaceState,
    B: Array(9).fill('blue') as FaceState,
    R: Array(9).fill('red') as FaceState,
    L: Array(9).fill('orange') as FaceState,
  };
}

export function cloneCubeState(state: CubeState): CubeState {
  return {
    U: [...state.U] as FaceState,
    D: [...state.D] as FaceState,
    F: [...state.F] as FaceState,
    B: [...state.B] as FaceState,
    L: [...state.L] as FaceState,
    R: [...state.R] as FaceState,
  };
}

function rotateFaceClockwise(face: FaceState): FaceState {
  return [
    face[6],
    face[3],
    face[0],
    face[7],
    face[4],
    face[1],
    face[8],
    face[5],
    face[2],
  ];
}

/**
 * Lesson student frame: whole-cube `x2` (yellow U, white D). Same rotation path as other WCA x/y/z moves.
 * Stored scan uses white U / yellow D.
 */
export function turnX2(state: CubeState): CubeState {
  return wholeCubeMove(state, 'x2');
}

/** Virtual cube with white on D and yellow on U for the white-cross lesson. */
export function cubeStateToStudentFrame(state: CubeState): CubeState {
  return turnX2(state);
}

/** Center sticker color on each face from the current cube state (for preview copy). */
export function faceCentersFromCubeState(
  state: CubeState,
): Record<Face, Color> {
  return {
    U: state.U[4],
    D: state.D[4],
    F: state.F[4],
    B: state.B[4],
    R: state.R[4],
    L: state.L[4],
  };
}

/** Center sticker color on each face in the white-cross lesson hold (matches the 3D diagram). */
export function studentLessonHoldFaceCenters(): Record<Face, Color> {
  return faceCentersFromCubeState(
    cubeStateToStudentFrame(createSolvedCubeState()),
  );
}

export function formatColorLabel(color: Color): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}

function turnU(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.U = rotateFaceClockwise(state.U);
  next.F[0] = state.R[0];
  next.F[1] = state.R[1];
  next.F[2] = state.R[2];
  next.R[0] = state.B[0];
  next.R[1] = state.B[1];
  next.R[2] = state.B[2];
  next.B[0] = state.L[0];
  next.B[1] = state.L[1];
  next.B[2] = state.L[2];
  next.L[0] = state.F[0];
  next.L[1] = state.F[1];
  next.L[2] = state.F[2];
  return next;
}

function turnD(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.D = rotateFaceClockwise(state.D);
  next.F[6] = state.L[6];
  next.F[7] = state.L[7];
  next.F[8] = state.L[8];
  next.L[6] = state.B[6];
  next.L[7] = state.B[7];
  next.L[8] = state.B[8];
  next.B[6] = state.R[6];
  next.B[7] = state.R[7];
  next.B[8] = state.R[8];
  next.R[6] = state.F[6];
  next.R[7] = state.F[7];
  next.R[8] = state.F[8];
  return next;
}

function turnF(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.F = rotateFaceClockwise(state.F);
  next.U[6] = state.L[8];
  next.U[7] = state.L[5];
  next.U[8] = state.L[2];
  next.R[0] = state.U[6];
  next.R[3] = state.U[7];
  next.R[6] = state.U[8];
  next.D[0] = state.R[6];
  next.D[1] = state.R[3];
  next.D[2] = state.R[0];
  next.L[2] = state.D[0];
  next.L[5] = state.D[1];
  next.L[8] = state.D[2];
  return next;
}

function turnB(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.B = rotateFaceClockwise(state.B);
  next.U[0] = state.R[2];
  next.U[1] = state.R[5];
  next.U[2] = state.R[8];
  next.L[0] = state.U[2];
  next.L[3] = state.U[1];
  next.L[6] = state.U[0];
  next.D[6] = state.L[0];
  next.D[7] = state.L[3];
  next.D[8] = state.L[6];
  next.R[2] = state.D[8];
  next.R[5] = state.D[7];
  next.R[8] = state.D[6];
  return next;
}

function turnL(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.L = rotateFaceClockwise(state.L);
  next.U[0] = state.B[8];
  next.U[3] = state.B[5];
  next.U[6] = state.B[2];
  next.F[0] = state.U[0];
  next.F[3] = state.U[3];
  next.F[6] = state.U[6];
  next.D[0] = state.F[0];
  next.D[3] = state.F[3];
  next.D[6] = state.F[6];
  next.B[2] = state.D[6];
  next.B[5] = state.D[3];
  next.B[8] = state.D[0];
  return next;
}

function turnR(state: CubeState): CubeState {
  const next = cloneCubeState(state);
  next.R = rotateFaceClockwise(state.R);
  next.U[2] = state.F[2];
  next.U[5] = state.F[5];
  next.U[8] = state.F[8];
  next.B[0] = state.U[8];
  next.B[3] = state.U[5];
  next.B[6] = state.U[2];
  next.D[2] = state.B[6];
  next.D[5] = state.B[3];
  next.D[8] = state.B[0];
  next.F[2] = state.D[2];
  next.F[5] = state.D[5];
  next.F[8] = state.D[8];
  return next;
}

function baseMove(move: Move): Face | null {
  const c = move[0];
  if (
    c === 'U' ||
    c === 'D' ||
    c === 'F' ||
    c === 'B' ||
    c === 'L' ||
    c === 'R'
  ) {
    return c;
  }
  return null;
}

function turnsForMove(move: Move): number {
  if (move.endsWith('2')) return 2;
  if (move.endsWith("'")) return 3;
  return 1;
}

/**
 * Merge consecutive same-face quarter turns (e.g. `U` `U` → `U2`, `U`×3 → `U′`). Other moves (slices, wide,
 * rotations) break a run and pass through unchanged.
 */
export function compressConsecutiveFaceQuarterTurns(moves: Move[]): Move[] {
  const out: Move[] = [];
  let runFace: Face | null = null;
  let runQuarters = 0;

  const flush = () => {
    if (runFace === null) return;
    const q = ((runQuarters % 4) + 4) % 4;
    if (q === 1) out.push(runFace as Move);
    else if (q === 2) out.push(`${runFace}2` as Move);
    else if (q === 3) out.push(`${runFace}'` as Move);
    runFace = null;
    runQuarters = 0;
  };

  for (const m of moves) {
    const b = baseMove(m);
    if (!b) {
      flush();
      out.push(m);
      continue;
    }
    if (b !== runFace) {
      flush();
      runFace = b;
      runQuarters = 0;
    }
    runQuarters += turnsForMove(m);
  }
  flush();
  return out;
}

/** Apply a sequence of face moves (student / storage frame). */
export function applyMoves(state: CubeState, moves: Move[]): CubeState {
  let next = cloneCubeState(state);
  for (const m of moves) {
    next = applyMove(next, m);
  }
  return next;
}

/**
 * Apply moves as if the cube is held in the **student / lesson** frame (yellow U, white D).
 * `storageState` uses scanner frame (white U, yellow D). Uses whole-cube `x2` into/out of lesson space.
 *
 * Orthogonal to StudentHold y-tracking in `learn/studentHold` (avoid-back re-holds).
 */
export function applyMovesInStudentHold(
  storageState: CubeState,
  moves: Move[],
): CubeState {
  const student = wholeCubeMove(storageState, 'x2');
  const after = applyMoves(student, moves);
  return wholeCubeMove(after, 'x2');
}

/** e.g. R → R2 for insert moves in lessons */
export function faceDoubleTurn(face: Face): Move {
  return `${face}2` as Move;
}

/** WCA whole-cube rotations (x/y/z); applied via cubejs in {@link wholeCubeMove}. */
export const WHOLE_CUBE_ROTATION_MOVES: ReadonlySet<Move> = new Set([
  'x',
  "x'",
  'x2',
  'y',
  "y'",
  'y2',
  'z',
  "z'",
  'z2',
]);

export function isWholeCubeRotation(move: Move): boolean {
  return WHOLE_CUBE_ROTATION_MOVES.has(move);
}

export function applyMove(state: CubeState, move: Move): CubeState {
  if (isWholeCubeRotation(move)) {
    return wholeCubeMove(state, move);
  }

  const base = baseMove(move);
  if (!base) {
    return cloneCubeState(state);
  }

  let next = cloneCubeState(state);
  const turns = turnsForMove(move);
  for (let i = 0; i < turns; i += 1) {
    switch (base) {
      case 'U':
        next = turnU(next);
        break;
      case 'D':
        next = turnD(next);
        break;
      case 'F':
        next = turnF(next);
        break;
      case 'B':
        next = turnB(next);
        break;
      case 'L':
        next = turnL(next);
        break;
      case 'R':
        next = turnR(next);
        break;
    }
  }

  return next;
}
