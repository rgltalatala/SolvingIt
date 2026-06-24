import type { ReactNode } from 'react';
import type { CubeState } from '../../cube/cubeState';
import { CubeView } from '../../cube3d/CubeView';
import { preparing } from '../../content/tips';
import { MoveSequenceDemo } from '../MoveSequenceDemo';
import type { DemoSnapshot } from './lessonDemo';

type LessonCubeStageProps = {
  isComplete: boolean;
  cubeState: CubeState;
  completeCanvasKey: string;
  visibleDemo: DemoSnapshot | null;
  showPreparingOverlay: boolean;
  preparingSubtitle?: string;
  trailingActions?: ReactNode;
};

export function LessonCubeStage({
  isComplete,
  cubeState,
  completeCanvasKey,
  visibleDemo,
  showPreparingOverlay,
  preparingSubtitle,
  trailingActions,
}: LessonCubeStageProps) {
  if (isComplete) {
    return (
      <CubeView
        cubeState={cubeState}
        meshRotation={[0, 0, 0]}
        frameClassName="h-[420px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
        canvasKey={completeCanvasKey}
      />
    );
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
        trailingActions={trailingActions}
      />
      {showPreparingOverlay ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-950/75 px-4 text-center">
          <p className="text-sm font-semibold text-slate-100">
            {preparing.nextExample}
          </p>
          <p className="text-xs text-slate-400">
            {preparingSubtitle ?? preparing.defaultSubtitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}
