import type { Color, Face, Move } from '../../cube/cubeState'
import { formatColorLabel, studentLessonHoldFaceCenters } from '../../cube/cubeState'
import type { DemoStep } from './expandDemoSteps'
import { FACE_MAP, getFaceFromMove, getModifierFromMove } from './translateMove'
import type { StudentHold, YRotationStep } from './types'

const FACE_POSITION: Record<Face, string> = {
  U: 'top',
  D: 'bottom',
  F: 'front',
  B: 'back',
  L: 'left',
  R: 'right',
}

function invertFaceMap(hold: StudentHold['y']): Record<Face, Face> {
  const map = FACE_MAP[hold]
  const inv = {} as Record<Face, Face>
  for (const app of ['U', 'D', 'F', 'B', 'L', 'R'] as Face[]) {
    inv[map[app]] = app
  }
  return inv
}

/** Center color on each face label in the current y-hold (lesson frame). */
export function centersForHold(hold: StudentHold): Record<Face, Color> {
  const base = studentLessonHoldFaceCenters()
  const inv = invertFaceMap(hold.y)
  const out = {} as Record<Face, Color>
  for (const face of ['U', 'D', 'F', 'B', 'L', 'R'] as Face[]) {
    out[face] = base[inv[face]]
  }
  return out
}

export type RotationCopyPurpose = 'avoidBackStart' | 'returnToInitialHold'

/** Short label for move-sequence chips (includes rotation purpose when avoid-back). */
export function getDemoStepChipLabel(step: DemoStep): string {
  if (step.type === 'move') return step.move
  if (step.purpose === 'avoidBackStart') return 'y2 · start'
  if (step.purpose === 'returnToInitialHold') return 'y2 · return'
  return step.rotation
}

export function getRotationText(
  rotation: YRotationStep,
  purpose?: RotationCopyPurpose,
): string {
  if (purpose === 'avoidBackStart') {
    return 'Rotate the whole cube 180° (y2) first — the Back face comes to the front so you never turn B directly.'
  }
  if (purpose === 'returnToInitialHold') {
    const blue = formatColorLabel(studentLessonHoldFaceCenters().F)
    return `Rotate the whole cube 180° (y2) again so ${blue} is on front — return to your usual lesson hold.`
  }

  switch (rotation) {
    case 'y2':
      return 'Rotate the whole cube so the Back face is now facing you'
    case 'y':
      return 'Rotate the whole cube to the left so the Right face is now facing you'
    case "y'":
      return 'Rotate the whole cube to the right so the Left face is now facing you'
    default:
      return `Rotate the whole cube (${rotation})`
  }
}


export function getMoveText(move: Move, hold: StudentHold): string {
  const face = getFaceFromMove(move)
  const modifier = getModifierFromMove(move)
  const color = formatColorLabel(centersForHold(hold)[face])
  const position = FACE_POSITION[face]
  if (modifier === '2') {
    return `Turn the ${color} (${position}) face 180° (${face}2)`
  }
  if (modifier === "'") {
    return `Turn the ${color} (${position}) face counterclockwise (${face}′)`
  }
  return `Turn the ${color} (${position}) face clockwise (${face})`
}
