import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Face,
  type Move,
} from '../../../../cube/cubeState';
import {
  findCornerWithColors,
  faceForWhiteOnCorner,
} from '../shared/pieceQueries';
import {
  activeCornerId,
  alignMovesToUrf,
  CORNER_ORDER,
  cornerSlotSolved,
  cornerPreservedAtLessonHold,
  cornerTargetSolvedAtHold,
  countSolvedCornerSlots,
  expectedCornerColors,
  FRD_URF_WHITE_ON_F,
  FRD_URF_WHITE_ON_R,
  FRD_URF_WHITE_ON_U,
  FRD_WHITE_ON_F,
  FRD_WHITE_ON_R,
  getWhiteCornerLessonStep,
  getWhiteCornerLessonStepAsync,
  holdIndexToY,
  insertMovesFromUrf,
  isCornerPieceInSlot,
  isLessonStateValid,
  isVerifiedCornerSlotDemo,
  isWhiteCornersComplete,
  preservesLessonStateAfterDemo,
  recognizeCornerCase,
  recognizeCornerCaseInFrdView,
  relativeY,
  resolveLessonStorageDemo,
  simulateWhiteCornersLessonOnStorageCube,
  targetHoldIndex,
  type CornerSlotId,
  type ULayerCornerId,
  type WrongDLayerSlotId,
  WHITE_CORNERS_STEP_KINDS,
} from './index';
import { CORNER_SLOT_DEF } from './cornerSlotModel';
import { setupMovesForWrongDSlotStorage } from './wrongDLayerSteps';
import { isWhiteCrossComplete } from '../cross/crossSlotModel';

const AFTER_STRATEGY_INTRO = { hasSeenStrategyIntro: true } as const;

function cornerLessonStep(
  student: CubeState,
  options?: Parameters<typeof getWhiteCornerLessonStep>[1],
) {
  return getWhiteCornerLessonStep(student, {
    ...AFTER_STRATEGY_INTRO,
    ...options,
  });
}

/** Storage scramble: cross intact on student frame, corners unsolved (FRD still solved). */
function crossIntactCornersScrambledStorage(): CubeState {
  return applyMoves(createSolvedCubeState(), ['F', 'D', "F'"]);
}

function crossIntactCornersScrambledStudent(): CubeState {
  return cubeStateToStudentFrame(crossIntactCornersScrambledStorage());
}

function studentWithCornerSlotUnsolved(
  student: CubeState,
  id: (typeof CORNER_ORDER)[number],
): CubeState {
  const next = cloneCubeState(student);
  next.D[CORNER_SLOT_DEF[id].dIndex] = 'yellow';
  return next;
}

function solvedStudent(): CubeState {
  return cubeStateToStudentFrame(createSolvedCubeState());
}

/** FRD corner twisted in slot with white on F (cross intact). */
function frdWhiteOnFStudent(): CubeState {
  return applyMoves(solvedStudent(), FRD_WHITE_ON_R);
}

/** FRD corner twisted in slot with white on R (cross intact). */
function frdWhiteOnRStudent(): CubeState {
  return applyMoves(solvedStudent(), FRD_WHITE_ON_F);
}

function invertMoves(moves: Move[]): Move[] {
  const inverted: Move[] = [];
  for (let i = moves.length - 1; i >= 0; i -= 1) {
    const move = moves[i]!;
    const face = move[0];
    if (move.endsWith('2')) inverted.push(move);
    else if (move.endsWith("'")) inverted.push(face as Move);
    else inverted.push(`${face}'` as Move);
  }
  return inverted;
}

/** Apply lesson hold rotation(s) baked into the virtual cube on reorient. */
function studentAtLessonHold(student: CubeState, holdIndex: number): CubeState {
  if (holdIndex === 0) return student;
  return applyMoves(student, holdIndexToY(holdIndex as 0 | 1 | 2 | 3));
}

/** Student-facing demos may need storage-frame y setup before apply / verify. */
function storageDemoForStep(
  student: CubeState,
  cornerId: CornerSlotId,
  studentDemo: Move[],
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] {
  return (
    resolveLessonStorageDemo(
      student,
      cornerId,
      holdIndex,
      studentDemo,
      solvedCornerIds,
    ) ?? studentDemo
  );
}

/** FRD piece on U layer at uPosition with white on given face (after align to URF). */
function frdOnULayerStudent(
  uPosition: ULayerCornerId,
  whiteOnFace: Face,
): CubeState {
  const align = alignMovesToUrf(uPosition);
  const insert = insertMovesFromUrf(whiteOnFace);
  if (!insert) throw new Error(`unsupported white face ${whiteOnFace}`);
  return applyMoves(solvedStudent(), invertMoves([...align, ...insert]));
}

/** Build unsolved corner at the given hold using inverse FRD-view demo. */
function cornerAtHoldStudent(cornerId: CornerSlotId, demo: Move[]): CubeState {
  const holdY = holdIndexToY(targetHoldIndex(cornerId));
  return applyMoves(applyMoves(solvedStudent(), holdY), invertMoves(demo));
}

/** U-layer case for any corner at its lesson hold. */
function cornerOnULayerAtHold(
  cornerId: CornerSlotId,
  uPosition: ULayerCornerId,
  whiteOnFace: Face,
): CubeState {
  const align = alignMovesToUrf(uPosition);
  const insert = insertMovesFromUrf(whiteOnFace);
  if (!insert) throw new Error(`unsupported white face ${whiteOnFace}`);
  return cornerAtHoldStudent(cornerId, [...align, ...insert]);
}

/** Wrong D-layer case for FRD at blue-front hold. */
function frdInWrongDSlotStudent(
  dSlot: WrongDLayerSlotId,
  whiteOnFace: Face,
): CubeState {
  const setup = setupMovesForWrongDSlotStorage(dSlot);
  const insert = insertMovesFromUrf(whiteOnFace);
  if (!insert) throw new Error(`unsupported white face ${whiteOnFace}`);
  return applyMoves(solvedStudent(), invertMoves([...setup, ...insert]));
}

/** Wrong D-layer case for any corner at its lesson hold. */
function cornerInWrongDSlotAtHold(
  cornerId: CornerSlotId,
  dSlot: WrongDLayerSlotId,
  whiteOnFace: Face,
): CubeState {
  const setup = setupMovesForWrongDSlotStorage(dSlot);
  const insert = insertMovesFromUrf(whiteOnFace);
  if (!insert) throw new Error(`unsupported white face ${whiteOnFace}`);
  return cornerAtHoldStudent(cornerId, [...setup, ...insert]);
}

const WRONG_D_LAYER_CASES: Array<{
  dSlot: WrongDLayerSlotId;
  whiteOnFace: Face;
}> = [
  { dSlot: 'BDR', whiteOnFace: 'U' },
  { dSlot: 'BDR', whiteOnFace: 'R' },
  { dSlot: 'BDR', whiteOnFace: 'F' },
  { dSlot: 'BLD', whiteOnFace: 'U' },
  { dSlot: 'BLD', whiteOnFace: 'R' },
  { dSlot: 'BLD', whiteOnFace: 'F' },
  { dSlot: 'FDL', whiteOnFace: 'U' },
  { dSlot: 'FDL', whiteOnFace: 'R' },
  { dSlot: 'FDL', whiteOnFace: 'F' },
];

const U_LAYER_CASES: Array<{ uPosition: ULayerCornerId; whiteOnFace: Face }> = [
  { uPosition: 'URF', whiteOnFace: 'U' },
  { uPosition: 'URF', whiteOnFace: 'R' },
  { uPosition: 'URF', whiteOnFace: 'F' },
  { uPosition: 'UBR', whiteOnFace: 'U' },
  { uPosition: 'UBR', whiteOnFace: 'R' },
  { uPosition: 'UBR', whiteOnFace: 'F' },
  { uPosition: 'ULB', whiteOnFace: 'U' },
  { uPosition: 'ULB', whiteOnFace: 'R' },
  { uPosition: 'ULB', whiteOnFace: 'F' },
  { uPosition: 'UFL', whiteOnFace: 'U' },
  { uPosition: 'UFL', whiteOnFace: 'R' },
  { uPosition: 'UFL', whiteOnFace: 'F' },
];

describe('white corners step kinds', () => {
  it('lists step kinds including reorient-hold', () => {
    expect(WHITE_CORNERS_STEP_KINDS).toEqual([
      'complete',
      'cross-prerequisite',
      'intro',
      'reorient-hold',
      'solve-corner',
    ]);
  });
});

describe('corner hold helpers', () => {
  it('maps relative y between hold indices', () => {
    expect(relativeY(0, 1)).toEqual(['y']);
    expect(relativeY(0, 2)).toEqual(['y2']);
    expect(relativeY(0, 3)).toEqual(["y'"]);
    expect(relativeY(1, 2)).toEqual(['y']);
    expect(relativeY(0, 0)).toEqual([]);
  });

  it('maps corners to target hold indices', () => {
    expect(targetHoldIndex('FRD')).toBe(0);
    expect(targetHoldIndex('BDR')).toBe(1);
    expect(targetHoldIndex('BLD')).toBe(2);
    expect(targetHoldIndex('FDL')).toBe(3);
  });
});

describe('corner slot model', () => {
  it('marks all four slots solved on solved student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    for (const id of CORNER_ORDER) {
      expect(cornerSlotSolved(student, id)).toBe(true);
    }
    expect(countSolvedCornerSlots(student)).toBe(4);
    expect(isWhiteCornersComplete(student)).toBe(true);
    expect(activeCornerId(student)).toBeNull();
  });

  it('checks per-slot stickers on solved cube', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    for (const id of CORNER_ORDER) {
      const slot = CORNER_SLOT_DEF[id];
      const [faceA, faceB] = slot.sideFaces;
      const [indexA, indexB] = slot.sideIndices;
      expect(student.D[slot.dIndex]).toBe('white');
      expect(student[faceA][indexA]).toBe(student[faceA][4]);
      expect(student[faceB][indexB]).toBe(student[faceB][4]);
    }
  });

  it('finds corner cubies by expected slot colors', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    for (const id of CORNER_ORDER) {
      const [white, colorA, colorB] = expectedCornerColors(student, id);
      const position = findCornerWithColors(student, white, colorA, colorB);
      expect(position).toEqual(CORNER_SLOT_DEF[id].pos);
    }
  });

  it('expectedCornerColors for BDR at hold 1 uses green and red, not rotated centers', () => {
    const student = studentAtLessonHold(
      crossIntactCornersScrambledStudent(),
      1,
    );
    const [, colorA, colorB] = expectedCornerColors(student, 'BDR', 1);
    expect(colorA).toBe('green');
    expect(colorB).toBe('red');
    expect(recognizeCornerCaseInFrdView(student, 'BDR', 1).kind).not.toBe(
      'not-in-slot',
    );
  });
});

describe('sequential corner gating', () => {
  it('activeCornerId returns first unsolved in CORNER_ORDER when cross is intact', () => {
    const student = crossIntactCornersScrambledStudent();
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(isWhiteCornersComplete(student)).toBe(false);
    expect(cornerSlotSolved(student, 'FRD')).toBe(true);
    expect(activeCornerId(student)).toBe('BDR');
  });

  it('activeCornerId skips solved corners and targets the next unsolved slot', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const onlyBdrWrong = studentWithCornerSlotUnsolved(student, 'BDR');
    expect(activeCornerId(onlyBdrWrong)).toBe('BDR');
  });

  it('activeCornerId skips corners already solved on the cube when session tracks progress', () => {
    const student = frdOnULayerStudent('URF', 'R');
    const afterFrdInsert = applyMoves(student, ['R', 'U', "R'"]);
    expect(cornerSlotSolved(afterFrdInsert, 'BDR')).toBe(true);
    expect(activeCornerId(afterFrdInsert, 1, ['FRD'])).toBeNull();
    expect(isWhiteCornersComplete(afterFrdInsert, 1, ['FRD'])).toBe(true);
    expect(countSolvedCornerSlots(afterFrdInsert, 1, ['FRD'])).toBe(4);
  });
});

describe('corner case recognition', () => {
  it('recognizes solved FRD', () => {
    expect(recognizeCornerCase(solvedStudent(), 'FRD')).toEqual({
      kind: 'solved',
    });
  });

  it('recognizes FRD twisted in slot with white on F', () => {
    const student = frdWhiteOnFStudent();
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(isCornerPieceInSlot(student, 'FRD')).toBe(true);
    expect(faceForWhiteOnCorner(CORNER_SLOT_DEF.FRD.pos, student)).toBe('F');
    expect(recognizeCornerCase(student, 'FRD')).toEqual({
      kind: 'in-slot-twisted',
      whiteOnFace: 'F',
    });
  });

  it('recognizes FRD twisted in slot with white on R', () => {
    const student = frdWhiteOnRStudent();
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(recognizeCornerCase(student, 'FRD')).toEqual({
      kind: 'in-slot-twisted',
      whiteOnFace: 'R',
    });
  });

  it('recognizes BDR piece on U layer on cross-intact scramble', () => {
    const student = crossIntactCornersScrambledStudent();
    expect(isCornerPieceInSlot(student, 'BDR')).toBe(false);
    expect(recognizeCornerCase(student, 'BDR')).toEqual({
      kind: 'in-u-layer',
      uPosition: 'URF',
    });
  });

  it.each(U_LAYER_CASES)(
    'recognizes FRD in-u-layer at $uPosition',
    ({ uPosition, whiteOnFace }) => {
      const student = frdOnULayerStudent(uPosition, whiteOnFace);
      expect(isWhiteCrossComplete(student)).toBe(true);
      expect(recognizeCornerCase(student, 'FRD')).toEqual({
        kind: 'in-u-layer',
        uPosition,
      });
    },
  );

  it.each(WRONG_D_LAYER_CASES)(
    'recognizes FRD in-wrong-d-slot at $dSlot',
    ({ dSlot, whiteOnFace }) => {
      const student = frdInWrongDSlotStudent(dSlot, whiteOnFace);
      expect(isWhiteCrossComplete(student)).toBe(true);
      expect(recognizeCornerCase(student, 'FRD')).toEqual({
        kind: 'in-wrong-d-slot',
        dSlot,
      });
    },
  );
});

describe('white corners planner', () => {
  it('reports complete on solved bottom layer', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(getWhiteCornerLessonStep(student).kind).toBe('complete');
  });

  it('requires cross before corner work', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['F'],
    );
    expect(isWhiteCrossComplete(student)).toBe(false);
    expect(getWhiteCornerLessonStep(student).kind).toBe('cross-prerequisite');
  });

  it('returns strategy intro before first corner solve', () => {
    const student = crossIntactCornersScrambledStudent();
    const step = getWhiteCornerLessonStep(student);
    expect(step.kind).toBe('intro');
    if (step.kind === 'intro') {
      expect(step.body).toContain('FRD');
      expect(step.body).toContain('URF');
    }
  });

  it('returns reorient-hold before BDR when hold is blue-front', () => {
    const student = crossIntactCornersScrambledStudent();
    const step = cornerLessonStep(student);
    expect(step.kind).toBe('reorient-hold');
    if (step.kind === 'reorient-hold') {
      expect(step.targetCornerId).toBe('BDR');
      expect(step.demoMoves).toEqual(['y']);
    }
  });

  it('returns verified solve-corner demo for BDR after reorient hold', () => {
    const student = studentAtLessonHold(
      crossIntactCornersScrambledStudent(),
      1,
    );
    expect(cornerPreservedAtLessonHold(student, 'FRD', 1)).toBe(true);
    const step = cornerLessonStep(student, {
      currentHoldIndex: 1,
      solvedCornerIds: ['FRD'],
    });
    expect(step.kind).toBe('solve-corner');
    if (step.kind === 'solve-corner' && step.demoMoves) {
      expect(step.cornerId).toBe('BDR');
      expect(
        isVerifiedCornerSlotDemo(student, 'BDR', step.demoMoves, 1, ['FRD']),
      ).toBe(true);
    }
  });

  it('returns BDR demo after FRD solve and reorient on cross-intact scramble', () => {
    let student = crossIntactCornersScrambledStudent();
    let hold: 0 | 1 = 0;
    let solved: CornerSlotId[] = [];

    let step = cornerLessonStep(student, {
      currentHoldIndex: hold,
      solvedCornerIds: solved,
    });

    if (step.kind === 'solve-corner' && step.cornerId === 'FRD') {
      const frdApply =
        resolveLessonStorageDemo(
          student,
          'FRD',
          hold,
          step.demoMoves!,
          solved,
        ) ?? step.demoMoves!;
      student = applyMoves(student, frdApply);
      solved = ['FRD'];
      step = cornerLessonStep(student, {
        currentHoldIndex: hold,
        solvedCornerIds: solved,
      });
    }

    expect(step.kind).toBe('reorient-hold');
    if (step.kind !== 'reorient-hold' || !step.demoMoves?.length) {
      throw new Error('expected reorient demo');
    }
    student = applyMoves(student, step.demoMoves);
    hold = 1;

    const bdrStep = cornerLessonStep(student, {
      currentHoldIndex: hold,
      solvedCornerIds: solved.includes('FRD') ? solved : ['FRD'],
    });
    expect(bdrStep.kind).toBe('solve-corner');
    if (bdrStep.kind === 'solve-corner') {
      expect(bdrStep.cornerId).toBe('BDR');
      expect(bdrStep.demoMoves?.length).toBeGreaterThan(0);
    }
  });

  it('returns reorient y2 when FRD and BDR are solved and BLD is active', () => {
    const frdBdrSolved = studentWithCornerSlotUnsolved(
      studentWithCornerSlotUnsolved(solvedStudent(), 'BLD'),
      'FDL',
    );
    expect(cornerSlotSolved(frdBdrSolved, 'FRD')).toBe(true);
    expect(cornerSlotSolved(frdBdrSolved, 'BDR')).toBe(true);
    expect(activeCornerId(frdBdrSolved)).toBe('BLD');

    const step = cornerLessonStep(frdBdrSolved);
    expect(step.kind).toBe('reorient-hold');
    if (step.kind === 'reorient-hold') {
      expect(step.targetCornerId).toBe('BLD');
      expect(step.demoMoves).toEqual(['y2']);
    }
  });

  it.each([
    {
      cornerId: 'BDR' as const,
      uPosition: 'UBR' as const,
      whiteOnFace: 'F' as const,
    },
    {
      cornerId: 'FDL' as const,
      uPosition: 'UFL' as const,
      whiteOnFace: 'R' as const,
    },
  ])(
    'returns verified $cornerId U-layer demo at lesson hold',
    ({ cornerId, uPosition, whiteOnFace }) => {
      const student = cornerOnULayerAtHold(cornerId, uPosition, whiteOnFace);
      const hold = targetHoldIndex(cornerId);
      const step = cornerLessonStep(student, {
        currentHoldIndex: hold,
      });
      expect(step.kind).toBe('solve-corner');
      if (step.kind !== 'solve-corner' || !step.demoMoves) return;
      expect(step.cornerId).toBe(cornerId);
      expect(
        isVerifiedCornerSlotDemo(student, cornerId, step.demoMoves, hold),
      ).toBe(true);
      expect(
        cornerTargetSolvedAtHold(
          applyMoves(student, step.demoMoves),
          cornerId,
          hold,
        ),
      ).toBe(true);
    },
  );

  it('returns verified BLD wrong-D demo at green hold', () => {
    const student = cornerInWrongDSlotAtHold('BLD', 'BDR', 'F');
    const step = cornerLessonStep(student, { currentHoldIndex: 2 });
    expect(step.kind).toBe('solve-corner');
    if (step.kind !== 'solve-corner' || !step.demoMoves) return;
    expect(step.cornerId).toBe('BLD');
    expect(isVerifiedCornerSlotDemo(student, 'BLD', step.demoMoves, 2)).toBe(
      true,
    );
  });

  it('returns return-to-blue reorient when all corners solved at orange hold', () => {
    const student = applyMoves(solvedStudent(), holdIndexToY(3));
    const step = cornerLessonStep(student, { currentHoldIndex: 3 });
    expect(step.kind).toBe('reorient-hold');
    if (step.kind === 'reorient-hold') {
      expect(step.returnToInitialHold).toBe(true);
      expect(step.demoMoves).toEqual(['y']);
    }
  });

  it('returns FRD demo when white is on F in the FRD slot', () => {
    const step = cornerLessonStep(frdWhiteOnFStudent());
    expect(step.kind).toBe('solve-corner');
    if (step.kind === 'solve-corner') {
      expect(step.cornerId).toBe('FRD');
      expect(step.demoMoves).toEqual(FRD_WHITE_ON_F);
    }
  });

  it('returns FRD demo when white is on R in the FRD slot', () => {
    const step = cornerLessonStep(frdWhiteOnRStudent());
    expect(step.kind).toBe('solve-corner');
    if (step.kind === 'solve-corner') {
      expect(step.cornerId).toBe('FRD');
      expect(step.demoMoves).toEqual(FRD_WHITE_ON_R);
    }
  });

  it.each(U_LAYER_CASES)(
    'returns FRD U-layer demo for $uPosition with white on $whiteOnFace',
    ({ uPosition, whiteOnFace }) => {
      const student = frdOnULayerStudent(uPosition, whiteOnFace);
      const step = cornerLessonStep(student);
      expect(step.kind).toBe('solve-corner');
      if (step.kind !== 'solve-corner' || !step.demoMoves) return;
      expect(step.cornerId).toBe('FRD');
      expect(isVerifiedCornerSlotDemo(student, 'FRD', step.demoMoves)).toBe(
        true,
      );
      expect(cornerSlotSolved(applyMoves(student, step.demoMoves), 'FRD')).toBe(
        true,
      );
      expect(isWhiteCrossComplete(applyMoves(student, step.demoMoves))).toBe(
        true,
      );
    },
  );

  it.each(WRONG_D_LAYER_CASES)(
    'returns FRD wrong-D-layer demo for $dSlot with white on $whiteOnFace',
    ({ dSlot, whiteOnFace }) => {
      const student = frdInWrongDSlotStudent(dSlot, whiteOnFace);
      const setup = setupMovesForWrongDSlotStorage(dSlot);
      expect(isWhiteCrossComplete(applyMoves(student, setup))).toBe(true);

      const step = cornerLessonStep(student);
      expect(step.kind).toBe('solve-corner');
      if (step.kind !== 'solve-corner' || !step.demoMoves) return;
      expect(step.cornerId).toBe('FRD');
      const applyDemo = storageDemoForStep(student, 'FRD', step.demoMoves);
      expect(isVerifiedCornerSlotDemo(student, 'FRD', applyDemo)).toBe(true);
      expect(cornerSlotSolved(applyMoves(student, applyDemo), 'FRD')).toBe(
        true,
      );
      expect(isWhiteCrossComplete(applyMoves(student, applyDemo))).toBe(true);
    },
  );

  it('returns URF-only insert algs when already at URF', () => {
    expect(
      cornerLessonStep(frdOnULayerStudent('URF', 'U')).demoMoves,
    ).toEqual(FRD_URF_WHITE_ON_U);
    expect(
      cornerLessonStep(frdOnULayerStudent('URF', 'R')).demoMoves,
    ).toEqual(FRD_URF_WHITE_ON_R);
    expect(
      cornerLessonStep(frdOnULayerStudent('URF', 'F')).demoMoves,
    ).toEqual(FRD_URF_WHITE_ON_F);
  });

  it('keeps explicit URF align before insert for shortcut U-layer cases', () => {
    expect(
      cornerLessonStep(frdOnULayerStudent('UFL', 'F')).demoMoves,
    ).toEqual([...alignMovesToUrf('UFL'), ...FRD_URF_WHITE_ON_F]);
    expect(
      cornerLessonStep(frdOnULayerStudent('ULB', 'F')).demoMoves,
    ).toEqual([...alignMovesToUrf('ULB'), ...FRD_URF_WHITE_ON_F]);
  });

  it('explains redundant U turns for pedagogical U-layer align-then-insert demos', () => {
    const overlapStep = cornerLessonStep(
      frdOnULayerStudent('UFL', 'F'),
    );
    expect(overlapStep.body).toContain('look redundant');
    expect(overlapStep.body).toContain('get the piece above URF');

    const noOverlapStep = cornerLessonStep(
      frdOnULayerStudent('UFL', 'R'),
    );
    expect(noOverlapStep.body).not.toContain('look redundant');
  });

  it('getWhiteCornerLessonStepAsync matches sync', async () => {
    const student = crossIntactCornersScrambledStudent();
    const sync = cornerLessonStep(student);
    const asyncStep = await getWhiteCornerLessonStepAsync(
      student,
      AFTER_STRATEGY_INTRO,
    );
    expect(asyncStep).toEqual(sync);
  });
});

describe('lesson state preservation', () => {
  it('isLessonStateValid requires a complete cross', () => {
    const solved = cubeStateToStudentFrame(createSolvedCubeState());
    expect(isLessonStateValid(solved)).toBe(true);
    const crossBroken = applyMoves(solved, ['F']);
    expect(isLessonStateValid(crossBroken)).toBe(false);
  });

  it('preservesLessonStateAfterDemo rejects empty demos', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(preservesLessonStateAfterDemo(student, [], 'FRD')).toBe(false);
  });

  it('preservesLessonStateAfterDemo rejects demos that break the cross', () => {
    const student = crossIntactCornersScrambledStudent();
    expect(preservesLessonStateAfterDemo(student, ['F'], 'BDR')).toBe(false);
  });

  it('isVerifiedCornerSlotDemo accepts FRD white-on-F algorithm', () => {
    const student = frdWhiteOnFStudent();
    expect(isVerifiedCornerSlotDemo(student, 'FRD', FRD_WHITE_ON_F)).toBe(true);
    expect(cornerSlotSolved(applyMoves(student, FRD_WHITE_ON_F), 'FRD')).toBe(
      true,
    );
    expect(isWhiteCrossComplete(applyMoves(student, FRD_WHITE_ON_F))).toBe(
      true,
    );
  });

  it('isVerifiedCornerSlotDemo accepts FRD white-on-R algorithm', () => {
    const student = frdWhiteOnRStudent();
    expect(isVerifiedCornerSlotDemo(student, 'FRD', FRD_WHITE_ON_R)).toBe(true);
  });
});

describe('white corners simulation', () => {
  it('simulates cross-intact scramble through full corner lesson', () => {
    const result = simulateWhiteCornersLessonOnStorageCube(
      crossIntactCornersScrambledStorage(),
      30,
    );
    expect(result.cornersComplete).toBe(true);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lessonStepsSimulated).toBeGreaterThanOrEqual(1);
  });

  it('simulates FRD twisted-in-slot solve in one step', () => {
    const storage = cubeStateToStudentFrame(frdWhiteOnFStudent());
    const result = simulateWhiteCornersLessonOnStorageCube(storage);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lessonStepsSimulated).toBe(1);
    expect(result.cornersComplete).toBe(true);
  });

  it('simulates FRD U-layer insert in one step', () => {
    const storage = cubeStateToStudentFrame(frdOnULayerStudent('UBR', 'F'));
    const result = simulateWhiteCornersLessonOnStorageCube(storage);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lessonStepsSimulated).toBe(1);
    expect(result.cornersComplete).toBe(true);
  });

  it('simulates FRD wrong-D-layer extract in one step', () => {
    const storage = cubeStateToStudentFrame(frdInWrongDSlotStudent('BDR', 'F'));
    const result = simulateWhiteCornersLessonOnStorageCube(storage);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.cornersComplete).toBe(true);
    expect(result.lessonStepsSimulated).toBeGreaterThanOrEqual(1);
  });

  it('simulates FRD-only lesson with return to blue when ending at orange hold', () => {
    const storage = cubeStateToStudentFrame(frdOnULayerStudent('URF', 'U'));
    const result = simulateWhiteCornersLessonOnStorageCube(storage);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.lessonStepsSimulated).toBe(1);
    expect(result.cornersComplete).toBe(true);
    expect(result.finalHoldIndex).toBe(0);
  });
});
