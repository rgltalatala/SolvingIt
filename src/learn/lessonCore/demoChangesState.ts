import { applyMoves } from '../../cube/cubeState'
import type { CubeState, Move } from '../../cube/cubeState'

/** True when applying a demo actually changes the cube state. */
export function demoChangesState(state: CubeState, demo: readonly Move[]): boolean {
  if (demo.length === 0) return false
  const after = applyMoves(state, demo)
  return JSON.stringify(after) !== JSON.stringify(state)
}
