import type { CubeState, Move } from '../../../../cube/cubeState';
import type { CornerCase } from './cornerCases';
import { recognizeCornerCaseInFrdView } from './cornerCases';
import { studentHoldView, verifiedFrdDemoAtHold } from './frdViewDemoBuild';
import type { CornerSlotId } from './types';
import { U_LAYER_U_PREFIXES } from './uLayerSteps';

export type FrdDemoCandidate = {
  studentDemo: Move[];
  storageCandidates?: Move[][];
};

/**
 * Shared U-prefix loop for FRD-view corner demos: try each U alignment, recognize
 * the case, build candidates, and keep the shortest verified demo.
 */
export function buildShortestVerifiedFrdDemo(
  studentState: CubeState,
  targetId: CornerSlotId,
  holdIndex: number,
  solvedCornerIds: readonly CornerSlotId[] | undefined,
  buildCandidates: (
    viewState: CubeState,
    cornerCase: CornerCase,
    uPrefix: Move[],
  ) => FrdDemoCandidate[],
): Move[] | null {
  let shortest: Move[] | null = null;

  for (const uPrefix of U_LAYER_U_PREFIXES) {
    const viewState = studentHoldView(studentState, holdIndex, uPrefix);
    const cornerCase = recognizeCornerCaseInFrdView(
      viewState,
      targetId,
      holdIndex,
    );
    const candidates = buildCandidates(viewState, cornerCase, uPrefix);

    for (const { studentDemo, storageCandidates } of candidates) {
      const verified = verifiedFrdDemoAtHold(
        studentState,
        targetId,
        holdIndex,
        studentDemo,
        solvedCornerIds,
        storageCandidates,
      );
      if (!verified) continue;
      if (!shortest || verified.length < shortest.length) shortest = verified;
    }
  }

  return shortest;
}
