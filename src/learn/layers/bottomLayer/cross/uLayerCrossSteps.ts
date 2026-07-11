import {
  applyMoves,
  compressConsecutiveFaceQuarterTurns,
  faceDoubleTurn,
} from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import {
  whiteCrossSteps,
  whitePartnerEdgeHeading,
} from '../../../../content/whiteCross';
import { whiteEdgeIdentity } from '../../../../content/pieceIdentity';
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
} from '../shared/pieceQueries';
import { isVerifiedSlotDemo } from './crossSolveBfs';
import type { CrossEdgeId, WhiteCrossLessonStep } from './types';

const U_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]];

const SIDE_QUARTER_TURNS: Move[] = [
  'F',
  "F'",
  'R',
  "R'",
  'L',
  "L'",
  'B',
  "B'",
];

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

function preservesSolvedSlots(
  studentState: CubeState,
  demo: Move[],
): boolean {
  const mustPreserve = crossSlotsSolvedInState(studentState);
  const after = applyMoves(studentState, demo);
  return mustPreserve.every((id) => slotSolved(after, id));
}

function insertFaceFromDemo(demo: Move[], fallback: Face): Face {
  const faceTurn = demo.find(
    (m) => m === 'F2' || m === 'R2' || m === 'L2' || m === 'B2',
  );
  return faceTurn ? (faceTurn[0] as Face) : fallback;
}

/** U-layer align: U spins and side quarter turns that connect colored sticker to center. */
export function tryULayerAlignStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;

  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition || edgePosition[1] !== 1) return null;
  if (edgeAlignedToSideCenter(studentState, edgePosition)) return null;

  type Candidate = { demo: Move[]; turnFace: Face };
  let best: Candidate | null = null;

  const consider = (demo: Move[], turnFace: Face) => {
    if (!demo.length || !demoChangesState(studentState, demo)) return;
    if (!isVerifiedAlignDemo(studentState, id, partner, demo)) return;
    if (
      !best ||
      demo.length < best.demo.length ||
      (demo.length === best.demo.length && turnFace === 'F')
    ) {
      best = { demo, turnFace };
    }
  };

  for (const uPrefix of U_PREFIXES) {
    const afterU = uPrefix.length ? applyMoves(studentState, uPrefix) : studentState;
    const edgeAfterU = findEdgeWithColors(afterU, 'white', partner);
    if (!edgeAfterU) continue;

    if (edgeAlignedToSideCenter(afterU, edgeAfterU)) {
      if (uPrefix.length > 0) {
        consider(uPrefix, SLOT_DEF[id].sideFace);
      }
      continue;
    }

    for (const sideMove of SIDE_QUARTER_TURNS) {
      const demo = compressConsecutiveFaceQuarterTurns([...uPrefix, sideMove]);
      const turnFace = sideMove[0] as Face;
      consider(demo, turnFace);
    }
  }

  if (!best) return null;

  const { demo, turnFace } = best as { demo: Move[]; turnFace: Face };

  const label = `${formatColor(partner)} edge`;

  return {
    kind: 'align-to-center',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.uLayerAlign(
      formatColor(partner),
      whiteEdgeIdentity(partner),
    ),
    face: turnFace,
    demoMoves: demo,
  };
}

/** U-layer insert: edge aligned on U — U setup + side double turn. */
export function tryULayerInsertStepForCrossId(
  studentState: CubeState,
  id: CrossEdgeId,
): WhiteCrossLessonStep | null {
  if (slotSolved(studentState, id)) return null;

  const partner = partnerColorForSlot(studentState, id);
  const edgePosition = findEdgeWithColors(studentState, 'white', partner);
  if (!edgePosition || edgePosition[1] !== 1) return null;
  if (!edgeAlignedToSideCenter(studentState, edgePosition)) return null;

  const slot = SLOT_DEF[id];
  let best: Move[] | null = null;

  const uSpins: Move[][] = [[], ['U'], ['U2'], ["U'"]];
  for (const uSetup of uSpins) {
    const raw = [...uSetup, faceDoubleTurn(slot.sideFace)];
    const demo = compressConsecutiveFaceQuarterTurns(raw);
    if (!demo.length || !preservesSolvedSlots(studentState, demo)) continue;
    if (!isVerifiedSlotDemo(studentState, id, demo)) continue;
    if (!best || demo.length < best.length) best = demo;
  }

  if (!best) return null;

  const label = `${formatColor(partner)} edge`;
  const face = insertFaceFromDemo(best, slot.sideFace);

  return {
    kind: 'insert-double',
    title: whitePartnerEdgeHeading(partner),
    edgeLabel: label,
    partnerColor: partner,
    body: whiteCrossSteps.uLayerInsert(
      formatColor(partner),
      whiteEdgeIdentity(partner),
    ),
    face,
    demoMoves: best,
  };
}
