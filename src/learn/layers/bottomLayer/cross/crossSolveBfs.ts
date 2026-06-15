import { applyMoves } from '../../../../cube/cubeState'
import type { Color, CubeState, Move } from '../../../../cube/cubeState'
import { cubeStateToCubeJsString } from '../../../../cube/cubeStateToFacelets'
import {
  bfsShortestPath,
  bfsShortestPathAsync,
  createDemoCache,
  findVerifiedDemoWithTiers,
  findVerifiedDemoWithTiersAsync,
  registerLessonDemoCache,
} from '../../../lessonCore'
import {
  CROSS_SOLVE_BFS_MOVES,
  crossSlotIdForPartner,
  crossSlotsToPreserve,
  slotSolved,
} from './crossSlotModel'
import type { CrossEdgeId } from './types'

export type SlotSolveSearchOptions = {
  maxDepth?: number
  maxSeen?: number
}

const DEFAULT_SLOT_SEARCH_TIERS: SlotSolveSearchOptions[] = [
  { maxDepth: 16, maxSeen: 80_000 },
  { maxDepth: 22, maxSeen: 160_000 },
  { maxDepth: 28, maxSeen: 400_000 },
]

const VERIFIED_DEMO_CACHE_MAX = 128
const verifiedDemoCache = createDemoCache<string>(VERIFIED_DEMO_CACHE_MAX)

registerLessonDemoCache(() => verifiedDemoCache.clear())

/** Drop cached BFS demos (e.g. when entering a fresh lesson session). */
export function clearVerifiedDemoCache(): void {
  verifiedDemoCache.clear()
}

function verifiedDemoCacheKey(studentState: CubeState, targetId: CrossEdgeId): string {
  return `${cubeStateToCubeJsString(studentState)}:${targetId}`
}

export function preservesSlotsAfterDemo(
  studentState: CubeState,
  demo: Move[],
  mustPreserve: CrossEdgeId[],
): boolean {
  if (demo.length === 0) return false
  const after = applyMoves(studentState, demo)
  return mustPreserve.every((id) => slotSolved(after, id))
}

/** Demo slots the target cross edge and leaves every other solved cross slot solved. */
export function isVerifiedSlotDemo(
  studentState: CubeState,
  targetId: CrossEdgeId,
  demo: Move[],
): boolean {
  if (!demo.length) return false
  const mustPreserve = crossSlotsToPreserve(studentState, targetId)
  const after = applyMoves(studentState, demo)
  return slotSolved(after, targetId) && mustPreserve.every((id) => slotSolved(after, id))
}

export function bfsSolveSlotPreservingOthers(
  studentState: CubeState,
  targetId: CrossEdgeId,
  options: SlotSolveSearchOptions = {},
): Move[] | null {
  const mustPreserve = crossSlotsToPreserve(studentState, targetId)
  return bfsShortestPath(
    studentState,
    (state) =>
      slotSolved(state, targetId) && mustPreserve.every((id) => slotSolved(state, id)),
    {
      moves: CROSS_SOLVE_BFS_MOVES,
      maxDepth: options.maxDepth,
      maxSeen: options.maxSeen,
    },
  )
}

/** Same as {@link bfsSolveSlotPreservingOthers} but yields so the UI thread can stay responsive. */
export async function bfsSolveSlotPreservingOthersAsync(
  studentState: CubeState,
  targetId: CrossEdgeId,
  options: SlotSolveSearchOptions = {},
): Promise<Move[] | null> {
  const mustPreserve = crossSlotsToPreserve(studentState, targetId)
  return bfsShortestPathAsync(
    studentState,
    (state) =>
      slotSolved(state, targetId) && mustPreserve.every((id) => slotSolved(state, id)),
    {
      moves: CROSS_SOLVE_BFS_MOVES,
      maxDepth: options.maxDepth,
      maxSeen: options.maxSeen,
    },
  )
}

export function findVerifiedSlotDemoForCrossId(
  studentState: CubeState,
  targetId: CrossEdgeId,
  searchTiers: SlotSolveSearchOptions[] = DEFAULT_SLOT_SEARCH_TIERS,
): Move[] | null {
  const cacheKey = verifiedDemoCacheKey(studentState, targetId)
  return findVerifiedDemoWithTiers({
    cache: verifiedDemoCache,
    cacheKey,
    searchTiers,
    solveTier: (tier) => bfsSolveSlotPreservingOthers(studentState, targetId, tier),
    verifyDemo: (demo) => isVerifiedSlotDemo(studentState, targetId, demo),
  })
}

export function findVerifiedSlotDemoForPartner(
  studentState: CubeState,
  partner: Color,
): Move[] | null {
  const slotId = crossSlotIdForPartner(studentState, partner)
  if (!slotId) return null
  return findVerifiedSlotDemoForCrossId(studentState, slotId)
}

export async function findVerifiedSlotDemoForCrossIdAsync(
  studentState: CubeState,
  targetId: CrossEdgeId,
  searchTiers: SlotSolveSearchOptions[] = DEFAULT_SLOT_SEARCH_TIERS,
): Promise<Move[] | null> {
  const cacheKey = verifiedDemoCacheKey(studentState, targetId)
  return findVerifiedDemoWithTiersAsync({
    cache: verifiedDemoCache,
    cacheKey,
    searchTiers,
    solveTier: (tier) => bfsSolveSlotPreservingOthersAsync(studentState, targetId, tier),
    verifyDemo: (demo) => isVerifiedSlotDemo(studentState, targetId, demo),
  })
}

export async function findVerifiedSlotDemoForPartnerAsync(
  studentState: CubeState,
  partner: Color,
): Promise<Move[] | null> {
  const slotId = crossSlotIdForPartner(studentState, partner)
  if (!slotId) return null
  return findVerifiedSlotDemoForCrossIdAsync(studentState, slotId)
}
