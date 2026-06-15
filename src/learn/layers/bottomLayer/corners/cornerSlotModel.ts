import type { Color, CubeState, Face } from '../../../../cube/cubeState'
export { formatColor } from '../shared'
import type { CubiePosition } from '../../../../cube3d/cubeGeometry'
import { normalizeHoldToBlue, type CornerHoldIndex } from './cornerHold'
import { CORNER_ORDER, type CornerSlotId } from './types'

export { CORNER_ORDER }

export const CORNER_SLOT_DEF: Record<
  CornerSlotId,
  {
    pos: CubiePosition
    dIndex: number
    sideFaces: [Face, Face]
    sideIndices: [number, number]
  }
> = {
  FRD: { pos: [1, -1, 1], dIndex: 2, sideFaces: ['F', 'R'], sideIndices: [8, 6] },
  BDR: { pos: [1, -1, -1], dIndex: 8, sideFaces: ['B', 'R'], sideIndices: [8, 8] },
  BLD: { pos: [-1, -1, -1], dIndex: 6, sideFaces: ['B', 'L'], sideIndices: [6, 6] },
  FDL: { pos: [-1, -1, 1], dIndex: 0, sideFaces: ['F', 'L'], sideIndices: [6, 6] },
}

const CORNER_LABELS: Record<CornerSlotId, string> = {
  FRD: 'Front–right corner',
  BDR: 'Back–right corner',
  BLD: 'Back–left corner',
  FDL: 'Front–left corner',
}

export function formatCornerLabel(id: CornerSlotId): string {
  return CORNER_LABELS[id]
}

/** Side colors for a lesson corner slot (hold-invariant; uses blue-front reference). */
export function expectedCornerColors(
  studentState: CubeState,
  id: CornerSlotId,
  holdIndex: CornerHoldIndex | number = 0,
): [Color, Color, Color] {
  const slot = CORNER_SLOT_DEF[id]
  const [faceA, faceB] = slot.sideFaces
  const ref = normalizeHoldToBlue(studentState, holdIndex)
  return ['white', ref[faceA][4], ref[faceB][4]]
}

export function cornerSlotSolved(state: CubeState, id: CornerSlotId): boolean {
  const slot = CORNER_SLOT_DEF[id]
  const [faceA, faceB] = slot.sideFaces
  const [indexA, indexB] = slot.sideIndices
  return (
    state.D[slot.dIndex] === 'white' &&
    state[faceA][indexA] === state[faceA][4] &&
    state[faceB][indexB] === state[faceB][4]
  )
}

function isCornerDoneInLesson(
  id: CornerSlotId,
  solvedCornerIds: readonly CornerSlotId[],
): boolean {
  return solvedCornerIds.includes(id)
}

function isCornerDoneForLesson(
  studentState: CubeState,
  id: CornerSlotId,
  solvedCornerIds: readonly CornerSlotId[],
  holdIndex = 0,
): boolean {
  if (isCornerDoneInLesson(id, solvedCornerIds)) return true
  return cornerSlotSolved(normalizeHoldToBlue(studentState, holdIndex), id)
}

export function isWhiteCornersComplete(
  studentState: CubeState,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): boolean {
  if (solvedCornerIds) {
    return CORNER_ORDER.every((id) =>
      isCornerDoneForLesson(studentState, id, solvedCornerIds, holdIndex),
    )
  }
  const normalized = normalizeHoldToBlue(studentState, holdIndex)
  return CORNER_ORDER.every((id) => cornerSlotSolved(normalized, id))
}

export function countSolvedCornerSlots(
  studentState: CubeState,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): number {
  if (solvedCornerIds) {
    return CORNER_ORDER.filter((id) =>
      isCornerDoneForLesson(studentState, id, solvedCornerIds, holdIndex),
    ).length
  }
  const normalized = normalizeHoldToBlue(studentState, holdIndex)
  return CORNER_ORDER.filter((id) => cornerSlotSolved(normalized, id)).length
}

export function activeCornerId(
  studentState: CubeState,
  holdIndex = 0,
  solvedCornerIds?: readonly CornerSlotId[],
): CornerSlotId | null {
  if (solvedCornerIds) {
    for (const id of CORNER_ORDER) {
      if (isCornerDoneForLesson(studentState, id, solvedCornerIds, holdIndex)) continue
      return id
    }
    return null
  }
  const normalized = normalizeHoldToBlue(studentState, holdIndex)
  for (const id of CORNER_ORDER) {
    if (!cornerSlotSolved(normalized, id)) return id
  }
  return null
}

/** Solved slots on the cube at the current lesson hold, excluding the active target. */
export function mustPreserveCornerIds(
  studentState: CubeState,
  exceptId: CornerSlotId,
  holdIndex = 0,
  _solvedCornerIds?: readonly CornerSlotId[],
): CornerSlotId[] {
  const normalized = normalizeHoldToBlue(studentState, holdIndex)
  return CORNER_ORDER.filter(
    (id) => id !== exceptId && cornerSlotSolved(normalized, id),
  )
}
