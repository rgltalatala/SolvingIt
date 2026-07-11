import type { ReactNode } from 'react';
import { preparing } from '../../content/tips';
import { MoveSequenceDemoCube } from '../MoveSequenceDemo';
import { LessonSplitLayout } from './LessonSplitLayout';

export const LESSON_CUBE_FRAME_CLASS =
  'h-[320px] w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-950 lg:h-[480px]';

type LessonCubeStageProps = {
  showPreparingOverlay: boolean;
  preparingSubtitle?: string;
  sidebar: ReactNode;
};

function LessonCubeColumn({
  children,
  showPreparingOverlay,
  preparingSubtitle,
}: {
  children: ReactNode;
  showPreparingOverlay: boolean;
  preparingSubtitle?: string;
}) {
  return (
    <div className="relative">
      {children}
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

/** Cube-only left column; sidebar rendered by LessonViewShell inside the demo provider. */
export function LessonCubeStage({
  showPreparingOverlay,
  preparingSubtitle,
  sidebar,
}: LessonCubeStageProps) {
  return (
    <LessonSplitLayout
      cube={
        <LessonCubeColumn
          showPreparingOverlay={showPreparingOverlay}
          preparingSubtitle={preparingSubtitle}
        >
          <MoveSequenceDemoCube />
        </LessonCubeColumn>
      }
      sidebar={sidebar}
    />
  );
}
