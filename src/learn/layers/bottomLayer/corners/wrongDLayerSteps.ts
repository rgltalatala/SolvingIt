import {
  applyMoves,
  compressConsecutiveFaceQuarterTurns,
} from '../../../../cube/cubeState';
import type { CubeState, Move } from '../../../../cube/cubeState';
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg';
import { whiteCornersSteps } from '../../../../content/whiteCorners';
import { faceForWhiteOnCorner } from '../shared/pieceQueries';
import type { WrongDLayerSlotId } from './cornerCases';
import { recognizeCornerCaseInFrdView } from './cornerCases';
import { buildShortestVerifiedFrdDemo } from './frdDemoBuilder';
import type { CornerSlotId } from './types';
import { CORNER_ORDER } from './types';
import {
  alignMovesToUrf,
  FRD_URF_POS,
  insertMovesFromUrf,
  uLayerDemoHasAlignInsertUOverlap,
  urfInsertFacesToTry,
} from './uLayerSteps';

export const FRD_EXTRACT: Move[] = parseFaceTurnAlgToMoves("R U R' U'");

export const FRD_WRONG_D_SETUP: Record<
  WrongDLayerSlotId,
  { yIn: Move[]; yOut: Move[] }
> = {
  FRD: { yIn: [], yOut: [] },
  BDR: { yIn: ['y'], yOut: ["y'"] },
  BLD: { yIn: ['y2'], yOut: ['y2'] },
  FDL: { yIn: ["y'"], yOut: ['y'] },
};

/** Face-turn extract in the current hold view (no URF align yet). */
export function setupMovesForWrongDSlotInHoldView(
  _dSlot: WrongDLayerSlotId,
): Move[] {
  return [...FRD_EXTRACT];
}

/** Blue-front storage extract including y to reach the wrong D slot (hold 0 only). */
export function setupMovesForWrongDSlotStorage(
  dSlot: WrongDLayerSlotId,
): Move[] {
  const { yIn, yOut } = FRD_WRONG_D_SETUP[dSlot];
  return [...yIn, ...FRD_EXTRACT, ...yOut];
}

export function wrongDSlotStepBody(
  cornerLabel: string,
  demo: readonly Move[],
): string {
  const base = whiteCornersSteps.wrongDSlot(cornerLabel);
  return uLayerDemoHasAlignInsertUOverlap(demo)
    ? `${base} ${whiteCornersSteps.uLayerAlignHabitNote}`
    : base;
}

/** Keep extract, URF align, and insert as separate phases when compressing U turns. */
export function compressPedagogicalWrongDDemo(
  extract: readonly Move[],
  align: readonly Move[],
  insert: readonly Move[],
): Move[] {
  return [
    ...compressConsecutiveFaceQuarterTurns([...extract]),
    ...compressConsecutiveFaceQuarterTurns([...align]),
    ...compressConsecutiveFaceQuarterTurns([...insert]),
  ];
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
        const extractInView = setupMovesForWrongDSlotInHoldView(dSlot);
        const extractStorage = setupMovesForWrongDSlotStorage(dSlot);
        const extractForSimulation =
          dSlot === 'FRD' ? extractInView : extractStorage;
        const afterExtract = applyMoves(viewState, extractForSimulation);
        const afterExtractCase = recognizeCornerCaseInFrdView(
          afterExtract,
          targetId,
          holdIndex,
        );
        if (afterExtractCase.kind !== 'in-u-layer') return [];

        const align = alignMovesToUrf(afterExtractCase.uPosition);
        const afterAlign = applyMoves(afterExtract, align);
        const preferredWhite = faceForWhiteOnCorner(FRD_URF_POS, afterAlign);
        const whiteFacesToTry = urfInsertFacesToTry(preferredWhite);

        return whiteFacesToTry.flatMap((whiteFace) => {
          const insert = insertMovesFromUrf(whiteFace);
          if (!insert?.length) return [];

          const studentDemo = [
            ...uPrefix,
            ...compressPedagogicalWrongDDemo(extractInView, align, insert),
          ];
          const extraStorage: Move[][] =
            dSlot !== 'FRD'
              ? [
                  [
                    ...uPrefix,
                    ...compressPedagogicalWrongDDemo(
                      extractStorage,
                      align,
                      insert,
                    ),
                  ],
                ]
              : [];

          return [{ studentDemo, storageCandidates: extraStorage }];
        });
      });
    },
  );
}
