import { describe, expect, it } from 'vitest';
import { getCubieFaceColors } from '../cube3d/cubeGeometry';
import {
  applyMove,
  applyMoves,
  applyMovesInStudentHold,
  compressConsecutiveFaceQuarterTurns,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  faceDoubleTurn,
  faceCentersFromCubeState,
  studentLessonHoldFaceCenters,
  turnX2,
} from './cubeState';

describe('compressConsecutiveFaceQuarterTurns', () => {
  it('merges U U into U2', () => {
    expect(compressConsecutiveFaceQuarterTurns(['U', 'U'])).toEqual(['U2']);
  });
  it('merges three U into U′', () => {
    expect(compressConsecutiveFaceQuarterTurns(['U', 'U', 'U'])).toEqual([
      "U'",
    ]);
  });
  it('merges U U′ to empty', () => {
    expect(compressConsecutiveFaceQuarterTurns(['U', "U'"])).toEqual([]);
  });
  it('breaks runs on different faces', () => {
    expect(compressConsecutiveFaceQuarterTurns(['U', 'U', 'R', 'R'])).toEqual([
      'U2',
      'R2',
    ]);
  });
});

describe('whole-cube rotations / student frame', () => {
  it('applyMoves composes like repeated applyMove', () => {
    const s0 = createSolvedCubeState();
    const a = applyMove(applyMove(s0, 'R'), 'U');
    const b = applyMoves(s0, ['R', 'U']);
    expect(a).toEqual(b);
  });

  it('faceDoubleTurn produces a double face move', () => {
    expect(faceDoubleTurn('R')).toBe('R2');
  });

  it('applyMove x2 matches turnX2 and cubeStateToStudentFrame via wholeCubeMove', () => {
    const s0 = createSolvedCubeState();
    const a = turnX2(s0);
    const b = applyMove(s0, 'x2');
    const c = cubeStateToStudentFrame(s0);
    expect(a).toEqual(b);
    expect(a).toEqual(c);
  });

  it('x2 is handled as a whole-cube rotation like y2', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(applyMove(student, 'x2')).not.toEqual(student);
    expect(applyMove(applyMove(student, 'x2'), 'x2')).toEqual(student);
  });

  it('student lesson hold has blue on F (front) for diagram / copy', () => {
    const hold = studentLessonHoldFaceCenters();
    expect(hold.U).toBe('yellow');
    expect(hold.D).toBe('white');
    expect(hold.F).toBe('blue');
    expect(hold.B).toBe('green');
  });

  it('faceCentersFromCubeState reflects stickers after y2 on student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const after = applyMove(student, 'y2');
    const centers = faceCentersFromCubeState(after);
    expect(centers.F).toBe('green');
    expect(centers.B).toBe('blue');
  });

  // Physical Rx(pi): URF (1,1,1) → (1,-1,-1); stickers should become D=white, R=red, B=green on that cubie
  it('turnX2 moves URF cubie to DRB with consistent sticker mapping', () => {
    const s0 = createSolvedCubeState();
    const t = turnX2(s0);
    const atDRB = getCubieFaceColors(t, [1, -1, -1]);
    expect(atDRB).toEqual({ D: 'white', R: 'red', B: 'green' });
  });

  // UF edge (0,1,1) → (0,-1,-1); U=white, F=green → D=white, B=green
  it('turnX2 maps UF edge cubie to DB', () => {
    const s0 = createSolvedCubeState();
    const t = turnX2(s0);
    const atDB = getCubieFaceColors(t, [0, -1, -1]);
    expect(atDB).toEqual({ D: 'white', B: 'green' });
  });

  it('applyMovesInStudentHold applies R in student space (changes stored cube)', () => {
    const storage = createSolvedCubeState();
    const beforeStudent = cubeStateToStudentFrame(storage);
    const next = applyMovesInStudentHold(storage, ['R']);
    expect(next).not.toEqual(storage);
    const afterStudent = cubeStateToStudentFrame(next);
    expect(afterStudent).not.toEqual(beforeStudent);
  });

  it('applyMove y2 swaps F and B centers in student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(student.F[4]).toBe('blue');
    const after = applyMove(student, 'y2');
    expect(after.F[4]).toBe('green');
    expect(after.B[4]).toBe('blue');
  });

  it('applyMove y and y′ change state via wholeCubeMove', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(applyMove(student, 'y')).not.toEqual(student);
    expect(applyMove(student, "y'")).not.toEqual(student);
    expect(applyMove(applyMove(student, 'y'), "y'")).toEqual(student);
  });
});
