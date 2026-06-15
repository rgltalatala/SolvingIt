import type { CubeState } from '../../cube/cubeState'
import { CubeView } from '../../cube3d/CubeView'
import { MoveSequenceDemo } from '../MoveSequenceDemo'
import type { DemoSnapshot } from './lessonDemo'
import { LessonPreparingOverlay } from './LessonPreparingOverlay'

type LessonCubeStageProps = {
  isComplete: boolean
  cubeState: CubeState
  completeCanvasKey: string
  visibleDemo: DemoSnapshot | null
  showPreparingOverlay: boolean
  preparingSubtitle?: string
}

export function LessonCubeStage({
  isComplete,
  cubeState,
  completeCanvasKey,
  visibleDemo,
  showPreparingOverlay,
  preparingSubtitle,
}: LessonCubeStageProps) {
  if (isComplete) {
    return (
      <CubeView
        cubeState={cubeState}
        meshRotation={[0, 0, 0]}
        frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
        canvasKey={completeCanvasKey}
      />
    )
  }

  return (
    <div className="relative">
      <MoveSequenceDemo
        baseCubeState={cubeState}
        moves={visibleDemo?.moves ?? []}
        demoSteps={visibleDemo?.demoSteps}
        instructions={visibleDemo?.instructions}
        meshRotation={[0, 0, 0]}
        frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
      />
      {showPreparingOverlay ? (
        <LessonPreparingOverlay subtitle={preparingSubtitle} />
      ) : null}
    </div>
  )
}
