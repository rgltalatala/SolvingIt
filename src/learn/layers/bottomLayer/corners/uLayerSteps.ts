import { applyMoves } from '../../../../cube/cubeState'
import type { CubeState, Face, Move } from '../../../../cube/cubeState'
import type { CubiePosition } from '../../../../cube3d/cubeGeometry'
import { parseFaceTurnAlgToMoves } from '../../../../cube/parseFaceTurnAlg'
import { faceForWhiteOnCorner } from '../shared/pieceQueries'
import type { ULayerCornerId } from './cornerCases'
import { buildShortestVerifiedFrdDemo } from './frdDemoBuilder'
import type { CornerSlotId } from './types'

export const FRD_URF_POS: CubiePosition = [1, 1, 1]

export const FRD_ALIGN_TO_URF: Record<ULayerCornerId, Move[]> = {
  URF: [],
  UBR: parseFaceTurnAlgToMoves('U'),
  ULB: parseFaceTurnAlgToMoves('U2'),
  UFL: parseFaceTurnAlgToMoves("U'"),
}

export const FRD_URF_WHITE_ON_U: Move[] = parseFaceTurnAlgToMoves("R U2 R' U' R U R'")
export const FRD_URF_WHITE_ON_R: Move[] = parseFaceTurnAlgToMoves("R U R'")
export const FRD_URF_WHITE_ON_F: Move[] = parseFaceTurnAlgToMoves("U R U' R'")

const U_LAYER_U_PREFIXES: Move[][] = [[], ['U'], ['U2'], ["U'"]]

export { U_LAYER_U_PREFIXES }

export function alignMovesToUrf(uPosition: ULayerCornerId): Move[] {
  return FRD_ALIGN_TO_URF[uPosition]
}

export function insertMovesFromUrf(whiteOnFace: Face): Move[] | null {
  if (whiteOnFace === 'U') return FRD_URF_WHITE_ON_U
  if (whiteOnFace === 'R') return FRD_URF_WHITE_ON_R
  if (whiteOnFace === 'F') return FRD_URF_WHITE_ON_F
  return null
}

const URF_INSERT_WHITE_FACES: Face[] = ['U', 'R', 'F']

function insertFacesToTry(preferredWhite: Face | null): Face[] {
  if (!preferredWhite) return URF_INSERT_WHITE_FACES
  return [
    preferredWhite,
    ...URF_INSERT_WHITE_FACES.filter((face) => face !== preferredWhite),
  ]
}

export function buildFrdULayerDemo(
  studentState: CubeState,
  _uPosition: ULayerCornerId,
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
      if (cornerCase.kind !== 'in-u-layer') return []

      const align = alignMovesToUrf(cornerCase.uPosition)
      const afterAlign = applyMoves(viewState, align)
      const preferredWhite = faceForWhiteOnCorner(FRD_URF_POS, afterAlign)

      return insertFacesToTry(preferredWhite).flatMap((whiteFace) => {
        const insert = insertMovesFromUrf(whiteFace)
        if (!insert?.length) return []
        return [{ studentDemo: [...uPrefix, ...align, ...insert] }]
      })
    },
  )
}
