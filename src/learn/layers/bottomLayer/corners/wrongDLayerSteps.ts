import { applyMoves } from '../../../../cube/cubeState';
import type { CubeState, Face, Move } from '../../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { faceForWhiteOnCorner } from '../shared/pieceQueries';
import type { WrongDLayerSlotId } from './cornerCases';
import { buildShortestVerifiedFrdDemo } from './frdDemoBuilder';
import type { CornerSlotId } from './types';
import { CORNER_ORDER } from './types';
import { FRD_URF_POS, insertMovesFromUrf } from './uLayerSteps';

export const FRD_EXTRACT: Move[] = parseFaceTurnAlgToMoves("R U R' U'");

export const FRD_WRONG_D_SETUP: Record<
  WrongDLayerSlotId,
  { yIn: Move[]; uAlign: Move[]; yOut: Move[] }
> = {
  FRD: { yIn: [], uAlign: [], yOut: [] },
  BDR: { yIn: ['y'], uAlign: ['U'], yOut: ["y'"] },
  BLD: { yIn: ['y2'], uAlign: ['U2'], yOut: ['y2'] },
  FDL: { yIn: ["y'"], uAlign: ["U'"], yOut: ['y'] },
};

/** Face-turn setup in the current hold view: extract → U-align to URF. */
export function setupMovesForWrongDSlotInHoldView(
  dSlot: WrongDLayerSlotId,
): Move[] {
  const { uAlign } = FRD_WRONG_D_SETUP[dSlot];
  return [...FRD_EXTRACT, ...uAlign];
}

/** Blue-front storage setup including y to reach the wrong D slot (hold 0 only). */
export function setupMovesForWrongDSlotStorage(
  dSlot: WrongDLayerSlotId,
): Move[] {
  const { yIn, uAlign, yOut } = FRD_WRONG_D_SETUP[dSlot];
  return [...yIn, ...FRD_EXTRACT, ...yOut, ...uAlign];
}

export function buildFrdWrongDLayerDemo(
  studentState: CubeState,
  _dSlot: WrongDLayerSlotId,
  targetId: CornerSlotId = 'FRD',
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): Move[] | null {
  return buildShortestVerifiedFrdDemo(
    studentState,
    targetId,
    holdIndex,
    solvedCornerIds,
    (viewState, cornerCase, uPrefix) => {
      if (cornerCase.kind !== 'in-wrong-d-slot') return [];

      const dSlotsToTry: WrongDLayerSlotId[] = [
        cornerCase.dSlot,
        ...CORNER_ORDER.filter((id) => id !== cornerCase.dSlot),
      ];

      return dSlotsToTry.flatMap((dSlot) => {
        const setupInView = setupMovesForWrongDSlotInHoldView(dSlot);
        const afterSetup = applyMoves(viewState, setupInView);
        const preferredWhite = faceForWhiteOnCorner(FRD_URF_POS, afterSetup);
        const whiteFacesToTry: Face[] = preferredWhite
          ? [preferredWhite]
          : ['U', 'R', 'F'];

        return whiteFacesToTry.flatMap((whiteFace) => {
          const insert = insertMovesFromUrf(whiteFace);
          if (!insert?.length) return [];

          const studentDemo = [...uPrefix, ...setupInView, ...insert];
          const extraStorage: Move[][] =
            holdIndex === 0 && dSlot !== 'FRD'
              ? [
                  [
                    ...uPrefix,
                    ...setupMovesForWrongDSlotStorage(dSlot),
                    ...insert,
                  ],
                ]
              : [];

          return [{ studentDemo, storageCandidates: extraStorage }];
        });
      });
    },
  );
}
