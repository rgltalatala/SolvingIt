import type { Color, CubeState, Move } from '../../../../cube/cubeState';
import { normalizeLessonDemoMovesInStep } from '../../../lessonCore';
import {
  CROSS_ORDER,
  formatColor,
  isWhiteCrossComplete,
  partnerColorForSlot,
  slotSolved,
  whitePartnerEdgeHeading,
} from './crossSlotModel';
import type { CrossEdgeId } from './types';
import {
  tryDirectSolveStepForCrossId,
  tryDirectSolveStepForCrossIdAsync,
} from './directSolveSteps';
import { crossEdgeExampleDemoMoves } from './crossEdgeDemoMoves';
import {
  findVerifiedSlotDemoForPartner,
  findVerifiedSlotDemoForPartnerAsync,
} from './crossSolveBfs';
import { faceForWhiteOnEdge, findEdgeWithColors } from '../shared/pieceQueries';
import { tryPermuteReadyPass } from './permutePass';
import type { WhiteCrossLessonStep } from './types';

const WHITE_CROSS_COMPLETE_BODY =
  'All four white edges line up with their side centers on the bottom face. Confirm your physical cube matches the diagram below (same hold: white on bottom, yellow on top). Use Back to cube overview when you are ready to leave.';

type CrossStepLookup = {
  directSolve: (id: CrossEdgeId) => WhiteCrossLessonStep | null;
  verifiedDemo: (partner: Color) => Move[] | null;
};

type AsyncCrossStepLookup = {
  directSolve: (id: CrossEdgeId) => Promise<WhiteCrossLessonStep | null>;
  verifiedDemo: (partner: Color) => Promise<Move[] | null>;
};

function buildSolveEdgeStep(
  studentState: CubeState,
  partner: Color,
  extraNote?: string,
  demoMoves?: Move[],
): WhiteCrossLessonStep {
  const label = `${formatColor(partner)} edge`;
  const note = extraNote ? ` ${extraNote}` : '';
  const demo = demoMoves ?? crossEdgeExampleDemoMoves(studentState, partner);
  return {
    kind: 'solve-edge',
    title: whitePartnerEdgeHeading(partner),
    body: `Line up the white–${formatColor(partner)} edge with the ${formatColor(partner)} center and slot it into the white cross on the bottom (white on D, colored sticker matches that center).${note} The demo is the shortest sequence we found; setup and undo keep other cross edges you already solved in place.`,
    edgeLabel: label,
    partnerColor: partner,
    demoMoves: demo,
  };
}

function buildSolveEdgeFromVerifiedDemo(
  studentState: CubeState,
  partner: Color,
  verifiedDemo: Move[],
  edgePosition: ReturnType<typeof findEdgeWithColors>,
): WhiteCrossLessonStep {
  const whiteFace = edgePosition
    ? faceForWhiteOnEdge(edgePosition, studentState)
    : null;
  const topLayerWhiteOnSide =
    edgePosition !== null &&
    edgePosition[1] === 1 &&
    whiteFace !== null &&
    whiteFace !== 'U';
  return buildSolveEdgeStep(
    studentState,
    partner,
    topLayerWhiteOnSide
      ? 'This piece is on the top layer with white on a side—we still connect it to the center and slot it rather than only parking white on U.'
      : undefined,
    verifiedDemo,
  );
}

function whiteCrossCompleteStep(): WhiteCrossLessonStep {
  return {
    kind: 'complete',
    title: 'White cross complete',
    body: WHITE_CROSS_COMPLETE_BODY,
  };
}

function stuckPartnerStep(studentState: CubeState): WhiteCrossLessonStep {
  const unsolvedIds = CROSS_ORDER.filter((id) => !slotSolved(studentState, id));
  const firstUnsolved = unsolvedIds[0];
  const stuckPartner = firstUnsolved
    ? partnerColorForSlot(studentState, firstUnsolved)
    : 'white';
  return {
    kind: 'solve-edge',
    title: whitePartnerEdgeHeading(stuckPartner),
    body: `We could not find a short automated demo for the white–${formatColor(stuckPartner)} edge from this position while keeping your other cross edges. Align it with the ${formatColor(stuckPartner)} center on your own, then use Back and re-open the lesson—or reset the scramble and try again.`,
    edgeLabel: `${formatColor(stuckPartner)} edge`,
    partnerColor: stuckPartner,
  };
}

function planUnsolvedCrossStep(
  studentState: CubeState,
  lookup: CrossStepLookup,
): WhiteCrossLessonStep | null {
  for (const id of CROSS_ORDER) {
    if (slotSolved(studentState, id)) continue;
    const partner = partnerColorForSlot(studentState, id);
    const edgePosition = findEdgeWithColors(studentState, 'white', partner);
    if (!edgePosition) continue;
    const direct = lookup.directSolve(id);
    if (direct) return direct;
    const verifiedDemo = lookup.verifiedDemo(partner);
    if (!verifiedDemo?.length) continue;
    return buildSolveEdgeFromVerifiedDemo(
      studentState,
      partner,
      verifiedDemo,
      edgePosition,
    );
  }

  for (const id of CROSS_ORDER) {
    if (slotSolved(studentState, id)) continue;
    const partner = partnerColorForSlot(studentState, id);
    const verifiedDemo = lookup.verifiedDemo(partner);
    if (!verifiedDemo?.length) continue;
    return buildSolveEdgeStep(studentState, partner, undefined, verifiedDemo);
  }

  return null;
}

async function planUnsolvedCrossStepAsync(
  studentState: CubeState,
  lookup: AsyncCrossStepLookup,
): Promise<WhiteCrossLessonStep | null> {
  for (const id of CROSS_ORDER) {
    if (slotSolved(studentState, id)) continue;
    const partner = partnerColorForSlot(studentState, id);
    const edgePosition = findEdgeWithColors(studentState, 'white', partner);
    if (!edgePosition) continue;
    const direct = await lookup.directSolve(id);
    if (direct) return direct;
    const verifiedDemo = await lookup.verifiedDemo(partner);
    if (!verifiedDemo?.length) continue;
    return buildSolveEdgeFromVerifiedDemo(
      studentState,
      partner,
      verifiedDemo,
      edgePosition,
    );
  }

  for (const id of CROSS_ORDER) {
    if (slotSolved(studentState, id)) continue;
    const partner = partnerColorForSlot(studentState, id);
    const verifiedDemo = await lookup.verifiedDemo(partner);
    if (!verifiedDemo?.length) continue;
    return buildSolveEdgeStep(studentState, partner, undefined, verifiedDemo);
  }

  return null;
}

function computeWhiteCrossLessonStepSync(
  studentState: CubeState,
): WhiteCrossLessonStep {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  const permute = tryPermuteReadyPass(studentState);
  if (permute) return permute;

  const planned = planUnsolvedCrossStep(studentState, {
    directSolve: (id) => tryDirectSolveStepForCrossId(studentState, id),
    verifiedDemo: (partner) =>
      findVerifiedSlotDemoForPartner(studentState, partner),
  });
  if (planned) return planned;

  return stuckPartnerStep(studentState);
}

async function computeWhiteCrossLessonStepAsync(
  studentState: CubeState,
): Promise<WhiteCrossLessonStep> {
  if (isWhiteCrossComplete(studentState)) {
    return whiteCrossCompleteStep();
  }

  const permute = tryPermuteReadyPass(studentState);
  if (permute) return permute;

  const planned = await planUnsolvedCrossStepAsync(studentState, {
    directSolve: (id) => tryDirectSolveStepForCrossIdAsync(studentState, id),
    verifiedDemo: (partner) =>
      findVerifiedSlotDemoForPartnerAsync(studentState, partner),
  });
  if (planned) return planned;

  return stuckPartnerStep(studentState);
}

export function getWhiteCrossLessonStep(
  studentState: CubeState,
): WhiteCrossLessonStep {
  return normalizeLessonDemoMovesInStep(
    computeWhiteCrossLessonStepSync(studentState),
  );
}

/** UI path: BFS yields to the main thread so apply/loading stay responsive. */
export async function getWhiteCrossLessonStepAsync(
  studentState: CubeState,
): Promise<WhiteCrossLessonStep> {
  return normalizeLessonDemoMovesInStep(
    await computeWhiteCrossLessonStepAsync(studentState),
  );
}
