import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Move } from '../../cube/cubeState'
import {
  getAvoidBackDefaultPreference,
  setAvoidBackDefaultPreference,
} from '../../learn/lessonPreferences'
import {
  demoStepsToMoves,
  expandDemoToInstructions,
  getLessonDemoExpansion,
  isBackFaceMove,
  noneHold,
  type DemoStep,
  type Instruction,
} from '../../learn/studentHold'
import { resolveVisibleDemo, type DemoSnapshot } from './lessonDemo'

export type DemoExpansionResult = {
  steps: DemoStep[]
  instructions: Instruction[]
  previewMoves?: Move[]
}

type UseLessonDemoPipelineOptions = {
  demoMoves: Move[]
  stepKey: string
  isLessonComplete: boolean
  isStepPending: boolean
  stepKind?: string | null
  snapshotKeySuffix?: string
  expandDemo?: (moves: Move[], avoidOn: boolean) => DemoExpansionResult
}

export function useLessonDemoPipeline({
  demoMoves,
  stepKey,
  isLessonComplete,
  isStepPending,
  stepKind,
  snapshotKeySuffix = '',
  expandDemo,
}: UseLessonDemoPipelineOptions) {
  const showAvoidBackToggle = useMemo(
    () => demoMoves.some(isBackFaceMove),
    [demoMoves],
  )

  const [avoidBackMoves, setAvoidBackMoves] = useState(false)
  const [rememberAvoidBackDefault, setRememberAvoidBackDefault] = useState(() =>
    getAvoidBackDefaultPreference(),
  )

  useEffect(() => {
    if (showAvoidBackToggle) {
      setAvoidBackMoves(getAvoidBackDefaultPreference())
    } else {
      setAvoidBackMoves(false)
    }
  }, [stepKey, showAvoidBackToggle])

  const avoidOn = avoidBackMoves && showAvoidBackToggle

  const buildExpansion = useCallback(
    (moves: Move[], avoid: boolean): DemoExpansionResult => {
      if (expandDemo) return expandDemo(moves, avoid)
      const expansion = getLessonDemoExpansion(moves, avoid, noneHold())
      return {
        steps: expansion.steps,
        instructions: expandDemoToInstructions(moves, noneHold(), {
          avoidBackMoves: avoid,
        }).instructions,
      }
    },
    [expandDemo],
  )

  const demoExpansion = useMemo(
    () => buildExpansion(demoMoves, avoidOn),
    [buildExpansion, demoMoves, avoidOn],
  )

  const previewMoves = useMemo(
    () => demoExpansion.previewMoves ?? demoStepsToMoves(demoExpansion.steps),
    [demoExpansion],
  )

  const demoInstructions = demoExpansion.instructions

  const demoKey = `${stepKey}-${avoidBackMoves}${snapshotKeySuffix}`
  const [demoSnapshot, setDemoSnapshot] = useState<DemoSnapshot | null>(null)

  useEffect(() => {
    if (stepKind === 'complete') {
      setDemoSnapshot(null)
      return
    }
    if (isStepPending) return
    if (demoMoves.length === 0) {
      setDemoSnapshot(null)
      return
    }
    setDemoSnapshot({
      moves: previewMoves,
      demoSteps: demoExpansion.steps,
      instructions: demoInstructions,
      demoKey,
    })
  }, [
    stepKind,
    isStepPending,
    demoMoves.length,
    previewMoves,
    demoExpansion.steps,
    demoInstructions,
    demoKey,
  ])

  const currentDemo: DemoSnapshot | null = useMemo(
    () =>
      demoMoves.length > 0
        ? {
            moves: previewMoves,
            demoSteps: demoExpansion.steps,
            instructions: demoInstructions,
            demoKey,
          }
        : null,
    [
      demoMoves.length,
      previewMoves,
      demoExpansion.steps,
      demoInstructions,
      demoKey,
    ],
  )

  const visibleDemo = resolveVisibleDemo({
    isLessonComplete,
    isStepPending,
    demoMovesLength: demoMoves.length,
    currentDemo,
    cachedDemo: demoSnapshot,
  })

  const handleRememberDefaultChange = (on: boolean) => {
    setRememberAvoidBackDefault(on)
    setAvoidBackDefaultPreference(on)
    if (on) setAvoidBackMoves(true)
  }

  return {
    visibleDemo,
    showAvoidBackToggle,
    avoidBackMoves,
    setAvoidBackMoves,
    rememberAvoidBackDefault,
    setRememberAvoidBackDefault: handleRememberDefaultChange,
    avoidOn,
    previewMoves,
  }
}
