import { describe, expect, it } from 'vitest';
import {
  applyMove,
  applyMoves,
  applyMovesInStudentHold,
  compressConsecutiveFaceQuarterTurns,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type CubeState,
  type Move,
} from '../../../../cube/cubeState';
import {
  countSolvedCrossSlots,
  crossEdgeExampleDemoMoves,
  firstUnsolvedCrossId,
  getWhiteCrossLessonStep,
  getWhiteCrossLessonStepAsync,
  isWhiteCrossComplete,
  WHITE_CROSS_STEP_KINDS,
} from './index';
import { crossSlotIdForPartner } from './crossSlotModel';
import { isVerifiedSlotDemo } from './crossSolveBfs';
import {
  edgeAlignedToSideCenter,
  findEdgeWithColors,
} from '../shared/pieceQueries';
import { partnerColorForSlot, slotSolved } from './crossSlotModel';
import {
  getLessonExecutionMoves,
  isBackFaceMove,
  noneHold,
} from '../../../studentHold';
import { simulateWhiteCrossLessonOnStorageCube } from './simulateLesson';

const AFTER_STRATEGY_INTRO = { hasSeenStrategyIntro: true } as const;

function crossLessonStep(
  student: CubeState,
  options?: Parameters<typeof getWhiteCrossLessonStep>[1],
) {
  return getWhiteCrossLessonStep(student, {
    ...AFTER_STRATEGY_INTRO,
    ...options,
  });
}

/** Deterministic storage cube: `F` from solved — common lesson fixture. */
function practiceFixtureCubeSingleF(): CubeState {
  return applyMoves(createSolvedCubeState(), ['F']);
}

const ACTIVE_STEP_KINDS = [
  'solve-edge',
  'rotate-bottom',
  'align-to-center',
  'insert-double',
] as const;

function isTargetAligned(studentState: CubeState, id: ReturnType<typeof firstUnsolvedCrossId>): boolean {
  if (!id) return false;
  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition) return false;
  return edgeAlignedToSideCenter(studentState, edgePosition) !== null;
}

describe('cubeStateToStudentFrame', () => {
  it('puts yellow on U and white on D from stored solved cube', () => {
    const solved = createSolvedCubeState();
    const s = cubeStateToStudentFrame(solved);
    expect(s.U.every((c) => c === 'yellow')).toBe(true);
    expect(s.D.every((c) => c === 'white')).toBe(true);
    expect(countSolvedCrossSlots(s)).toBe(4);
  });
});

describe('white cross step kinds', () => {
  it('lists active step kinds for the edge-at-a-time planner', () => {
    expect(WHITE_CROSS_STEP_KINDS).toEqual([
      'complete',
      'intro',
      'solve-edge',
      'rotate-bottom',
      'align-to-center',
      'insert-double',
    ]);
  });
});

describe('white cross lesson', () => {
  it('reports complete on solved cube in student frame', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(getWhiteCrossLessonStep(student).kind).toBe('complete');
  });

  it('returns strategy intro before first edge solve', () => {
    const student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    const step = getWhiteCrossLessonStep(student);
    expect(step.kind).toBe('intro');
    if (step.kind === 'intro') {
      expect(step.body).toContain('white sticker');
      expect(step.body).toContain('that edge is solved');
    }
  });

  it('getWhiteCrossLessonStepAsync matches sync on representative student frames', async () => {
    const frames: CubeState[] = [
      cubeStateToStudentFrame(createSolvedCubeState()),
      cubeStateToStudentFrame(practiceFixtureCubeSingleF()),
      applyMoves(cubeStateToStudentFrame(createSolvedCubeState()), [
        'D',
        'R',
        'R',
      ]),
    ];

    let walk = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    for (let guard = 0; guard < 8; guard += 1) {
      frames.push(walk);
      const step = crossLessonStep(walk);
      if (step.kind === 'complete') break;
      if ('demoMoves' in step && step.demoMoves?.length) {
        walk = applyMoves(walk, step.demoMoves);
      } else {
        break;
      }
    }

    for (const student of frames) {
      const sync = crossLessonStep(student);
      const asyncStep = await getWhiteCrossLessonStepAsync(
        student,
        AFTER_STRATEGY_INTRO,
      );
      expect(asyncStep.kind).toBe(sync.kind);
      expect(asyncStep.title).toBe(sync.title);
      if ('demoMoves' in sync && sync.demoMoves?.length) {
        expect('demoMoves' in asyncStep && asyncStep.demoMoves).toBeTruthy();
        expect(asyncStep.demoMoves).toEqual(sync.demoMoves);
      }
    }
  });

  it('targets the first unsolved cross edge in DF → DR → DB → DL order', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['D', 'R', 'R'],
    );
    expect(firstUnsolvedCrossId(student)).toBe('DF');
    expect(crossLessonStep(student).kind).toBe('align-to-center');
  });

  it('rotate-bottom demo uses D2 when two quarter D turns align the active slot', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['D', 'D'],
    );
    const step = crossLessonStep(student);
    expect(step.kind).toBe('rotate-bottom');
    if (step.kind === 'rotate-bottom') {
      expect(step.demoMoves).toEqual(['D2']);
      expect(step.body).toContain('D2');
      expect(step.title).toMatch(/^White–/);
      expect(step.edgeLabel.length).toBeGreaterThan(0);
    }
  });

  it('middle-layer align-to-center uses exactly one side quarter turn', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['F', 'L'],
    );
    const step = crossLessonStep(student);
    expect(step.kind).toBe('align-to-center');
    if (step.kind === 'align-to-center') {
      expect(step.demoMoves).toEqual(["L'"]);
      expect(firstUnsolvedCrossId(student)).toBe('DF');
    }
  });

  it('U-layer align then insert for R R U (DR edge)', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['R', 'R', 'U'],
    );
    expect(firstUnsolvedCrossId(student)).toBe('DR');

    const alignStep = crossLessonStep(student);
    expect(alignStep.kind).toBe('align-to-center');
    if (alignStep.kind !== 'align-to-center' || !alignStep.demoMoves?.length) {
      throw new Error('expected align demo');
    }
    expect(alignStep.demoMoves).toEqual(["U'"]);

    const afterAlign = applyMoves(student, alignStep.demoMoves);
    expect(isTargetAligned(afterAlign, 'DR')).toBe(true);

    const insertStep = crossLessonStep(afterAlign);
    expect(insertStep.kind).toBe('insert-double');
    if (insertStep.kind === 'insert-double') {
      expect(insertStep.demoMoves).toEqual(['R2']);
      expect(isVerifiedSlotDemo(afterAlign, 'DR', insertStep.demoMoves!)).toBe(
        true,
      );
    }
  });

  it('suggests a cross step when a white cross edge is not on the bottom', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const candidates: Move[] = [
      'F',
      'F2',
      "F'",
      'R',
      'R2',
      "R'",
      'B',
      'B2',
      "B'",
      'L',
      'L2',
      "L'",
      'U',
      'U2',
      "U'",
      'D',
      'D2',
      "D'",
    ];
    const broken = candidates
      .map((m) => applyMove(student, m))
      .find((s) => !isWhiteCrossComplete(s));
    expect(
      broken,
      'at least one single move should break the white cross',
    ).toBeDefined();
    const step = crossLessonStep(broken!);
    expect(ACTIVE_STEP_KINDS).toContain(step.kind);
  });

  it('align-to-center step copy mentions connecting to the center', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['F', 'L'],
    );
    const step = crossLessonStep(student);
    expect(step.kind).toBe('align-to-center');
    if (step.kind === 'align-to-center') {
      expect(step.body.toLowerCase()).toMatch(/center/);
    }
  });

  it('insert-double step includes playable demo moves when returned', () => {
    const student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    const step = crossLessonStep(student);
    expect(step.kind).toBe('insert-double');
    if (step.kind === 'insert-double') {
      expect(step.demoMoves?.length).toBeGreaterThan(0);
    }
  });

  it('solve-edge example demos are verified slot solves for the partner edge', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['F', 'R', 'U'],
    );
    const partner = student.F[4];
    const slotId = crossSlotIdForPartner(student, partner);
    expect(slotId).not.toBeNull();
    const demo = crossEdgeExampleDemoMoves(student, partner);
    expect(demo.length).toBeGreaterThan(0);
    expect(isVerifiedSlotDemo(student, slotId!, demo)).toBe(true);
  });

  it('insert-double and rotate-bottom demos verify as slot solves for the target edge', () => {
    const student = cubeStateToStudentFrame(createSolvedCubeState());
    const candidates: Move[] = ['F', 'R', 'U', 'D', 'L', 'B', 'F2', 'R2'];
    for (const m of candidates) {
      const broken = applyMove(student, m);
      const step = crossLessonStep(broken);
      if (!step.demoMoves?.length) continue;
      if (step.kind !== 'insert-double' && step.kind !== 'rotate-bottom') {
        continue;
      }
      const partner = step.partnerColor;
      const slotId = crossSlotIdForPartner(broken, partner);
      expect(slotId, `slot for ${partner}`).not.toBeNull();
      expect(isVerifiedSlotDemo(broken, slotId!, step.demoMoves)).toBe(true);
    }
  });

  it('plans insert-double for the first unsolved edge when another edge is already aligned (R R U then F)', () => {
    const withDrReady = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['R', 'R', 'U'],
    );
    const withDfActive = applyMove(withDrReady, 'F');
    expect(firstUnsolvedCrossId(withDfActive)).toBe('DF');
    const step = crossLessonStep(withDfActive);
    expect(step.kind).toBe('insert-double');
  });

  it('fixture (F from solved): opening step is insert-double; applying its demo advances the lesson', () => {
    let storage = practiceFixtureCubeSingleF();
    let student = cubeStateToStudentFrame(storage);
    const step1 = crossLessonStep(student);
    expect(step1.kind).toBe('insert-double');
    if (step1.kind !== 'insert-double' || !step1.demoMoves?.length) return;

    storage = applyMovesInStudentHold(storage, step1.demoMoves);
    student = cubeStateToStudentFrame(storage);
    const step2 = crossLessonStep(student);
    expect(step2.kind).not.toBe('insert-double');
    expect(['align-to-center', 'rotate-bottom', 'complete', 'solve-edge']).toContain(
      step2.kind,
    );
  });

  it('fixture (F from solved): step demos never reduce solved cross-slot count', () => {
    let storage = practiceFixtureCubeSingleF();
    let student = cubeStateToStudentFrame(storage);
    for (let guard = 0; guard < 80; guard += 1) {
      if (isWhiteCrossComplete(student)) break;
      const step = crossLessonStep(student);
      const beforeSlots = countSolvedCrossSlots(student);
      if (!('demoMoves' in step) || !step.demoMoves?.length) break;
      storage = applyMovesInStudentHold(storage, step.demoMoves);
      student = cubeStateToStudentFrame(storage);
      if (ACTIVE_STEP_KINDS.includes(step.kind as (typeof ACTIVE_STEP_KINDS)[number])) {
        expect(countSolvedCrossSlots(student)).toBeGreaterThanOrEqual(
          beforeSlots,
        );
      }
    }
  });

  it('fixture (F from solved): playable lesson steps through the cross walk', () => {
    const student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    const step = crossLessonStep(student);
    expect(ACTIVE_STEP_KINDS).toContain(step.kind);
    if ('demoMoves' in step && step.demoMoves?.length) {
      expect(step.demoMoves.length).toBeGreaterThan(0);
    }
  });

  it('simulateLesson with avoid-back on B-steps matches getLessonExecutionMoves per step', () => {
    let storage = practiceFixtureCubeSingleF();
    const res = simulateWhiteCrossLessonOnStorageCube(storage, 80, {
      avoidBackMoves: true,
      avoidBackOnlyOnBSteps: true,
    });
    expect(res.stuckNoDemo).toBe(false);
    expect(res.crossComplete).toBe(true);
    expect(res.finalStudentHold).toBeDefined();

    storage = practiceFixtureCubeSingleF();
    let steps = 0;
    let student = cubeStateToStudentFrame(storage);
    while (steps < 80 && !isWhiteCrossComplete(student)) {
      const step = crossLessonStep(student);
      if (!('demoMoves' in step) || !step.demoMoves?.length) break;
      const useAvoid = step.demoMoves.some(isBackFaceMove);
      const { moves } = getLessonExecutionMoves(
        step.demoMoves,
        useAvoid,
        noneHold(),
      );
      storage = applyMovesInStudentHold(storage, moves);
      student = cubeStateToStudentFrame(storage);
      steps += 1;
    }
    expect(isWhiteCrossComplete(student)).toBe(true);
    expect(steps).toBe(res.lessonStepsSimulated);
  });

  it('lesson demoMoves stay canonical while walking fixture (F from solved)', () => {
    let student = cubeStateToStudentFrame(practiceFixtureCubeSingleF());
    for (let guard = 0; guard < 50; guard += 1) {
      const step = crossLessonStep(student);
      if ('demoMoves' in step && step.demoMoves?.length) {
        expect(compressConsecutiveFaceQuarterTurns(step.demoMoves)).toEqual(
          step.demoMoves,
        );
      }
      if (step.kind === 'complete') break;
      if ('demoMoves' in step && step.demoMoves?.length) {
        student = applyMoves(student, step.demoMoves);
      } else {
        break;
      }
    }
  });

  it('align-to-center demo leaves the target edge aligned but not slotted', () => {
    const student = applyMoves(
      cubeStateToStudentFrame(createSolvedCubeState()),
      ['D', 'R', 'R'],
    );
    const targetId = firstUnsolvedCrossId(student);
    expect(targetId).toBe('DF');
    const step = crossLessonStep(student);
    expect(step.kind).toBe('align-to-center');
    if (step.kind !== 'align-to-center' || !step.demoMoves?.length) return;

    const after = applyMoves(student, step.demoMoves);
    expect(slotSolved(after, targetId!)).toBe(false);
    expect(isTargetAligned(after, targetId)).toBe(true);
  });
});
