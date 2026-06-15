import type { Color, CubeState, Face, Move } from '../../../../cube/cubeState'
import type { CubiePosition } from '../../../../cube3d/cubeGeometry'
export { formatColor } from '../shared'
import { formatColor } from '../shared'
import { findEdgeWithColors, whiteStickerOnD } from '../shared/pieceQueries'
import type { CrossEdgeId } from './types'

export const CROSS_ORDER: CrossEdgeId[] = ['DF', 'DR', 'DB', 'DL']

export const SLOT_DEF: Record<
  CrossEdgeId,
  { pos: CubiePosition; dIndex: number; sideFace: Face; sideIndex: number }
> = {
  DF: { pos: [0, -1, 1], dIndex: 1, sideFace: 'F', sideIndex: 7 },
  DR: { pos: [1, -1, 0], dIndex: 5, sideFace: 'R', sideIndex: 7 },
  DB: { pos: [0, -1, -1], dIndex: 7, sideFace: 'B', sideIndex: 7 },
  DL: { pos: [-1, -1, 0], dIndex: 3, sideFace: 'L', sideIndex: 7 },
}

/** Face quarter turns for shortest cross-edge solve search (setup, connect, slot, undo). */
export const CROSS_SOLVE_BFS_MOVES: Move[] = [
  'U',
  "U'",
  'D',
  "D'",
  'F',
  "F'",
  'B',
  "B'",
  'L',
  "L'",
  'R',
  "R'",
]

export function partnerColorForSlot(studentState: CubeState, id: CrossEdgeId): Color {
  return studentState[SLOT_DEF[id].sideFace][4]
}

export function whitePartnerEdgeHeading(partner: Color): string {
  return `White–${formatColor(partner)} edge`
}

export function slotSolved(state: CubeState, id: CrossEdgeId): boolean {
  const slot = SLOT_DEF[id]
  const center = state[slot.sideFace][4]
  return state.D[slot.dIndex] === 'white' && state[slot.sideFace][slot.sideIndex] === center
}

export function isWhiteCrossComplete(studentState: CubeState): boolean {
  return CROSS_ORDER.every((id) => slotSolved(studentState, id))
}

export function countSolvedCrossSlots(studentState: CubeState): number {
  return CROSS_ORDER.filter((id) => slotSolved(studentState, id)).length
}

export function crossSlotIdForPartner(studentState: CubeState, partner: Color): CrossEdgeId | null {
  for (const id of CROSS_ORDER) {
    if (partnerColorForSlot(studentState, id) === partner) return id
  }
  return null
}

export function crossSlotsSolvedInState(studentState: CubeState): CrossEdgeId[] {
  return CROSS_ORDER.filter((id) => slotSolved(studentState, id))
}

export function crossSlotsToPreserve(studentState: CubeState, exceptId?: CrossEdgeId): CrossEdgeId[] {
  return crossSlotsSolvedInState(studentState).filter((id) => id !== exceptId)
}

export function unsolvedWhiteOnDSlotIds(studentState: CubeState): CrossEdgeId[] {
  return CROSS_ORDER.filter((id) => {
    if (slotSolved(studentState, id)) return false
    const partner = partnerColorForSlot(studentState, id)
    const edgePosition = findEdgeWithColors(studentState, 'white', partner)
    return edgePosition !== null && whiteStickerOnD(studentState, edgePosition)
  })
}

export function slotShowsRotateBottomPattern(studentState: CubeState, id: CrossEdgeId): boolean {
  if (slotSolved(studentState, id)) return false
  const slot = SLOT_DEF[id]
  return (
    studentState.D[slot.dIndex] === 'white' &&
    studentState[slot.sideFace][slot.sideIndex] !== studentState[slot.sideFace][4]
  )
}
