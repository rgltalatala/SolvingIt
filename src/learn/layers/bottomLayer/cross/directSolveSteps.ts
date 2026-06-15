import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import { demoChangesState } from '../../../lessonCore';
import {
  CROSS_ORDER,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotSolved,
  whitePartnerEdgeHeading,
} from './crossSlotModel';
import {
  findVerifiedSlotDemoForCrossId,
  findVerifiedSlotDemoForCrossIdAsync,
} from './crossSolveBfs';
import type {
  CrossEdgeId,
  PermuteReadyCandidate,
  WhiteCrossLessonStep,
} from './types';

function buildDirectSolveStep(
  studentState: CubeState,
  id: CrossEdgeId,
  demo: Move[],
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const slot = SLOT_DEF[id];
  const faceTurn = demo.find(
    (m) => m === 'F2' || m === 'R2' || m === 'L2' || m === 'B2',
  );
  const face = faceTurn ? (faceTurn[0] as Face) : slot.sideFace;
  return {
    kind: 'insert-double',
    title: whitePartnerEdgeHeading(partner),
    body: `This white–${formatColor(partner)} edge can go straight into the cross: line it up with the ${formatColor(partner)} center, slot it on the bottom, and undo any setup moves so other cross edges you already placed stay correct. The demo is the shortest sequence we found.`,
    face,
    demoMoves: demo,
  };
}

export function tryDirectSolveStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;
  const demo = findVerifiedSlotDemoForCrossId(studentState, id);
  if (!demo?.length || !demoChangesState(studentState, demo)) return null;
  return buildDirectSolveStep(studentState, id, demo);
}

export async function tryDirectSolveStepForCrossIdAsync(
  studentState: CubeState,
  id: CrossEdgeId,
): Promise<WhiteCrossLessonStep | null> {
  if (slotSolved(studentState, id)) return null;
  const demo = await findVerifiedSlotDemoForCrossIdAsync(studentState, id);
  if (!demo?.length || !demoChangesState(studentState, demo)) return null;
  return buildDirectSolveStep(studentState, id, demo);
}

export function collectDirectSolveCandidates(
  studentState: CubeState,
): PermuteReadyCandidate[] {
  const candidates: PermuteReadyCandidate[] = [];
  for (const id of CROSS_ORDER) {
    const step = tryDirectSolveStepForCrossId(studentState, id);
    if (step) candidates.push({ id, step });
  }
  return candidates;
}
