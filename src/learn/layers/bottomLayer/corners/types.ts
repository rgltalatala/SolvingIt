import type { Move } from '../../../../cube/cubeState'

export const CORNER_ORDER = ['FRD', 'BDR', 'BLD', 'FDL'] as const

export type CornerSlotId = (typeof CORNER_ORDER)[number]

export const WHITE_CORNERS_STEP_KINDS = [
  'complete',
  'cross-prerequisite',
  'reorient-hold',
  'solve-corner',
] as const

export type WhiteCornersStepKind = (typeof WHITE_CORNERS_STEP_KINDS)[number]

export type WhiteCornersLessonStep =
  | {
      kind: 'complete'
      title: string
      body: string
      demoMoves?: Move[]
    }
  | {
      kind: 'cross-prerequisite'
      title: string
      body: string
      demoMoves?: Move[]
    }
  | {
      kind: 'reorient-hold'
      title: string
      body: string
      demoMoves: Move[]
      targetCornerId?: CornerSlotId
      returnToInitialHold?: boolean
    }
  | {
      kind: 'solve-corner'
      title: string
      body: string
      cornerId: CornerSlotId
      demoMoves?: Move[]
    }

export interface WhiteCornerLessonStepOptions {
  /** Quarter-turn hold index from blue front: 0=blue, 1=red, 2=green, 3=orange. Default 0. */
  currentHoldIndex?: number
  /** Lesson-order corners already solved this session (hold is view-only; cube is not rotated on reorient). */
  solvedCornerIds?: readonly CornerSlotId[]
}

export interface SimulateWhiteCornersLessonResult {
  lessonStepsSimulated: number
  cornersComplete: boolean
  lastStepKind?: WhiteCornersLessonStep['kind']
  stuckNoDemo: boolean
  finalHoldIndex?: number
}

