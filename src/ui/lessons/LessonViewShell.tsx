import type { ReactNode } from 'react';
import type { CubeState, Color } from '../../cube/cubeState';
import {
  MoveSequenceDemoProvider,
  useMoveSequenceDemoContext,
} from '../MoveSequenceDemo';
import type { DemoSnapshot } from './lessonDemo';
import { LessonCasePanel } from './LessonCasePanel';
import { LessonCurrentInstruction } from './LessonCurrentInstruction';
import { LessonExampleWorkflow } from './LessonExampleWorkflow';
import { LessonHeader, type SessionNote } from './LessonHeader';
import { LessonCubeStage } from './LessonCubeStage';
import { LessonSecondaryPanels } from './LessonSecondaryPanels';
import { LessonSplitLayout } from './LessonSplitLayout';
import { CubeView } from '../../cube3d/CubeView';
import { LESSON_CUBE_FRAME_CLASS } from './LessonCubeStage';
import type { LessonProgressConfig } from './LessonProgress';

type FaceCenters = {
  F: Color;
  U: Color;
  D: Color;
};

export type LessonViewShellProps = {
  header: {
    title: string;
    subtitle?: string;
    titleClassName?: string;
    progress?: LessonProgressConfig;
    sessionNotesSummary: string;
    sessionNotes: readonly SessionNote[];
    canUndo: boolean;
    isStepPending: boolean;
    onUndo: () => void;
    onRescan: () => void;
    onResetTips: () => void;
    extraSessionActions?: ReactNode;
  };
  step: {
    title: string;
    body?: string;
    dimmed?: boolean;
    caseChildren?: ReactNode;
  };
  cube: {
    isComplete: boolean;
    cubeState: CubeState;
    completeCanvasKey: string;
    visibleDemo: DemoSnapshot | null;
    showPreparingOverlay: boolean;
    preparingSubtitle?: string;
    celebrate?: boolean;
  };
  demo?: {
    canApply: boolean;
    applyLabel: string;
    applyHint?: string;
    onApply: () => void;
    alternateActions?: ReactNode;
  };
  secondary: {
    lessonHold: FaceCenters;
    showOrientationPanel?: boolean;
    showSameHoldNote?: boolean;
    showReorientNote?: boolean;
    orientationExtra?: ReactNode;
    avoidBack?: {
      frontColor: Color;
      avoidBackMoves: boolean;
      onToggleAvoidBack: () => void;
      rememberAvoidBackDefault: boolean;
      onRememberDefaultChange: (on: boolean) => void;
      showRotationCallout: boolean;
      onMarkCalloutSeen: () => void;
      holdNote?: string;
    };
  };
};

function DemoSidebarContent({
  step,
  demo,
  secondary,
  isStepPending,
}: {
  step: LessonViewShellProps['step'];
  demo: NonNullable<LessonViewShellProps['demo']>;
  secondary: LessonViewShellProps['secondary'];
  isStepPending: boolean;
}) {
  const { instructions, instructionIndex } = useMoveSequenceDemoContext();

  return (
    <>
      <LessonCasePanel
        title={step.title}
        body={step.body}
        dimmed={step.dimmed}
      >
        {step.caseChildren}
      </LessonCasePanel>
      {instructions && instructions.length > 0 ? (
        <LessonCurrentInstruction
          instructions={instructions}
          activeIndex={instructionIndex}
        />
      ) : null}
      <LessonExampleWorkflow
        canApply={demo.canApply}
        applyLabel={demo.applyLabel}
        applyHint={demo.applyHint}
        disabled={isStepPending}
        onApply={demo.onApply}
        alternateActions={demo.alternateActions}
      />
      <LessonSecondaryPanels {...secondary} />
    </>
  );
}

function CompleteSidebarContent({
  step,
  demo,
  secondary,
}: {
  step: LessonViewShellProps['step'];
  demo?: LessonViewShellProps['demo'];
  secondary: LessonViewShellProps['secondary'];
}) {
  return (
    <>
      <LessonCasePanel
        title={step.title}
        body={step.body}
        dimmed={step.dimmed}
      >
        {step.caseChildren}
      </LessonCasePanel>
      {demo?.alternateActions ? (
        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
          {demo.alternateActions}
        </section>
      ) : null}
      <LessonSecondaryPanels
        {...secondary}
        showOrientationPanel={false}
      />
    </>
  );
}

function IntroSidebarContent({
  step,
  demo,
  secondary,
}: {
  step: LessonViewShellProps['step'];
  demo: NonNullable<LessonViewShellProps['demo']>;
  secondary: LessonViewShellProps['secondary'];
}) {
  return (
    <>
      <LessonCasePanel
        title={step.title}
        body={step.body}
        dimmed={step.dimmed}
      >
        {step.caseChildren}
      </LessonCasePanel>
      <LessonExampleWorkflow
        canApply={false}
        applyLabel={demo.applyLabel}
        onApply={demo.onApply}
        alternateActions={demo.alternateActions}
      />
      <LessonSecondaryPanels {...secondary} />
    </>
  );
}

export function LessonViewShell({
  header,
  step,
  cube,
  demo,
  secondary,
}: LessonViewShellProps) {
  const isIntroOnly = demo?.alternateActions && !demo.canApply && !cube.isComplete;

  const sidebarForActiveDemo =
    demo && !cube.isComplete && !isIntroOnly ? (
      <DemoSidebarContent
        step={step}
        demo={demo}
        secondary={secondary}
        isStepPending={header.isStepPending}
      />
    ) : null;

  const sidebarForIntro =
    demo && isIntroOnly ? (
      <IntroSidebarContent step={step} demo={demo} secondary={secondary} />
    ) : null;

  const sidebarForComplete = cube.isComplete ? (
    <CompleteSidebarContent step={step} demo={demo} secondary={secondary} />
  ) : null;

  const sidebar =
    sidebarForComplete ?? sidebarForIntro ?? sidebarForActiveDemo ?? null;

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <LessonHeader {...header} />
      {cube.isComplete ? (
        <LessonSplitLayout
          cube={
            <CubeView
              cubeState={cube.cubeState}
              meshRotation={[0, 0, 0]}
              frameClassName={LESSON_CUBE_FRAME_CLASS}
              canvasKey={cube.completeCanvasKey}
              autoRotate={cube.celebrate}
            />
          }
          sidebar={sidebar}
        />
      ) : (
        <MoveSequenceDemoProvider
          baseCubeState={cube.cubeState}
          moves={cube.visibleDemo?.moves ?? []}
          demoSteps={cube.visibleDemo?.demoSteps}
          instructions={cube.visibleDemo?.instructions}
          meshRotation={[0, 0, 0]}
          frameClassName={LESSON_CUBE_FRAME_CLASS}
        >
          <LessonCubeStage
            showPreparingOverlay={cube.showPreparingOverlay}
            preparingSubtitle={cube.preparingSubtitle}
            sidebar={sidebar}
          />
        </MoveSequenceDemoProvider>
      )}
    </section>
  );
}
