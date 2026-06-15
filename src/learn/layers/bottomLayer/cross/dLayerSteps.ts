import {
  applyMoves,
  compressConsecutiveFaceQuarterTurns,
  faceDoubleTurn,
} from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import {
  crossSlotsToPreserve,
  formatColor,
  partnerColorForSlot,
  SLOT_DEF,
  slotShowsRotateBottomPattern,
  slotSolved,
  unsolvedWhiteOnDSlotIds,
  whitePartnerEdgeHeading,
} from './crossSlotModel';
import { findEdgeWithColors, whiteStickerOnD } from '../shared/pieceQueries';
import { isVerifiedSlotDemo, preservesSlotsAfterDemo } from './crossSolveBfs';
import type {
  CrossEdgeId,
  DPhaseOption,
  PermuteReadyCandidate,
  WhiteCrossLessonStep,
} from './types';

function formatBottomSpinForLesson(demo: Move[]): string {
  if (demo.length === 1 && demo[0] === "D'") return 'D′';
  return demo.join(' ');
}

const MINIMAL_BOTTOM_SPINS: Move[][] = [['D'], ['D2'], ["D'"]];

/** Fewest quarter D turns (as D, D2, or D′) that align this cross slot, or null if none. */
function findMinimalBottomSpinToSolveSlot(
  studentState: CubeState,
  id: CrossEdgeId,
): Move[] | null {
  for (const demo of MINIMAL_BOTTOM_SPINS) {
    if (slotSolved(applyMoves(studentState, demo), id)) return demo;
  }
  return null;
}

function tryDPrefixOrInsertSolveSlot(
  studentState: CubeState,
  id: CrossEdgeId,
): Move[] | null {
  const mustPreserve = crossSlotsToPreserve(studentState, id);
  const slot = SLOT_DEF[id];
  const partner = partnerColorForSlot(studentState, id);
  const edgeAtStart = findEdgeWithColors(studentState, 'white', partner);
  if (!edgeAtStart || !whiteStickerOnD(studentState, edgeAtStart)) return null;
  if (slotShowsRotateBottomPattern(studentState, id)) return null;

  const dQuarterTurns = (count: number): Move[] =>
    count === 0 ? [] : count === 1 ? ['D'] : count === 2 ? ['D2'] : ["D'"];

  for (let spinCount = 0; spinCount < 4; spinCount += 1) {
    const dPart = dQuarterTurns(spinCount);

    const tryDemo = (extra: Move[]): Move[] | null => {
      const raw = [...dPart, ...extra];
      const demo = compressConsecutiveFaceQuarterTurns(raw);
      if (!preservesSlotsAfterDemo(studentState, demo, mustPreserve))
        return null;
      const after = applyMoves(studentState, demo);
      return slotSolved(after, id) ? demo : null;
    };

    const onlyD = tryDemo([]);
    if (onlyD) return onlyD;

    const withDoubleTurn = tryDemo([faceDoubleTurn(slot.sideFace)]);
    if (withDoubleTurn) return withDoubleTurn;
  }
  return null;
}

function buildDLayerStepFromOption(
  studentState: CubeState,
  best: DPhaseOption,
): WhiteCrossLessonStep {
  const partner = partnerColorForSlot(studentState, best.id);
  const label = `${formatColor(partner)} edge`;
  const slot = SLOT_DEF[best.id];

  if (best.variant === 'rotate-bottom') {
    return {
      kind: 'rotate-bottom',
      title: whitePartnerEdgeHeading(partner),
      edgeLabel: label,
      partnerColor: partner,
      body: `The white–${partner} edge already has its white sticker on the bottom (D), but it isn’t sitting below the ${formatColor(partner)} center yet. Turn the bottom layer with ${formatBottomSpinForLesson(best.demo)} so it lines up — we finish edges that are already on D before working on other cross edges.`,
      targetFace: slot.sideFace,
      demoMoves: best.demo,
    };
  }

  if (best.variant === 'insert-double') {
    const faceTurn = best.demo.find(
      (m) => m === 'F2' || m === 'R2' || m === 'L2' || m === 'B2',
    );
    const face = faceTurn ? (faceTurn[0] as Face) : slot.sideFace;
    return {
      kind: 'insert-double',
      title: whitePartnerEdgeHeading(partner),
      body: `Finish the white–${partner} edge from the bottom layer (demo may spin D then use ${face}2). Cross slots that were already correct stay solved.`,
      face,
      demoMoves: best.demo,
    };
  }

  return {
    kind: 'insert-double',
    title: whitePartnerEdgeHeading(partner),
    body: `A solved cross slot can block a plain D-spin. The demo sets up white–${partner} while keeping other solved bottom edges intact.`,
    face: slot.sideFace,
    demoMoves: best.demo,
  };
}

/** Phase 1: white on D sticker, wrong center — D / D2 / D′ only. */
export function collectRotateBottomPermuteCandidates(
  studentState: CubeState,
): PermuteReadyCandidate[] {
  const candidates: PermuteReadyCandidate[] = [];
  for (const id of unsolvedWhiteOnDSlotIds(studentState)) {
    if (!slotShowsRotateBottomPattern(studentState, id)) continue;
    const bottomSpinMoves = findMinimalBottomSpinToSolveSlot(studentState, id);
    if (
      bottomSpinMoves &&
      isVerifiedSlotDemo(studentState, id, bottomSpinMoves)
    ) {
      candidates.push({
        id,
        step: buildDLayerStepFromOption(studentState, {
          id,
          demo: bottomSpinMoves,
          variant: 'rotate-bottom',
        }),
      });
    }
  }
  return candidates;
}

/** Phase 2: white on edge cubie on D, needs D setup + side insert (not pure bottom permute). */
export function collectDLayerInsertPermuteCandidates(
  studentState: CubeState,
): PermuteReadyCandidate[] {
  const candidates: PermuteReadyCandidate[] = [];
  for (const id of unsolvedWhiteOnDSlotIds(studentState)) {
    if (slotShowsRotateBottomPattern(studentState, id)) continue;
    const insert = tryDPrefixOrInsertSolveSlot(studentState, id);
    if (
      insert &&
      insert.length > 0 &&
      isVerifiedSlotDemo(studentState, id, insert)
    ) {
      candidates.push({
        id,
        step: buildDLayerStepFromOption(studentState, {
          id,
          demo: insert,
          variant: 'insert-double',
        }),
      });
    }
  }
  return candidates;
}

export function collectDLayerPermuteCandidates(
  studentState: CubeState,
): PermuteReadyCandidate[] {
  return [
    ...collectRotateBottomPermuteCandidates(studentState),
    ...collectDLayerInsertPermuteCandidates(studentState),
  ];
}
