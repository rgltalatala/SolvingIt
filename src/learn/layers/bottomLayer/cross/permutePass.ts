import type { CubeState } from '../../../../cube/cubeState'
import { demoChangesState, pickBestPermuteInTier, slotsGainedAfterDemo } from '../../../lessonCore'
import { countSolvedCrossSlots, CROSS_ORDER } from './crossSlotModel'
import {
  collectDLayerInsertPermuteCandidates,
  collectRotateBottomPermuteCandidates,
} from './dLayerSteps'
import { collectMiddleLayerPermuteCandidates } from './middleLayerSteps'
import type { PermuteReadyCandidate, WhiteCrossLessonStep } from './types'
import { PERMUTE_STEP_KIND_TIEBREAK } from './types'

function kindTiebreak(step: WhiteCrossLessonStep): number {
  const kind = step.kind
  if (kind === 'rotate-bottom' || kind === 'side-connect' || kind === 'insert-double') {
    return PERMUTE_STEP_KIND_TIEBREAK[kind]
  }
  return 0
}

function pickBestInTier(
  studentState: CubeState,
  candidates: PermuteReadyCandidate[],
): PermuteReadyCandidate | null {
  return pickBestPermuteInTier({
    studentState,
    candidates,
    countSolved: countSolvedCrossSlots,
    orderIndex: (id) => CROSS_ORDER.indexOf(id),
    kindTiebreak,
    demoChangesState,
  })
}

function slotsGainedForCandidate(
  studentState: CubeState,
  candidate: PermuteReadyCandidate,
): number {
  if (!('demoMoves' in candidate.step) || !candidate.step.demoMoves?.length) return 0
  return slotsGainedAfterDemo(studentState, candidate.step.demoMoves, countSolvedCrossSlots)
}

/**
 * Pedagogy-first permute pass: rotate-bottom → D-layer insert → middle layer.
 * Direct solve and solve-edge stay in computeLessonStep phase 4.
 */
export function tryPermuteReadyPass(studentState: CubeState): WhiteCrossLessonStep | null {
  const tiers: PermuteReadyCandidate[][] = [
    collectRotateBottomPermuteCandidates(studentState),
    collectDLayerInsertPermuteCandidates(studentState),
    collectMiddleLayerPermuteCandidates(studentState),
  ]
  for (const candidates of tiers) {
    const best = pickBestInTier(studentState, candidates)
    if (!best) continue
    // Setup-only middle moves (0 slots gained) fall through to direct solve / solve-edge.
    if (best.step.kind === 'side-connect' && slotsGainedForCandidate(studentState, best) === 0) {
      continue
    }
    return best.step
  }
  return null
}
