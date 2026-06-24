import { applyMove, applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import {
  whiteCrossSteps,
  whitePartnerEdgeHeading,
} from '../../../../content/whiteCross';
import { demoChangesState } from '../../../lessonCore';
import {
  crossSlotsSolvedInState,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotSolved,
} from './crossSlotModel';
import {
  edgeAlignedToSideCenter,
  findEdgeWithColors,
  isMiddleLayerEdge,
} from '../shared/pieceQueries';
import type { CrossEdgeId, WhiteCrossLessonStep } from './types';

function isVerifiedAlignDemo(
  studentState: CubeState,
  targetId: CrossEdgeId,
  partner: ReturnType<typeof partnerColorForSlot>,
  demo: Move[],
): boolean {
  if (!demo.length) return false;
  const mustPreserve = crossSlotsSolvedInState(studentState).filter(
    (id) => id !== targetId,
  );
  const after = applyMoves(studentState, demo);
  if (slotSolved(after, targetId)) return false;
  if (!mustPreserve.every((id) => slotSolved(after, id))) return false;
  const edgePosition = findEdgeWithColors(after, 'white', partner);
  if (!edgePosition) return false;
  return edgeAlignedToSideCenter(after, edgePosition) !== null;
}

function buildAlignToCenterStep(
  studentState: CubeState,
  id: CrossEdgeId,
  turnFace: Face,
  demo: Move[],
  alreadyAligned: boolean,
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, id);
  const label = `${formatColor(partner)} edge`;
  const turnWord = demo[0]?.endsWith("'") ? 'counterclockwise' : 'clockwise';
  const partnerLabel = formatColor(partner);
  const body = alreadyAligned
    ? whiteCrossSteps.middleLayerAlign(partnerLabel, turnFace, turnWord)
    : whiteCrossSteps.middleLayerAlignNotLinedUp(
        partnerLabel,
        turnFace,
        turnWord,
      );

  return {
    kind: 'align-to-center',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body,
    face: turnFace,
    demoMoves: demo,
  };
}

/** Middle-layer align: one quarter turn that achieves center alignment without slotting. */
export function tryMiddleLayerAlignStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;

  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition || !isMiddleLayerEdge(edgePosition)) return null;
  if (edgeAlignedToSideCenter(studentState, edgePosition)) return null;

  const alignedFace = edgeAlignedToSideCenter(studentState, edgePosition);
  const turnFace = alignedFace ?? SLOT_DEF[id].sideFace;
  const clockwiseMove = turnFace as Move;
  const counterClockwiseMove = `${turnFace}'` as Move;
  const solvedSlotsToPreserve = crossSlotsSolvedInState(studentState);

  type Candidate = { move: Move; demo: Move[]; newlyAligned: boolean };
  let best: Candidate | null = null;

  for (const move of [clockwiseMove, counterClockwiseMove]) {
    const nextState = applyMove(studentState, move);
    const preservesSolvedSlots = solvedSlotsToPreserve.every((slotId) =>
      slotSolved(nextState, slotId),
    );
    if (!preservesSolvedSlots) continue;
    if (slotSolved(nextState, id)) continue;

    const nextEdge = findEdgeWithColors(nextState, 'white', partner);
    if (!nextEdge) continue;
    const newlyAligned =
      edgeAlignedToSideCenter(studentState, edgePosition) === null &&
      edgeAlignedToSideCenter(nextState, nextEdge) !== null;
    if (!newlyAligned) continue;

    const demo = [move];
    if (!demoChangesState(studentState, demo)) continue;
    if (!isVerifiedAlignDemo(studentState, id, partner, demo)) continue;

    const candidate: Candidate = { move, demo, newlyAligned };
    if (
      !best ||
      candidate.demo.length < best.demo.length ||
      (candidate.demo.length === best.demo.length &&
        move === clockwiseMove)
    ) {
      best = candidate;
    }
  }

  if (!best) return null;

  return buildAlignToCenterStep(
    studentState,
    id,
    turnFace,
    best.demo,
    !!alignedFace,
  );
}
