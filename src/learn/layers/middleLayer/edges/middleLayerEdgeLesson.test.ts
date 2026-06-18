import { describe, expect, it } from 'vitest';
import {
  applyMoves,
  cloneCubeState,
  createSolvedCubeState,
  cubeStateToStudentFrame,
  type Color,
  type CubeState,
  type Move,
} from '../../../../cube/cubeState';
import {
  EDGE_SLOT_DEF,
  pickBuriedExtractSlot,
  slotNeedsExtract,
} from './edgeSlotModel';
import {
  LEFT_INSERT,
  MIDDLE_EDGE_SLOTS,
  RIGHT_INSERT,
  alignMovesToPartnerCenter,
  algorithmForFrontSlot,
  edgeSlotSolved,
  getMiddleLayerEdgeLessonStep,
  getMiddleLayerEdgeLessonStepAsync,
  isMiddleLayerEdgesComplete,
  isMiddleLayerLessonStateValid,
  isPartnerAlignedToCenter,
  isVerifiedMiddleEdgeExtractDemo,
  isVerifiedMiddleEdgeInsertDemo,
  partnerColorOnU,
  simulateMiddleLayerEdgesLessonOnStorageCube,
  targetFrontSlotBetweenCenters,
  targetHoldForColor,
  type MiddleEdgeSlotId,
} from './index';
import { faceStickerIndex } from '../../../../cube3d/cubeGeometry';

function flipMiddleEdgeInSlot(
  state: CubeState,
  slot: MiddleEdgeSlotId,
): CubeState {
  const next = cloneCubeState(state);
  const slotDef = EDGE_SLOT_DEF[slot];
  const [faceA, faceB] = slotDef.faces;
  const pos = slotDef.pos;
  const indexA = faceStickerIndex(faceA, pos);
  const indexB = faceStickerIndex(faceB, pos);
  const temp = next[faceA][indexA]!;
  next[faceA][indexA] = next[faceB][indexB]!;
  next[faceB][indexB] = temp;
  return next;
}

function solvedStudent(): CubeState {
  return cubeStateToStudentFrame(createSolvedCubeState());
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

/** FR middle edge lifted to U via inverse right insert. */
function frEdgeOnUStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(RIGHT_INSERT));
}

/** FL middle edge lifted to U via inverse left insert. */
function flEdgeOnUStudent(): CubeState {
  return applyMoves(solvedStudent(), invertMoves(LEFT_INSERT));
}

/** FR and FL middle edges on U with bottom layer intact. */
function twoMiddleEdgesOnUStudent(): CubeState {
  let state = solvedStudent();
  state = applyMoves(state, invertMoves(RIGHT_INSERT));
  state = applyMoves(state, invertMoves(LEFT_INSERT));
  return state;
}

function studentWithBottomLayerIncomplete(): CubeState {
  const student = solvedStudent();
  const next = cloneCubeState(student);
  next.D[0] = 'yellow';
  return next;
}

describe('middle layer edge lesson', () => {
  it('valid lesson state requires cross and corners', () => {
    expect(isMiddleLayerLessonStateValid(solvedStudent())).toBe(true);
    expect(isMiddleLayerLessonStateValid(studentWithBottomLayerIncomplete())).toBe(
      false,
    );
  });

  it('complete on solved cube', () => {
    const step = getMiddleLayerEdgeLessonStep(solvedStudent());
    expect(step.kind).toBe('complete');
    expect(isMiddleLayerEdgesComplete(solvedStudent())).toBe(true);
  });

  it('prerequisite when bottom layer incomplete', () => {
    const step = getMiddleLayerEdgeLessonStep(studentWithBottomLayerIncomplete());
    expect(step.kind).toBe('cross-corners-prerequisite');
  });

  it('getMiddleLayerEdgeLessonStepAsync matches sync', async () => {
    const student = frEdgeOnUStudent();
    const syncStep = getMiddleLayerEdgeLessonStep(student);
    const asyncStep = await getMiddleLayerEdgeLessonStepAsync(student);
    expect(asyncStep).toEqual(syncStep);
  });

  it('right insert demo solves FR from U', () => {
    const before = frEdgeOnUStudent();
    expect(isMiddleLayerEdgesComplete(before)).toBe(false);
    const frColors: [Color, Color] = [before.F[4], before.R[4]];
    const demo = algorithmForFrontSlot('FR');
    expect(
      isVerifiedMiddleEdgeInsertDemo(before, 'FR', frColors, demo, 0),
    ).toBe(true);
    const after = applyMoves(before, demo);
    expect(edgeSlotSolved(after, 'FR', 0)).toBe(true);
  });

  it('left insert demo solves FL from U', () => {
    const before = flEdgeOnUStudent();
    const colors: [Color, Color] = [before.F[4], before.L[4]];
    const demo = algorithmForFrontSlot('FL');
    expect(
      isVerifiedMiddleEdgeInsertDemo(before, 'FL', colors, demo, 0),
    ).toBe(true);
  });

  it('extract right demo lifts FR edge to U', () => {
    const solvedFr = applyMoves(frEdgeOnUStudent(), RIGHT_INSERT);
    expect(edgeSlotSolved(solvedFr, 'FR', 0)).toBe(true);
    const frColors: [Color, Color] = [solvedFr.F[4], solvedFr.R[4]];
    const demo = algorithmForFrontSlot('FR');
    expect(
      isVerifiedMiddleEdgeExtractDemo(solvedFr, frColors, demo, 0, undefined, 'FR'),
    ).toBe(true);
  });

  it('alignMovesToPartnerCenter returns U moves when needed', () => {
    const student = frEdgeOnUStudent();
    const colors: [Color, Color] = [student.F[4], student.R[4]];
    const partner = partnerColorOnU(student, colors);
    expect(partner).not.toBeNull();
    const align = alignMovesToPartnerCenter(student, colors);
    expect(align).not.toBeNull();
    if (align && align.length > 0) {
      const after = applyMoves(student, align);
      expect(isPartnerAlignedToCenter(after, colors)).toBe(true);
    }
  });

  it('targetFrontSlotBetweenCenters picks FR for green-red facing red', () => {
    const student = solvedStudent();
    const red = student.R[4];
    const green = student.F[4];
    const slot = targetFrontSlotBetweenCenters(student, red, [green, red], 0);
    expect(slot).toBe('FR');
  });

  it('planner returns align-u or reorient for edge on U', () => {
    const student = frEdgeOnUStudent();
    const step = getMiddleLayerEdgeLessonStep(student);
    expect(['align-u', 'reorient-hold', 'solve-edge']).toContain(step.kind);
  });

  it('all four middle slots are tracked', () => {
    expect(MIDDLE_EDGE_SLOTS).toEqual(['FR', 'FL', 'BR', 'BL']);
    for (const id of MIDDLE_EDGE_SLOTS) {
      expect(edgeSlotSolved(solvedStudent(), id as MiddleEdgeSlotId)).toBe(
        true,
      );
    }
  });

  it('targetHoldForColor maps lesson face colors', () => {
    expect(targetHoldForColor('blue')).toBe(0);
    expect(targetHoldForColor('red')).toBe(1);
    expect(targetHoldForColor('green')).toBe(2);
    expect(targetHoldForColor('orange')).toBe(3);
  });

  it('pickBuriedExtractSlot faces back once then targets front middle slots', () => {
    let state = solvedStudent();
    state = applyMoves(state, ['y2']);
    state = applyMoves(state, invertMoves(LEFT_INSERT));
    state = applyMoves(state, invertMoves(RIGHT_INSERT));
    state = applyMoves(state, ['U']);
    state = applyMoves(state, RIGHT_INSERT);
    state = applyMoves(state, LEFT_INSERT);
    state = applyMoves(state, ['y2']);

    const atBlue = pickBuriedExtractSlot(state, 0);
    expect(atBlue?.needsFaceBackReorient).toBe(true);

    state = applyMoves(state, ['y2']);
    const atGreen = pickBuriedExtractSlot(state, 2);
    expect(atGreen?.needsFaceBackReorient).toBe(false);
    expect(atGreen?.worldSlot).toBe('BR');
    expect(atGreen?.algSide).toBe('FL');
  });

  it('flipped front edge: extract, align, insert, complete', () => {
    const result = simulateMiddleLayerEdgesLessonOnStorageCube(
      flipMiddleEdgeInSlot(solvedStudent(), 'FR'),
    );
    expect(result.stuckNoDemo).toBe(false);
    expect(result.middleLayerComplete).toBe(true);
    expect(result.lastStepKind).toBe('complete');
  });

  it('flipped back edge: reorient, extract, align, insert, complete', () => {
    const result = simulateMiddleLayerEdgesLessonOnStorageCube(
      flipMiddleEdgeInSlot(solvedStudent(), 'BR'),
    );
    expect(result.stuckNoDemo).toBe(false);
    expect(result.middleLayerComplete).toBe(true);
    expect(result.lastStepKind).toBe('complete');
    expect(result.finalHoldIndex).toBe(0);
  });

  it('slotNeedsExtract for flipped edge in slot', () => {
    expect(slotNeedsExtract(flipMiddleEdgeInSlot(solvedStudent(), 'FR'), 'FR', 0)).toBe(
      true,
    );
  });

  it('simulates solving two middle edges lifted to U', () => {
    const scrambled = twoMiddleEdgesOnUStudent();
    expect(isMiddleLayerEdgesComplete(scrambled)).toBe(false);

    const result = simulateMiddleLayerEdgesLessonOnStorageCube(scrambled, 40);
    expect(result.stuckNoDemo).toBe(false);
    expect(result.middleLayerComplete).toBe(true);
    expect(result.finalHoldIndex).toBe(0);
    expect(result.lessonStepsSimulated).toBeGreaterThan(0);
  });
});
